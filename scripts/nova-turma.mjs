#!/usr/bin/env node
/**
 * Nova Turma — Semana do Despertar
 *
 * Uso:
 *   node scripts/nova-turma.mjs init 39      → cria config template para turma #39
 *   node scripts/nova-turma.mjs build 39     → gera todos os arquivos
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const CAPTURE_ROOT = join(__dirname, '..')

// Detecta automaticamente onde fica a área de membros
const MEMBROS_CANDIDATES = [
  join(__dirname, '..', '..', 'areademembros'),
  join(__dirname, '..', '..', 'Area-de-Membors'),
  join(__dirname, '..', '..', 'area-de-membros'),
]
const MEMBROS_ROOT = MEMBROS_CANDIDATES.find(p => existsSync(p))

const [,, command, arg] = process.argv

if (!command || command === '--help') {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Nova Turma — Semana do Despertar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Passo 1 — cria o config:
    node scripts/nova-turma.mjs init 39

  Passo 2 — preencha scripts/configs/turma-39.json

  Passo 3 — gera todos os arquivos:
    node scripts/nova-turma.mjs build 39
`)
  process.exit(0)
}

// ────────────────────────────────────────────────────────────────────────────
// INIT — cria template de configuração
// ────────────────────────────────────────────────────────────────────────────
if (command === 'init') {
  const num = arg
  if (!num) { console.error('Informe o número da turma. Ex: node scripts/nova-turma.mjs init 39'); process.exit(1) }

  const configDir  = join(__dirname, 'configs')
  const configPath = join(configDir, `turma-${num}.json`)

  if (existsSync(configPath)) {
    console.log(`⚠️  Config já existe: ${configPath}`)
    console.log('    Edite o arquivo existente ou apague-o para recriar.')
    process.exit(0)
  }

  const template = {
    "_instrucoes": "Preencha todos os campos marcados com ??? antes de rodar o build",
    "num": num,
    "datas": "??, ?? e ?? de Mês",
    "cert_unlock_utc": "2026-??-??T01:00:00Z",
    "cert_data_br": "??/?? às 22h",
    "grupo_url": "https://chat.whatsapp.com/???",
    "lancamento_id": "uuid-do-crm",
    "campanha_pm": "uuid-campanha-pm-do-crm",
    "campanha_ig": "uuid-campanha-ig-do-crm",
    "sheets_webhook_url": "",
    "aulas": [
      {
        "titulo": "Aula 1 — A Raiz dos Seus Padrões",
        "url": "https://youtube.com/live/???",
        "data_br": "??/?? · ??-feira",
        "gcal_inicio": "2026??T230000Z",
        "gcal_fim": "2026??T010000Z"
      },
      {
        "titulo": "Aula 2 — Reprogramando o Inconsciente",
        "url": "https://youtube.com/live/???",
        "data_br": "??/?? · ??-feira",
        "gcal_inicio": "2026??T230000Z",
        "gcal_fim": "2026??T010000Z"
      },
      {
        "titulo": "Aula 3 — Transformação em Ação",
        "url": "https://youtube.com/live/???",
        "data_br": "??/?? · ??-feira",
        "gcal_inicio": "2026??T230000Z",
        "gcal_fim": "2026??T010000Z"
      }
    ]
  }

  writeFileSync(configPath, JSON.stringify(template, null, 2) + '\n', 'utf-8')

  console.log(`
✅ Config criado em: scripts/configs/turma-${num}.json

📝 Preencha o arquivo com as informações da Turma #${num}:
   - datas          → ex: "23, 24 e 25 de Junho"
   - cert_unlock_utc → 22h BRT do último dia = 01h UTC do dia seguinte
   - cert_data_br   → ex: "25/06 às 22h"
   - grupo_url      → link do grupo VIP do WhatsApp
   - lancamento_id  → UUID do lançamento no CRM (criar primeiro no CRM)
   - campanha_pm/ig → UUIDs das campanhas WPP (criar no CRM após o lançamento)
   - aulas[].url    → links do YouTube Live (pode deixar como ??? e atualizar depois)
   - aulas[].data_br → "23/06 · Segunda-feira"
   - aulas[].gcal_* → datas ISO para Google Calendar (23 de Junho 20h BRT = 20260623T230000Z)

Após preencher, execute:
   node scripts/nova-turma.mjs build ${num}
`)
  process.exit(0)
}

// ────────────────────────────────────────────────────────────────────────────
// BUILD — gera todos os arquivos
// ────────────────────────────────────────────────────────────────────────────
if (command === 'build') {
  const num = arg
  if (!num) { console.error('Informe o número da turma. Ex: node scripts/nova-turma.mjs build 39'); process.exit(1) }

  const configPath = join(__dirname, 'configs', `turma-${num}.json`)
  if (!existsSync(configPath)) {
    console.error(`❌ Config não encontrado: ${configPath}`)
    console.error(`   Execute primeiro: node scripts/nova-turma.mjs init ${num}`)
    process.exit(1)
  }

  const cfg = JSON.parse(readFileSync(configPath, 'utf-8'))
  const N   = cfg.num

  // Valida campos obrigatórios
  const obrigatorios = [
    ['datas', cfg.datas],
    ['cert_unlock_utc', cfg.cert_unlock_utc],
    ['grupo_url', cfg.grupo_url],
    ['lancamento_id', cfg.lancamento_id],
  ]
  const invalidos = obrigatorios.filter(([, v]) => !v || v.includes('?'))
  if (invalidos.length > 0) {
    console.error('\n❌ Campos obrigatórios não preenchidos:')
    invalidos.forEach(([k]) => console.error(`   • ${k}`))
    console.error(`\n   Edite: scripts/configs/turma-${N}.json\n`)
    process.exit(1)
  }

  // Avisa sobre campos opcionais vazios
  if (cfg.aulas.some(a => a.url.includes('?'))) {
    console.log('⚠️  URLs do YouTube ainda com ??? — você pode preencher depois no arquivo gerado.')
  }
  if (!cfg.campanha_pm || cfg.campanha_pm.includes('?')) {
    console.log('⚠️  campanha_pm/ig não definida — atualize crm-lead.ts após criar as campanhas no CRM.')
  }

  console.log(`\n🔧 Gerando estrutura para Turma #${N}...\n`)

  const ytId = (url) => url.match(/live\/([a-zA-Z0-9_-]+)/)?.[1] ?? url

  // IDs das aulas da turma 38 (base de substituição)
  const BASE_YT_IDS = ['VvmEH5LlC_0', 'NxnyXcM7WXE', 'hiBJtMBPgu0']
  const BASE_AULA_DATAS = ['16/06 · Terça-feira', '17/06 · Quarta-feira', '18/06 · Quinta-feira']
  const BASE_GCAL = [
    { inicio: '20260616T230000Z', fim: '20260617T010000Z' },
    { inicio: '20260617T230000Z', fim: '20260618T010000Z' },
    { inicio: '20260618T230000Z', fim: '20260619T010000Z' },
  ]

  // ── A) ÁREA DE MEMBROS — SemanaDespertar{N}.tsx ───────────────────────────

  if (!MEMBROS_ROOT) {
    console.error('❌ Pasta da área de membros não encontrada. Certifique-se de que areademembros está na mesma pasta que gratuito-38.')
    process.exit(1)
  }

  const sdw38Path = join(MEMBROS_ROOT, 'src', 'app', '(member)', 'lancamento', 'SemanaDespertar38.tsx')
  let sdwContent = readFileSync(sdw38Path, 'utf-8')

  // Substituições globais
  sdwContent = sdwContent
    .replace(/SemanaDespertar38/g, `SemanaDespertar${N}`)
    .replace(/sdw38_progress/g, `sdw${N}_progress`)
    .replace(/SDW #38/g, `SDW #${N}`)
    .replace(/Semana do Despertar #38/g, `Semana do Despertar #${N}`)
    .replace(/'#38'/g, `'#${N}'`)
    .replace(/"#38"/g, `"#${N}"`)
    .replace(/sdw38-aula/g, `sdw${N}-aula`)
    .replace(
      /const WA_GROUP_URL\s*=\s*'[^']*'/,
      `const WA_GROUP_URL   = '${cfg.grupo_url}'`
    )
    .replace(
      /const CERT_UNLOCK = new Date\('[^']*'\)/,
      `const CERT_UNLOCK = new Date('${cfg.cert_unlock_utc}')`
    )
    .replace(/18\/06 às 22h/g, cfg.cert_data_br)
    .replace(/16, 17 e 18 de Junho\./g, `${cfg.datas}.`)
    .replace(/16, 17 e 18 de Junho/g, cfg.datas)

  // Substituir títulos e datas de cada aula
  cfg.aulas.forEach((aula, i) => {
    const newId = ytId(aula.url)
    const oldId = BASE_YT_IDS[i]

    if (aula.titulo) {
      const tituloVelho = ['A Raiz dos Seus Padrões', 'Reprogramando o Inconsciente', 'Transformação em Ação'][i]
      sdwContent = sdwContent.replace(tituloVelho, aula.titulo.replace(/^Aula \d+ — /, ''))
    }

    if (newId && !newId.includes('?') && oldId !== newId) {
      sdwContent = sdwContent.replace(new RegExp(oldId, 'g'), newId)
    }

    if (aula.data_br && !aula.data_br.includes('?')) {
      sdwContent = sdwContent.replace(BASE_AULA_DATAS[i], aula.data_br)
    }

    if (aula.gcal_inicio && !aula.gcal_inicio.includes('?')) {
      sdwContent = sdwContent.replace(BASE_GCAL[i].inicio, aula.gcal_inicio)
    }
    if (aula.gcal_fim && !aula.gcal_fim.includes('?')) {
      sdwContent = sdwContent.replace(BASE_GCAL[i].fim, aula.gcal_fim)
    }
  })

  const sdwNPath = join(MEMBROS_ROOT, 'src', 'app', '(member)', 'lancamento', `SemanaDespertar${N}.tsx`)
  writeFileSync(sdwNPath, sdwContent, 'utf-8')
  console.log(`✅ Criado:     ${sdwNPath.replace(MEMBROS_ROOT, 'areademembros')}`)

  // ── B) ÁREA DE MEMBROS — semanadodespertar-{N}/[code]/page.tsx ────────────

  const sdw38PagePath = join(MEMBROS_ROOT, 'src', 'app', '(member)', 'semanadodespertar-38', '[code]', 'page.tsx')
  let sdwPageContent = readFileSync(sdw38PagePath, 'utf-8')
  sdwPageContent = sdwPageContent
    .replace(/SemanaDespertar38/g, `SemanaDespertar${N}`)
    .replace(/semanadodespertar-38/g, `semanadodespertar-${N}`)

  const sdwNPageDir  = join(MEMBROS_ROOT, 'src', 'app', '(member)', `semanadodespertar-${N}`, '[code]')
  mkdirSync(sdwNPageDir, { recursive: true })
  const sdwNPagePath = join(sdwNPageDir, 'page.tsx')
  writeFileSync(sdwNPagePath, sdwPageContent, 'utf-8')
  console.log(`✅ Criado:     ${sdwNPagePath.replace(MEMBROS_ROOT, 'areademembros')}`)

  // ── C) ÁREA DE MEMBROS — atualiza lancamento/page.tsx ────────────────────

  const lancPagePath = join(MEMBROS_ROOT, 'src', 'app', '(member)', 'lancamento', 'page.tsx')
  let lancContent = readFileSync(lancPagePath, 'utf-8')

  // Detecta turma atual no arquivo (ex: SemanaDespertar38 → SemanaDespertar39)
  const matchAtual = lancContent.match(/SemanaDespertar(\d+)/)
  const numAtual   = matchAtual ? matchAtual[1] : '38'

  lancContent = lancContent.replace(new RegExp(`SemanaDespertar${numAtual}`, 'g'), `SemanaDespertar${N}`)
  writeFileSync(lancPagePath, lancContent, 'utf-8')
  console.log(`✅ Atualizado: areademembros/src/app/(member)/lancamento/page.tsx  (#${numAtual} → #${N})`)

  // ── D) CAPTURA — gera arquivos modificados em scripts/output/turma-{N}/ ──

  const outputDir = join(CAPTURE_ROOT, 'scripts', 'output', `turma-${N}`)
  mkdirSync(join(outputDir, 'src', 'components'), { recursive: true })
  mkdirSync(join(outputDir, 'api'), { recursive: true })

  // HeroSection.tsx
  const heroPath   = join(CAPTURE_ROOT, 'src', 'components', 'HeroSection.tsx')
  let heroContent  = readFileSync(heroPath, 'utf-8')

  heroContent = heroContent
    .replace(/TURMA #38/g, `TURMA #${N}`)
    .replace(/DIAS 16, 17 E 18 DE JUNHO/g, `DIAS ${cfg.datas.toUpperCase()}`)
    .replace(/16, 17 e 18 de Junho\./g, `${cfg.datas}.`)
    .replace(/16, 17 e 18 de Junho/g, cfg.datas)
    .replace(/sheet_leads_38/g, `sheet_leads_${N}`)
    .replace(/semanadodespertar-38/g, `semanadodespertar-${N}`)

  writeFileSync(join(outputDir, 'src', 'components', 'HeroSection.tsx'), heroContent, 'utf-8')

  // crm-lead.ts
  const crmPath   = join(CAPTURE_ROOT, 'api', 'crm-lead.ts')
  let crmContent  = readFileSync(crmPath, 'utf-8')

  crmContent = crmContent.replace(/funnel_name: 'Turma #38'/g, `funnel_name: 'Turma #${N}'`)

  if (cfg.campanha_pm && !cfg.campanha_pm.includes('?')) {
    crmContent = crmContent.replace(
      /const campanhasPM = '[^']*'/,
      `const campanhasPM = '${cfg.campanha_pm}'`
    )
  }
  if (cfg.campanha_ig && !cfg.campanha_ig.includes('?')) {
    crmContent = crmContent.replace(
      /const campanhasIG = '[^']*'/,
      `const campanhasIG = '${cfg.campanha_ig}'`
    )
  }

  writeFileSync(join(outputDir, 'api', 'crm-lead.ts'), crmContent, 'utf-8')
  console.log(`✅ Gerado:     scripts/output/turma-${N}/  (HeroSection.tsx + crm-lead.ts)`)

  // ── SAÍDA FINAL ────────────────────────────────────────────────────────────

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  TURMA #${N} GERADA

📋  VARIÁVEIS DE AMBIENTE — Vercel gratuito-${N}:
────────────────────────────────────────────────────────────
LANCAMENTO_ID          = ${cfg.lancamento_id}
MEMBERS_AREA_URL       = https://www.idmpsi.com.br
MEMBERS_AREA_API_KEY   = [mesmo valor do CRIAR_USUARIO_API_KEY da área de membros]
VITE_MEMBERS_AREA_URL  = https://www.idmpsi.com.br
CRM_SUPABASE_URL       = [mesmo da turma 38]
CRM_SUPABASE_SERVICE_KEY = [mesmo da turma 38]
VITE_SUPABASE_URL      = [mesmo da turma 38]
VITE_SUPABASE_ANON_KEY = [mesmo da turma 38]
META_ACCESS_TOKEN      = [mesmo da turma 38]
SHEETS_WEBHOOK_URL     = ${cfg.sheets_webhook_url || '[preencher quando o Sheets estiver pronto]'}

📋  PRÓXIMOS PASSOS:
────────────────────────────────────────────────────────────
CAPTURA (gratuito-${N}):
  1. Crie o repo gratuito-${N} no GitHub (fork de gratuito-38)
  2. Substitua estes 2 arquivos no novo repo:
       scripts/output/turma-${N}/src/components/HeroSection.tsx
       scripts/output/turma-${N}/api/crm-lead.ts
  3. Conecte ao Vercel e configure as env vars acima
  4. Configure domínio: turma${N}.semanadodespertar.online

ÁREA DE MEMBROS:
  5. cd areademembros
  6. git add . && git commit -m "feat: adiciona Semana do Despertar #${N}" && git push

CRM:
  7. Crie campanhas WPP PM e IG para a Turma #${N}
  8. Atualize scripts/configs/turma-${N}.json com os IDs das campanhas
  9. Rode: node scripts/nova-turma.mjs build ${N}  (para atualizar crm-lead.ts)
 10. Push novamente no gratuito-${N}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  process.exit(0)
}

console.error(`Comando inválido: "${command}". Use "init" ou "build".`)
process.exit(1)
