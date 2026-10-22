// Génère les PDF de la documentation à partir des fichiers Markdown de docs/ (SCRUM-26).
// Les PDF ne se modifient jamais à la main : changer le .md, puis relancer `npm run docs:pdf`.
// Impression avec Edge ou Chrome en mode headless (navigateur indiqué par DOCS_NAVIGATEUR si besoin).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { marked } from 'marked'

const DOCUMENTS = [
  { source: 'docs/documentation-technique.md', pdf: 'docs/pdf/documentation-technique.pdf', taille: '9.6pt' },
  { source: 'docs/guide-utilisateur.md', pdf: 'docs/pdf/guide-utilisateur.pdf', taille: '10pt' },
]

const NAVIGATEURS = [
  process.env.DOCS_NAVIGATEUR,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

// Mise en page A4 sobre, aux couleurs de Duo (rose de la marque, or pour ce qui est offert)
const style = (taille) => `
  @page { size: A4; margin: 14mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: ${taille};
         line-height: 1.42; color: #1c1d26; margin: 0; }
  h1 { font-size: 1.9em; color: #be123c; margin: 0 0 0.35em; letter-spacing: -0.5px; }
  h2 { font-size: 1.22em; color: #be123c; margin: 1em 0 0.35em; padding-bottom: 2px;
       border-bottom: 1.5px solid #fec8d1; break-after: avoid; }
  h3 { font-size: 1.05em; margin: 0.9em 0 0.25em; break-after: avoid; }
  p, ul, ol { margin: 0.3em 0; }
  ul, ol { padding-left: 1.3em; }
  li { margin: 0.12em 0; }
  table { width: 100%; border-collapse: collapse; margin: 0.4em 0; break-inside: avoid; }
  th, td { border: 1px solid #e8e8ee; padding: 3px 6px; text-align: left; vertical-align: top; }
  th { background: #fff1f3; color: #be123c; }
  code { font-family: Consolas, 'SFMono-Regular', monospace; font-size: 0.92em;
         background: #f6f6f8; padding: 0 3px; border-radius: 3px; }
  strong { color: #1c1d26; }
  hr { border: 0; border-top: 1px solid #e8e8ee; margin: 0.9em 0; }
  a { color: #be123c; text-decoration: none; }
`

function trouverNavigateur() {
  const chemin = NAVIGATEURS.find((c) => existsSync(c))
  if (!chemin) {
    throw new Error('Aucun navigateur trouvé : indiquez Edge ou Chrome avec la variable DOCS_NAVIGATEUR.')
  }
  return chemin
}

const navigateur = trouverNavigateur()
const dossierTemp = mkdtempSync(join(tmpdir(), 'duo-docs-'))
mkdirSync('docs/pdf', { recursive: true })

try {
  for (const { source, pdf, taille } of DOCUMENTS) {
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
      <title>${source}</title><style>${style(taille)}</style></head>
      <body>${marked.parse(readFileSync(source, 'utf8'))}</body></html>`
    const fichierHtml = join(dossierTemp, 'page.html')
    writeFileSync(fichierHtml, html)
    execFileSync(navigateur, [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--user-data-dir=${join(dossierTemp, 'profil')}`,
      `--print-to-pdf=${resolve(pdf)}`,
      pathToFileURL(fichierHtml).href,
    ], { stdio: 'ignore' })
    console.log(`${pdf} généré`)
  }
} finally {
  rmSync(dossierTemp, { recursive: true, force: true })
}
