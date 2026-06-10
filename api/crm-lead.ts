// Vercel Edge Function — Registra lead na tabela lancamento_leads do CRM

export const config = {
  runtime: 'edge',
};

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

    const response = await fetch(`${crmUrl}/rest/v1/lancamento_leads`, {
      method: 'POST',
      headers: {
        apikey: crmKey,
        Authorization: `Bearer ${crmKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lancamento_id: lancamentoId,
        nome,
        email,
        whatsapp,
        fase: 'planilha',
        crm: false,
        data_entrada: now,
        ultima_atividade: now,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao inserir lead no CRM:', errorText);
      return new Response(JSON.stringify({ error: 'Erro ao salvar no CRM' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Salvar lead no Google Sheets via GAS — awaited para garantir execução na Edge
    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    if (sheetsUrl) {
      const p = new URLSearchParams({ nome, email, whatsapp });
      if (utm_source)   p.set('utm_source',   utm_source);
      if (utm_medium)   p.set('utm_medium',   utm_medium);
      if (utm_campaign) p.set('utm_campaign', utm_campaign);
      if (utm_content)  p.set('utm_content',  utm_content);
      if (utm_term)     p.set('utm_term',     utm_term);
      try {
        const gasRes = await fetch(`${sheetsUrl}?${p.toString()}`, { method: 'GET' });
        console.log('[GAS] status:', gasRes.status);
      } catch (err) {
        console.error('[GAS] erro:', err);
      }
    } else {
      console.warn('[GAS] SHEETS_WEBHOOK_URL não configurado');
    }

    // Adiciona lead na campanha de disparo — alterna PM e IG a cada registro
    const campanhasPM = 'a3a93708-fe8b-48f2-a2e2-aa2f951b0df4';
    const campanhasIG = '0090fc04-3894-4cec-a8ca-ebe6065bee25';
    const disparoCampanhaId = Date.now() % 2 === 0 ? campanhasPM : campanhasIG;
    const phoneClean = whatsapp.replace(/\D/g, '');
    fetch(`${crmUrl}/rest/v1/disparo_leads`, {
      method: 'POST',
      headers: {
        apikey: crmKey,
        Authorization: `Bearer ${crmKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        campanha_id: disparoCampanhaId,
        nome,
        phone: phoneClean,
        status: 'pendente',
        ordem: Date.now(),
      }),
    }).catch((err) => console.error('Erro ao adicionar lead no disparo:', err));

    // Criar usuário na Área de Membros e obter loginUrl para auto-login
    const membersUrl = process.env.MEMBERS_AREA_URL;
    const membersKey = process.env.MEMBERS_AREA_API_KEY;
    let loginUrl: string | null = null;
    if (membersUrl && membersKey) {
      try {
        const membersRes = await fetch(`${membersUrl}/api/criar-usuario`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${membersKey}`,
          },
          body: JSON.stringify({ email, nome, whatsapp }),
        });
        const membersData = await membersRes.json();
        loginUrl = membersData?.loginUrl ?? null;
      } catch (err) {
        console.error('Erro ao criar usuário na área de membros:', err);
      }
    }

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
