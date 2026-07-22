import type { ReportPayload } from "@/types/report";
import { REPORT_CSS } from "./report.css";
import { formatDateShort } from "@/utils/formatDate";


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


  const sectionsHtml = ai.sections.map(sec => {
    let content = "";
    if (sec.type === "text") {
      content = `<p data-sec-id="${sec.id}" data-sec-field="text" contenteditable="true" style="outline:none;">${escapeHtml(sec.text || "")}</p>`;
    } else if (sec.type === "bullets") {
      content = `<ul class="bullets" data-sec-id="${sec.id}" data-sec-field="bullets" contenteditable="true" style="outline:none;">${(sec.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`;
    } else if (sec.type === "table") {
      content = `<table class="content-table" data-sec-id="${sec.id}" data-sec-field="table" contenteditable="true" style="outline:none;"><tbody>${(sec.table || []).map(row => 
        `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
      ).join("")}</tbody></table>`;
    } else if (sec.type === "image") {
      const p = photographs[sec.imageIndex || 0];
      if (p) {
        content = `<div class="photo-center">
          <img src="${p.src}" alt="${escapeHtml(p.caption || "")}" />
          <div class="caption"><u>${escapeHtml(p.caption || "")}</u></div>
        </div>`;
      }
    }

    return `
      <section class="ai-section">
        ${sec.heading ? `<h2 class="section" data-sec-id="${sec.id}" data-sec-field="heading" contenteditable="true" style="outline:none;">${escapeHtml(sec.heading)}</h2>` : ""}
        ${content}
      </section>
    `;
  }).join("");

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
    <div class="report-content">
      <table class="masthead-table" style="width: 100%; border-bottom: 1.5px solid #000; padding-bottom: 15pt; margin-bottom: 25pt; table-layout: fixed;">
        <tr>
          <td style="width: 25%; vertical-align: top; text-align: left; padding-left: 10pt;">
            <img src="/logo.png" alt="DPES Logo" style="width: 120px; height: auto;" />
          </td>
          <td style="width: 75%; vertical-align: top; text-align: left; padding-top: 15pt; padding-left: 60pt;">
            <div style="font-size: 15pt; font-weight: bold; line-height: 1.1; margin-bottom: 6pt; font-family: 'Calibri', sans-serif;">DHOLE PATIL COLLEGE OF ENGINEERING</div>
            <div style="font-size: 7.5pt; font-weight: bold; line-height: 1.3; font-family: 'Calibri', sans-serif;">Accredited with Grade A+ by NAAC</div>
            <div style="font-size: 7.5pt; font-weight: bold; line-height: 1.3; font-family: 'Calibri', sans-serif;">ISO 9001:2015 Certified Institute, Approved by A.I.C.T.E New Delhi,</div>
            <div style="font-size: 7.5pt; font-weight: bold; line-height: 1.3; font-family: 'Calibri', sans-serif;">D.T.E. Govt of Maharashtra and Affiliated to Savitribai Phule Pune University, Pune.</div>
          </td>
        </tr>
      </table>

      <section class="report-shell">
        ${meta.docType === "closing_meeting" ? `
        <!-- Closing Meeting Report Layout -->
        <div style="text-align: center; margin-bottom: 15pt; font-family: 'Calibri', sans-serif;">
          <div style="font-size: 11pt; font-weight: bold; color: #333;">Sagar Dhole Patil Sir’s</div>
          <div style="font-size: 13pt; font-weight: bold; color: #1e3a8a;">Student Development Program (SDP)</div>
          <h1 class="title" style="margin-top: 10pt; margin-bottom: 15pt; font-size: 16pt;"><u>Closing Meeting Report</u></h1>
        </div>

        <table class="content-table" style="width: 100%; margin-bottom: 15pt; border: 1px solid #000; font-family: 'Calibri', sans-serif; font-size: 11pt;">
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6pt;"><strong>Event Title:</strong></td>
              <td colspan="3" style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.title)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6pt;"><strong>Organized By:</strong></td>
              <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.organizedBy || "AI & ML Club")}</td>
              <td style="border: 1px solid #000; padding: 6pt;"><strong>Date / Venue:</strong></td>
              <td style="border: 1px solid #000; padding: 6pt;">${formatDateShort(meta.date)} | ${escapeHtml(meta.venue || "Seminar Hall")}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6pt;"><strong>Faculty Coordinator:</strong></td>
              <td colspan="3" style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.facultyCoordinator || "Department Faculty")}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6pt;"><strong>Event Timing & Duration:</strong></td>
              <td colspan="3" style="border: 1px solid #000; padding: 6pt;">
                Start: ${escapeHtml(meta.startTime || "10:00 AM")} | End: ${escapeHtml(meta.endTime || "04:00 PM")} | Duration: ${escapeHtml(meta.duration || "6 Hours")} | Participants: ${escapeHtml(meta.participants || "N/A")}
              </td>
            </tr>
          </tbody>
        </table>

        ${sectionsHtml}

        <div style="margin-top: 40pt; margin-bottom: 40pt; border-top: 2px dashed #ccc; padding-top: 20pt; page-break-before: auto;">
          <h2 style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 15pt; font-family: 'Calibri', sans-serif;"><u>Closing Meeting Attendance</u></h2>
          <table class="content-table" style="width: 100%; border-collapse: collapse; font-family: 'Calibri', sans-serif; font-size: 10.5pt;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #000; padding: 6pt; width: 10%;">Sr. No</th>
                <th style="border: 1px solid #000; padding: 6pt; width: 45%;">Name of Faculty / Member</th>
                <th style="border: 1px solid #000; padding: 6pt; width: 25%;">Designation</th>
                <th style="border: 1px solid #000; padding: 6pt; width: 20%;">Signature</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #000; padding: 6pt; text-align: center;">1</td>
                <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(signatories.advisor)}</td>
                <td style="border: 1px solid #000; padding: 6pt;">Club Advisor</td>
                <td style="border: 1px solid #000; padding: 6pt;"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 6pt; text-align: center;">2</td>
                <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(signatories.sdpHead)}</td>
                <td style="border: 1px solid #000; padding: 6pt;">Head - SDP</td>
                <td style="border: 1px solid #000; padding: 6pt;"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 6pt; text-align: center;">3</td>
                <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.facultyCoordinator || "Faculty Coordinator")}</td>
                <td style="border: 1px solid #000; padding: 6pt;">Faculty Coordinator</td>
                <td style="border: 1px solid #000; padding: 6pt;"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <section class="signatures" style="margin-top: 60pt; page-break-inside: avoid; width: 100%; display: table; table-layout: fixed;">
          <div class="sig-col" style="display: table-cell; width: 50%; text-align: center;">
            <strong>Event Coordinator</strong><br/>
            ${escapeHtml(meta.eventCoordinator || signatories.eventCoordinator || "Event Coordinator")}
          </div>
          <div class="sig-col" style="display: table-cell; width: 50%; text-align: center;">
            <strong>Head - SDP</strong><br/>
            ${escapeHtml(signatories.sdpHead)}
          </div>
        </section>
        ` : meta.docType === "project_proposal" ? `
        <!-- Project Proposal Form Layout -->
        <h1 class="title" style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 20pt; font-family: 'Calibri', sans-serif;">
          <u>PROJECT PROPOSAL FORM</u>
        </h1>

        <div style="margin-bottom: 15pt; font-size: 11pt; line-height: 1.5; font-family: 'Calibri', sans-serif;">
          <strong>To,</strong><br/>
          The Club Advisor,<br/>
          AI &amp; ML Club,<br/>
          Dhole Patil College of Engineering, Pune
        </div>

        <div style="margin-bottom: 15pt; font-size: 11pt; font-family: 'Calibri', sans-serif;">
          <strong>Subject:</strong> <u>Proposal for AI &amp; ML Club Project Approval: ${escapeHtml(meta.title || "Project Approval Request")}</u>
        </div>

        <div style="margin-bottom: 12pt; font-size: 11pt; font-family: 'Calibri', sans-serif;">
          Respected Madam,
        </div>

        <p style="font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 20pt; font-family: 'Calibri', sans-serif;">
          I am writing to formally apply for a project slot in the upcoming AI &amp; ML Club project sprint. I propose to develop an advanced <strong>${escapeHtml(meta.projectTrack || "Software / Hardware")}</strong> system, titled <strong>"${escapeHtml(meta.title)}"</strong>. This application details the concept, required resources, infrastructure access, and technical support requested for successful completion within our strict 30-day timeline.
        </p>

        <table class="content-table" style="width: 100%; margin-bottom: 20pt; border: 1px solid #000; font-family: 'Calibri', sans-serif; font-size: 11pt;">
          <tbody>
            <tr style="background-color: #f8fafc;">
              <td style="border: 1px solid #000; padding: 6pt; font-weight: bold; width: 30%;">Project Track:</td>
              <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.projectTrack || "Software / Hardware")}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6pt; font-weight: bold;">Team Structure:</td>
              <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.teamStructure || "AI & ML Club Member")}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="border: 1px solid #000; padding: 6pt; font-weight: bold;">Tech Stack:</td>
              <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.techStack || "Python, PyTorch, React, Next.js")}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6pt; font-weight: bold;">Financial Request:</td>
              <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.totalFinancialRequest || "₹ 0 (Self-funded / Software)")}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="border: 1px solid #000; padding: 6pt; font-weight: bold;">30-Day Sprint Commitment:</td>
              <td style="border: 1px solid #000; padding: 6pt;">${escapeHtml(meta.sprintAgreement || "Yes - Fully Committed")}</td>
            </tr>
          </tbody>
        </table>

        ${sectionsHtml}

        <p style="font-size: 11pt; line-height: 1.5; text-align: justify; margin-top: 20pt; margin-bottom: 25pt; font-family: 'Calibri', sans-serif;">
          I am confident that this project aligns well with the club's objectives and will provide a valuable learning and demonstration tool for the AI &amp; ML community at Dhole Patil College of Engineering. Thank you for considering our application.
        </p>

        <div style="margin-bottom: 40pt; font-size: 11pt; text-align: right; font-family: 'Calibri', sans-serif; float: right; width: 280px;">
          Yours faithfully,<br/><br/>
          <strong>${escapeHtml(meta.senderName || "Applicant")}</strong><br/>
          Member, AI &amp; ML Club<br/>
          Date: ${formatDateShort(meta.date)}
        </div>
        <div style="clear: both;"></div>

        <section class="signatures" style="margin-top: 60pt; page-break-inside: avoid; width: 100%; display: table; table-layout: fixed;">
          <div class="sig-col" style="display: table-cell; width: 33.33%; text-align: center;">
            <strong>Technical Lead</strong><br/>
            ${escapeHtml(signatories.technicalLead || "Mr. Arsh Pathan / Miss. Vedika Pathode")}
          </div>
          <div class="sig-col" style="display: table-cell; width: 33.33%; text-align: center;">
            <strong>Club Advisor</strong><br/>
            ${escapeHtml(signatories.advisor)}
          </div>
          <div class="sig-col" style="display: table-cell; width: 33.33%; text-align: center;">
            <strong>SDP Head</strong><br/>
            ${escapeHtml(signatories.sdpHead)}
          </div>
        </section>
        ` : meta.docType === "application" ? `
        <!-- Application Letter Layout -->
        <div style="text-align: right; margin-bottom: 15pt; font-size: 11pt; font-family: 'Calibri', sans-serif;">
          <strong>Date:</strong> ${formatDateShort(meta.date)}
        </div>
        
        <div style="margin-bottom: 20pt; font-size: 11pt; line-height: 1.5; font-family: 'Calibri', sans-serif;">
          <strong>To,</strong><br/>
          ${escapeHtml(meta.recipient || "The Principal,")}<br/>
          Dhole Patil College of Engineering,<br/>
          Pune.
        </div>
        
        <div style="margin-bottom: 20pt; font-size: 11pt; font-family: 'Calibri', sans-serif;">
          <strong>Subject:</strong> <u>${escapeHtml(meta.title || "Application Request")}</u>
        </div>
        
        <div style="margin-bottom: 12pt; font-size: 11pt; font-family: 'Calibri', sans-serif;">
          Respected Sir/Madam,
        </div>
        
        <div class="application-body" style="font-size: 12pt; line-height: 1.5; text-align: justify; margin-bottom: 30pt; font-family: 'Calibri', sans-serif;">
          ${sectionsHtml}
        </div>
        
        <div style="margin-bottom: 50pt; font-size: 11pt; text-align: right; font-family: 'Calibri', sans-serif; float: right; width: 250px;">
          Yours faithfully,<br/><br/><br/>
          <strong>${escapeHtml(meta.senderName || "Applicant")}</strong><br/>
          ${escapeHtml(meta.senderDesignation || "Student")}
        </div>
        <div style="clear: both;"></div>
        ` : `
        <!-- Standard Activity Report Layout -->
        <table class="header-table">
          <tbody>
            <tr>
              <td style="width: 25%;"><strong>ACA/R / 56</strong></td>
              <td rowspan="2" style="width: 50%; text-align: center; vertical-align: middle; border-bottom: 1px solid black;"><strong>Dhole Patil College of Engineering</strong></td>
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

        <h1 class="title"><u>${escapeHtml(meta.title)}</u></h1>

        ${sectionsHtml}
        `}

        ${meta.docType !== "closing_meeting" && meta.docType !== "project_proposal" ? `
        <section class="signatures" style="margin-top: ${meta.docType === "application" ? "80pt" : "180pt"}; page-break-inside: avoid; width: 100%; display: table; table-layout: fixed;">
          <div class="sig-col" style="display: table-cell; width: 33.33%;">
            <strong>Club Advisor</strong><br/>
            ${escapeHtml(signatories.advisor)}
          </div>
          <div class="sig-col" style="display: table-cell; width: 33.33%;">
            <strong>SDP Head</strong><br/>
            ${escapeHtml(signatories.sdpHead)}
          </div>
          <div class="sig-col" style="display: table-cell; width: 33.33%;">
            <strong>Principal</strong><br/>
            ${escapeHtml(signatories.principal)}
          </div>
        </section>
        ` : ""}
      </section>
    </div>
  </main>
  <script>
    let _t;
    document.addEventListener('input', (e) => {
      const target = e.target.closest('[data-sec-id]');
      if (!target) return;
      const id = target.getAttribute('data-sec-id');
      const field = target.getAttribute('data-sec-field');
      let value = target.innerText;
      if (field === 'bullets') value = Array.from(target.querySelectorAll('li')).map(li => li.innerText);
      else if (field === 'table') value = Array.from(target.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText));
      clearTimeout(_t);
      _t = setTimeout(() => window.parent.postMessage({ type: 'PREVIEW_EDIT', id, field, value }, '*'), 500);
    });
  </script>
</body>
</html>`;
}
