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
  
  @media screen {
    html, body {
      background: #e5e7eb;
      padding: 12px 0;
      zoom: 0.95;
    }
    .report {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: transparent;
    }
    /* Container for absolutely-positioned page frame divs */
    #page-frames {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      pointer-events: none;
      z-index: 0;
    }
    /* Each .page-frame is a complete white A4 page with double-border */
    .page-frame {
      position: absolute;
      left: 0;
      right: 0;
      height: 297mm;
      background: #fff;
      border: 2px solid #000;
      box-sizing: border-box;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    /* Inner border inset */
    .page-frame::after {
      content: "";
      position: absolute;
      inset: 4px;
      border: 1px solid #000;
      pointer-events: none;
    }
    /* Content flows on top of the frames */
    .report-content {
      position: relative;
      z-index: 1;
      /* Match frame: 2px outer border + 4px gap + 1px inner border + 12mm content padding */
      padding: 12mm 14mm;
    }
  }

  @media print {
    html, body { background: #fff; }
    #page-frames { display: none; }
    .report { background: #fff; min-height: 0; }
    .report-content { padding: 0; }
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
  }
  .masthead-text-col {
    flex: 1;
    text-align: left;
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
  }
  table.header-table td {
    border: 1px solid #000;
    padding: 4pt 6pt;
    font-size: 11pt;
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
  }
  table.content-table td {
    border: 1px solid #000;
    padding: 4pt 6pt;
    font-size: 12pt;
  }
  
  .photo-center {
    text-align: center;
    margin: 16pt 0;
  }
  .photo-center img {
    max-width: 80%;
    max-height: 80mm;
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
    font-size: 12pt;
    line-height: 1.5;
  }
`;
