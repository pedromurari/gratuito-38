// Vercel Serverless Function — Registra lead no CRM e cria usuário na área de membros

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const crmUrl = process.env.CRM_SUPABASE_URL;
  const crmKey = process.env.CRM_SUPABASE_SERVICE_KEY;
  const lancamentoId = process.env.LANCAMENTO_ID;

  if (!crmUrl || !crmKey || !lancamentoId) {
    console.error('Variáveis de ambiente do CRM não configuradas');
    return new Response(JSON.stringify({ error: 'Configuração incompleta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { nome, email, whatsapp, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = await req.json();

    const now = new Date().toISOString();
    const phoneClean = whatsapp.replace(/\D/g, '');

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
            const p = new URLSearchParams({ nome, email, whatsapp });
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
    console.log('[GAS]', gasResult.status, gasResult.status === 'fulfilled' && gasResult.value ? `status:${(gasResult.value as Response)?.status}` : (gasResult as PromiseRejectedResult).reason ?? '');
    console.log('[DISPARO]', disparoResult.status);
    console.log('[BOAS-VINDAS]', boasVindasResult.status);

    // CRM insert falhou → erro crítico
    if (crmResult.status === 'rejected') {
      return new Response(JSON.stringify({ error: 'Erro ao salvar no CRM' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const crmResponse = (crmResult as PromiseFulfilledResult<Response>).value;
    if (!crmResponse.ok) {
      const errorText = await crmResponse.text();
      console.error('CRM insert falhou:', errorText);
      return new Response(JSON.stringify({ error: 'Erro ao salvar no CRM' }), {
        status: crmResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const loginUrl: string | null =
      userResult.status === 'fulfilled' && userResult.value?.loginUrl
        ? userResult.value.loginUrl
        : null;

    console.log('[LOGIN_URL]', loginUrl ?? 'null — lead irá para /login');

    return new Response(JSON.stringify({ success: true, loginUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função crm-lead:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
