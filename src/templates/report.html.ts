import type { ReportPayload } from "@/types/report";
import { REPORT_CSS } from "./report.css";
import { formatDateShort } from "@/utils/formatDate";
import { CLUB_NAME } from "@/utils/constants";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}



function escapeAttribute(s: string): string {
  return escapeHtml(s);
}

type RenderOptions = {
  assetBaseUrl?: string;
};

function normalizeAssetBaseUrl(assetBaseUrl?: string): string {
  if (!assetBaseUrl) return "http://localhost:3000/";
  return assetBaseUrl.endsWith("/") ? assetBaseUrl : `${assetBaseUrl}/`;
}

export function renderReportHtml(payload: ReportPayload, options: RenderOptions = {}): string {
  const { meta, ai, photographs, signatories } = payload;
  const assetBaseUrl = normalizeAssetBaseUrl(options.assetBaseUrl);
  const headerTable = `
    <table class="header" style="width: 100%; border-collapse: collapse; margin-bottom: 10pt;">
      <tbody>
        <tr>
          <td style="width: 25%;"><strong>ACA/R / 56</strong></td>
          <td rowspan="2" style="width: 50%; text-align: center; vertical-align: middle;"><strong>Dhole Patil College of Engineering</strong></td>
          <td style="width: 25%;"><strong>AcademicYear:${escapeHtml(meta.academicYear)}</strong></td>
        </tr>
        <tr>
          <td><strong>Rev: 00</strong></td>
          <td><strong>Semester: ${escapeHtml(meta.semester)}</strong></td>
        </tr>
        <tr>
          <td><strong>Date: 15.12.2016</strong></td>
          <td style="text-align: center;"><strong>Report</strong></td>
          <td><strong>Date- ${formatDateShort(meta.date)}</strong></td>
        </tr>
      </tbody>
    </table>
  `;

  const bullets = ai.programDetails.bullets
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join("");

  const photos = photographs.length
    ? `
    <section class="photographs">
      <h2 class="section">Photographs:</h2>
      <div class="photo-grid">
        ${photographs
          .map(
            (p, i) => `
          <figure class="photo">
            <img src="${p.src}" alt="${escapeHtml(p.caption || `Photograph ${i + 1}`)}" />
            <figcaption class="caption">${escapeHtml(p.caption || `Photograph ${i + 1}`)}</figcaption>
          </figure>`
          )
          .join("")}
      </div>
    </section>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(meta.title)}</title>
  <base href="${escapeAttribute(assetBaseUrl)}" />
  <style>${REPORT_CSS}</style>
</head>
<body>
  <main class="report">
    <div class="report-inner">
      <header class="masthead" style="display: flex; align-items: center; border-bottom: 1.5px solid black; padding-bottom: 10px; margin-bottom: 20px;">
        <div style="flex: 0 0 auto; margin-right: 20px;">
          <img class="masthead-logo" src="logo.svg" alt="Dhole Patil Education Society" style="width: 160px; height: auto;" />
        </div>
        <div style="flex: 1; text-align: left;">
          <div style="font-size: 16pt; font-weight: 800; color: #000; line-height: 1.2;">DHOLE PATIL COLLEGE OF ENGINEERING</div>
          <div style="font-size: 8pt; font-weight: 700; color: #000; line-height: 1.3; margin-top: 2px;">Accredited with Grade A+ by NAAC</div>
          <div style="font-size: 8pt; font-weight: 700; color: #000; line-height: 1.3;">ISO 9001:2015 Certified Institute, Approved by A.I.C.T.E New Delhi,</div>
          <div style="font-size: 8pt; font-weight: 700; color: #000; line-height: 1.3;">D.T.E. Govt of Maharashtra and Affiliated to Savitribai Phule Pune University, Pune.</div>
        </div>
      </header>

      <section class="report-shell">
        <div class="report-label">${escapeHtml(CLUB_NAME)} Activity Report</div>
        ${headerTable}
        <h1 class="title">${escapeHtml(meta.title)}</h1>

        <section>
          <h2 class="section">Overview</h2>
          <p>${escapeHtml(ai.overview)}</p>
        </section>

        <section>
          <h2 class="section">Program Details</h2>
          <p>${escapeHtml(ai.programDetails.description)}</p>
          <ul class="bullets">${bullets}</ul>
        </section>

        <section>
          <h2 class="section">Overall Outcome</h2>
          <p>${escapeHtml(ai.outcome)}</p>
        </section>

        ${photos}

        <section class="signatures">
          <div class="sig">${escapeHtml(signatories.advisor)}</div>
          <div class="sig">${escapeHtml(signatories.sdpHead)}</div>
          <div class="sig">${escapeHtml(signatories.principal)}</div>
        </section>
      </section>
    </div>
  </main>
</body>
</html>`;
}
