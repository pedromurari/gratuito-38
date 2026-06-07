
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nome, email, whatsapp } = await req.json()

    console.log('Dados recebidos:', { nome, email, whatsapp })

    // Validate required fields
    if (!nome || !email || !whatsapp) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Enviando dados para o Supabase...')

    // Get additional request data
    const userAgent = req.headers.get('user-agent') || ''
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    
    // Prepare data for insertion
    const leadData = {
      nome,
      email,
      telefone: whatsapp,
      ip: clientIP,
      page_url: req.headers.get('referer') || '',
      user_agent: userAgent,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      extra: null
    }

    console.log('Dados a serem inseridos:', leadData)

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()

    if (error) {
      console.error('Erro ao inserir no Supabase:', error)
      throw error
    }

    console.log('Dados inseridos com sucesso no Supabase:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados enviados com sucesso!',
        redirectUrl: 'https://institutodespertamente.site/obrigado24'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: 'Houve um problema ao processar sua solicitação. Tente novamente.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
