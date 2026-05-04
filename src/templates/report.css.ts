export const REPORT_CSS = `
  @page { size: A4; margin: 14mm 14mm 18mm 14mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #111827;
    font-family: 'Times New Roman', 'Liberation Serif', serif;
    font-size: 12pt;
    line-height: 1.45;
  }
  .report {
    padding: 0;
    max-width: 182mm;
    margin: 0 auto;
  }
  .masthead {
    margin-bottom: 10pt;
    page-break-inside: avoid;
  }
  .masthead-banner {
    display: block;
    width: 100%;
    height: auto;
  }
  .report-shell {
    border: 1.4pt solid #111827;
    padding: 10pt 12pt 16pt;
  }
  .report-label {
    margin-bottom: 10pt;
    padding-bottom: 6pt;
    border-bottom: 1pt solid #111827;
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
