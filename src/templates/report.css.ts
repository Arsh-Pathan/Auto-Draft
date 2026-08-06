export const REPORT_CSS = `
  @page { size: A4; margin: 14mm 14mm 18mm 14mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    color: #000;
    font-family: 'Calibri', sans-serif;
    font-size: 12pt;
    line-height: 1.5;
  }
  
  @keyframes docSectionAppear {
    0% {
      opacity: 0;
      transform: translateY(14px);
      filter: blur(2px);
    }
    60% {
      filter: blur(0px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes writingHighlight {
    0% {
      background-color: rgba(59, 130, 246, 0.12);
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
    }
    100% {
      background-color: transparent;
      box-shadow: none;
    }
  }

  @media screen {
    html, body {
      background: #ffffff;
      padding: 12px 0;
      zoom: 0.95;
    }
    .report {
      width: 210mm;
      margin: 0 auto;
      background: #fff;
      border: 2px solid #000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      transition: all 0.3s ease;
    }
    .section-animate {
      animation: docSectionAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) both, writingHighlight 1.8s ease-out both;
      border-radius: 4px;
      padding: 2px 4px;
    }
    .report::after {
      content: "";
      display: block;
      position: absolute;
      inset: 4px;
      border: 1px solid #000;
      pointer-events: none;
    }
    .report {
      position: relative;
    }
    .report-content {
      padding: 12mm 14mm 18mm;
    }
    #page-frames { display: none; }
  }

  /* ── Print / PDF: proper A4 pages with border via fixed pseudo-elements ── */
  @media print {
    html, body { background: #fff; margin: 0; padding: 0; }
    .report { background: #fff; }
    /* In print, we need padding so content doesn't hit the border */
    .report-content { 
      padding: 12mm 14mm; 
    }
    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      border: 2px solid #000;
      z-index: 9998;
      pointer-events: none;
    }
    body::after {
      content: "";
      position: fixed;
      top: 4px; left: 4px; right: 4px; bottom: 4px;
      border: 1px solid #000;
      z-index: 9999;
      pointer-events: none;
    }
  }

  /* ── Shared content styles ── */
  .masthead {
    display: flex;
    align-items: center;
    border-bottom: 1.5px solid #000;
    padding-bottom: 8pt;
    margin-bottom: 15pt;
  }
  .masthead-logo {
    width: 140px;
    height: auto;
    margin-right: 15pt;
    flex-shrink: 0;
  }
  .masthead-text-col {
    flex: 1;
    text-align: left;
    min-width: 0;
  }
  .masthead-title {
    font-size: 16pt;
    font-weight: bold;
    line-height: 1.1;
    margin-bottom: 2pt;
  }
  .masthead-subtitle {
    font-size: 8pt;
    font-weight: bold;
    line-height: 1.3;
  }

  table.header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20pt;
    table-layout: fixed;
  }
  table.header-table td {
    border: 1px solid #000;
    padding: 4pt 6pt;
    font-size: 11pt;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  h1.title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 20pt 0 16pt;
  }
  h2.section {
    font-size: 14pt;
    font-weight: bold;
    margin: 16pt 0 8pt;
  }
  p {
    margin: 0 0 10pt;
    text-align: justify;
    font-size: 12pt;
  }
  ul.bullets {
    margin: 0 0 10pt 24pt;
    padding: 0;
  }
  ul.bullets li {
    margin-bottom: 6pt;
    font-size: 12pt;
    text-align: justify;
  }

  table.content-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12pt;
    table-layout: fixed;
  }
  table.content-table td {
    border: 1px solid #000;
    padding: 4pt 6pt;
    font-size: 12pt;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .photo-center {
    text-align: center;
    margin: 16pt 0;
  }
  .photo-center img {
    max-width: 80%;
    max-height: 80mm;
    height: auto;
    border: 1px solid #000;
  }
  .photo-center .caption {
    font-size: 12pt;
    margin-top: 6pt;
  }

  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 60pt;
  }
  .sig-col {
    width: 32%;
    text-align: center;
    font-size: 11pt;
    line-height: 1.3;
  }
  
  /* Ensure no content can push out the page width */
  .report-content > * {
    max-width: 100% !important;
  }
  
  /* Force tables to respect the padding */
  table {
    table-layout: fixed;
    width: 100%;
  }
`;
