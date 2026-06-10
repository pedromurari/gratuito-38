// Vercel Serverless Function — Registra lead no CRM e cria usuário na área de membros
// Usa formato (req, res) porque o runtime Node.js não suporta Web API handler (req.json)

export const config = {
  maxDuration: 10,
};

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout:${label}`)), ms)
    ),
  ]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const crmUrl = process.env.CRM_SUPABASE_URL;
  const crmKey = process.env.CRM_SUPABASE_SERVICE_KEY;
  const lancamentoId = process.env.LANCAMENTO_ID;

  if (!crmUrl || !crmKey || !lancamentoId) {
    console.error('Variáveis de ambiente do CRM não configuradas');
    res.status(500).json({ error: 'Configuração incompleta' });
    return;
  }

  try {
    const { nome, email, whatsapp, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = req.body;

    const now = new Date().toISOString();
    const phoneClean = (whatsapp ?? '').replace(/\D/g, '');

    // ── Operações críticas em paralelo ───────────────────────────────────────
    const membersUrl = process.env.MEMBERS_AREA_URL;
    const membersKey = process.env.MEMBERS_AREA_API_KEY;

    const crmPromise = withTimeout(
      fetch(`${crmUrl}/rest/v1/lancamento_leads`, {
        method: 'POST',
        headers: {
          apikey: crmKey,
          Authorization: `Bearer ${crmKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lancamento_id: lancamentoId,
          nome, email, whatsapp,
          fase: 'planilha', crm: false,
          data_entrada: now, ultima_atividade: now,
        }),
      }),
      3000,
      'crm-insert'
    );

    const userPromise = (membersUrl && membersKey)
      ? withTimeout(
          fetch(`${membersUrl}/api/criar-usuario`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${membersKey}`,
            },
            body: JSON.stringify({ email, nome, whatsapp }),
          }).then((r) => r.json()),
          4000,
          'criar-usuario'
        )
      : Promise.resolve(null);

    // ── Operações secundárias em paralelo ────────────────────────────────────
    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    const gasPromise = sheetsUrl
      ? withTimeout(
          (() => {
            const p = new URLSearchParams({ nome: nome ?? '', email: email ?? '', whatsapp: whatsapp ?? '' });
            if (utm_source)   p.set('utm_source',   utm_source);
            if (utm_medium)   p.set('utm_medium',   utm_medium);
            if (utm_campaign) p.set('utm_campaign', utm_campaign);
            if (utm_content)  p.set('utm_content',  utm_content);
            if (utm_term)     p.set('utm_term',     utm_term);
            return fetch(`${sheetsUrl}?${p.toString()}`, { method: 'GET' });
          })(),
          4000,
          'gas'
        )
      : Promise.resolve(null);

    const campanhasPM = 'd2d1f819-c30e-428f-9f90-961d7f6d9ad1';
    const campanhasIG = 'b1a88730-7197-40b0-819b-5d6869057225';
    const disparoCampanhaId = Date.now() % 2 === 0 ? campanhasPM : campanhasIG;

    const disparoPromise = withTimeout(
      fetch(`${crmUrl}/rest/v1/disparo_leads`, {
        method: 'POST',
        headers: {
          apikey: crmKey,
          Authorization: `Bearer ${crmKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ campanha_id: disparoCampanhaId, nome, phone: phoneClean, status: 'pendente', ordem: Date.now() }),
      }),
      3000,
      'disparo'
    );

    const boasVindasPromise = withTimeout(
      fetch(`${crmUrl}/functions/v1/boas-vindas-enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: crmKey },
        body: JSON.stringify({ funnel_name: 'Turma #38', nome, email, whatsapp }),
      }),
      4000,
      'boas-vindas'
    );

    // ── Aguarda tudo em paralelo ──────────────────────────────────────────────
    const [crmResult, userResult, gasResult, disparoResult, boasVindasResult] =
      await Promise.allSettled([crmPromise, userPromise, gasPromise, disparoPromise, boasVindasPromise]);

    // Log de status
    console.log('[CRM]', crmResult.status, crmResult.status === 'rejected' ? (crmResult as PromiseRejectedResult).reason : '');
    console.log('[USER]', userResult.status, userResult.status === 'rejected' ? (userResult as PromiseRejectedResult).reason : '');
    console.log('[GAS]', gasResult.status, gasResult.status === 'fulfilled' && (gasResult as PromiseFulfilledResult<Response | null>).value ? `status:${((gasResult as PromiseFulfilledResult<Response>).value)?.status}` : (gasResult.status === 'rejected' ? (gasResult as PromiseRejectedResult).reason : ''));
    console.log('[DISPARO]', disparoResult.status);
    console.log('[BOAS-VINDAS]', boasVindasResult.status);

    // CRM insert falhou → erro crítico
    if (crmResult.status === 'rejected') {
      res.status(500).json({ error: 'Erro ao salvar no CRM' });
      return;
    }

    const crmResponse = (crmResult as PromiseFulfilledResult<Response>).value;
    if (!crmResponse.ok) {
      console.error('CRM insert falhou com status:', crmResponse.status);
      res.status(crmResponse.status).json({ error: 'Erro ao salvar no CRM' });
      return;
    }

    const loginUrl: string | null =
      userResult.status === 'fulfilled' && (userResult as PromiseFulfilledResult<{ loginUrl?: string } | null>).value?.loginUrl
        ? (userResult as PromiseFulfilledResult<{ loginUrl: string }>).value.loginUrl
        : null;

    console.log('[LOGIN_URL]', loginUrl ?? 'null — lead irá para /login');

    res.status(200).json({ success: true, loginUrl });
  } catch (error) {
    console.error('Erro na função crm-lead:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}
