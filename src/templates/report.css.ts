export const REPORT_CSS = `
  @page { size: A4; margin: 14mm 14mm 18mm 14mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 10px;
    background: #ffffff;
    color: #111827;
    font-family: 'Calibri', sans-serif;
    font-size: 12pt;
    line-height: 1.45;
  }
  .report {
    padding: 0;
    max-width: 210mm;
    margin: 0 auto;
    background: #ffffff;
  }
  .report-inner {
    border: 4px double #111827;
    padding: 12mm;
  }
  .masthead {
    margin-bottom: 10pt;
    padding-bottom: 8pt;
    border-bottom: 1.4pt solid #111827;
    page-break-inside: avoid;
  }
  .masthead-grid {
    display: grid;
    grid-template-columns: 24mm 1fr 24mm;
    align-items: center;
    gap: 6mm;
  }
  .masthead-aicte {
    width: 22mm;
    height: 22mm;
    border-radius: 50%;
    background: #b91c1c;
    color: #ffffff;
    font-weight: 700;
    font-size: 11pt;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
  }
  .masthead-logo {
    display: block;
    width: 100%;
    height: auto;
    max-height: 24mm;
    object-fit: contain;
  }
  .masthead-center {
    text-align: center;
  }
  .masthead-society {
    font-size: 10.5pt;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .masthead-institute {
    font-size: 17pt;
    font-weight: 700;
    margin-top: 2pt;
    line-height: 1.15;
  }
  .masthead-accred {
    font-size: 9.5pt;
    margin-top: 2pt;
    line-height: 1.25;
  }
  .masthead-address {
    font-size: 9.5pt;
    font-style: italic;
    margin-top: 2pt;
  }
  .report-shell {
    padding: 10pt 0 16pt;
  }
  .report-label {
    margin-bottom: 10pt;
    padding-bottom: 6pt;
    text-align: center;
    font-size: 10pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  table.header {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10pt;
    page-break-inside: avoid;
  }
  table.header th, table.header td {
    border: 1px solid #111827;
    padding: 4.5pt 7pt;
    text-align: left;
    vertical-align: middle;
    font-size: 10.5pt;
  }
  table.header th {
    font-weight: 700;
    width: 27%;
  }
  h1.title {
    text-align: center;
    font-size: 16pt;
    font-weight: 700;
    margin: 16pt 0 12pt;
    text-decoration: underline;
  }
  h2.section {
    font-size: 12.5pt;
    font-weight: 700;
    margin: 14pt 0 6pt;
    text-decoration: underline;
  }
  p { margin: 0 0 8pt; text-align: justify; }
  ul.bullets { margin: 4pt 0 8pt 22pt; padding: 0; }
  ul.bullets li { margin-bottom: 4pt; }
  .photographs { margin-top: 12pt; }
  .photo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10pt 14pt;
  }
  .photo {
    page-break-inside: avoid;
    text-align: center;
  }
  .photo img {
    max-width: 100%;
    max-height: 70mm;
    border: 1px solid #111827;
    object-fit: cover;
  }
  .photo .caption {
    font-size: 10pt;
    font-style: italic;
    margin-top: 4pt;
  }
  .signatures {
    margin-top: 28pt;
    display: flex;
    justify-content: space-between;
    page-break-inside: avoid;
  }
  .sig {
    width: 30%;
    text-align: center;
    font-weight: 600;
    border-top: 1px solid #111827;
    padding-top: 6pt;
  }
`;
