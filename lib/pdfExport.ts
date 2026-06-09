type ChecklistItem = {
  id: string;
  label: string;
  description: string;
};

type Plan = {
  summary: string;
  notes: string;
  checklist: ChecklistItem[];
  timeline: {
    documents: string;
    skillsCertificate: string;
    verification: string;
  };
  officialLinks: {
    immigration: string | null;
    competentAuthority: string | null;
    forms: string | null;
  };
  planId: string;
};

type PlanInput = {
  homeCountryName: string;
  targetCountryName: string;
  categoryLabel: string;
};

export function exportPlanToPDF(
  plan: Plan,
  input: PlanInput,
  checklistState: Record<string, boolean>,
  isAuthenticated: boolean,
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const currentDate = new Date().toLocaleDateString();
  const totalItems = plan.checklist?.length ?? 0;
  const completedCount = plan.checklist
    ? plan.checklist.filter((item) => checklistState[item.id]).length
    : 0;
  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const escape = (value: string | null | undefined) =>
    (value ?? "").replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return ch;
      }
    });

  const checklistHtml = plan.checklist
    ?.map(
      (item) => `
        <li>
          <div class="checklist-item">
            <div class="checkbox ${checklistState[item.id] ? "checked" : ""}"></div>
            <div class="item-content">
              <h4>${escape(item.label)}</h4>
              <p>${escape(item.description)}</p>
            </div>
          </div>
        </li>`,
    )
    .join("") || "<li>No checklist items available.</li>";

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>CSME Move Plan - ${escape(input.targetCountryName)}</title>
  <style>
    body {
      font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #117F74;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { color: #117F74; margin: 0; font-size: 28px; }
    .header .subtitle { font-size: 15px; color: #6b7280; margin-top: 8px; }

    .move-details {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .move-details h2 { color: #117F74; margin-top: 0; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-item { background: #ffffff; padding: 10px 12px; border-radius: 4px; }
    .detail-item strong { color: #117F74; }

    .section { margin-bottom: 28px; }
    .section h2 { color: #117F74; border-bottom: 2px solid #117F74; padding-bottom: 8px; }

    .checklist { list-style: none; padding: 0; }
    .checklist li {
      padding: 10px;
      margin-bottom: 8px;
      background: #f8fafc;
      border-radius: 4px;
    }
    .checklist-item { display: flex; align-items: flex-start; }
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #117F74;
      border-radius: 3px;
      margin-right: 15px;
      flex-shrink: 0;
      position: relative;
    }
    .checkbox.checked::after {
      content: "✓";
      position: absolute;
      top: -2px;
      left: 3px;
      color: #117F74;
      font-weight: 700;
      font-size: 16px;
    }
    .item-content h4 { margin: 0 0 4px 0; color: #1f2937; }
    .item-content p { margin: 0; color: #6b7280; font-size: 14px; }

    .timeline { background: #f8fafc; padding: 16px 20px; border-radius: 8px; }
    .timeline ul { list-style: none; padding: 0; margin: 0; }
    .timeline li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .timeline li:last-child { border-bottom: none; }
    .timeline strong { color: #117F74; }

    .notes {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      padding: 14px 16px;
      border-radius: 6px;
    }
    .notes h3 { color: #c2410c; margin-top: 0; }

    .progress-summary {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 14px 16px;
      border-radius: 6px;
      margin-bottom: 22px;
    }
    .progress-summary h3 { color: #065f46; margin-top: 0; }

    .footer {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CSME Move Plan</h1>
    <div class="subtitle">Caribbean Single Market and Economy<br>Free Movement of Skills</div>
    <div class="subtitle">Generated on ${currentDate}</div>
  </div>

  <div class="move-details">
    <h2>Move Details</h2>
    <div class="detail-grid">
      <div class="detail-item"><strong>Moving From:</strong><br>${escape(input.homeCountryName)}</div>
      <div class="detail-item"><strong>Moving To:</strong><br>${escape(input.targetCountryName)}</div>
      <div class="detail-item"><strong>Professional Category:</strong><br>${escape(input.categoryLabel)}</div>
      <div class="detail-item"><strong>Status:</strong><br>${isAuthenticated ? "Registered User" : "Guest User"}</div>
    </div>
  </div>

  <div class="progress-summary">
    <h3>Progress Summary</h3>
    <p>You have completed <strong>${completedCount} of ${totalItems}</strong> checklist items.</p>
    <p><strong>Progress: ${progressPct}%</strong></p>
  </div>

  <div class="section">
    <h2>Overview</h2>
    <p>${escape(plan.summary) || "This is your personalized CSME move plan."}</p>
  </div>

  <div class="section">
    <h2>Document Checklist</h2>
    <p>Please complete the following requirements. Check off items as you complete them.</p>
    <ul class="checklist">${checklistHtml}</ul>
  </div>

  <div class="section">
    <h2>Estimated Timeline</h2>
    <div class="timeline">
      <ul>
        ${plan.timeline?.documents ? `<li><strong>Gather documents:</strong> ${escape(plan.timeline.documents)}</li>` : ""}
        ${plan.timeline?.skillsCertificate ? `<li><strong>Apply for Skills Certificate:</strong> ${escape(plan.timeline.skillsCertificate)}</li>` : ""}
        ${plan.timeline?.verification ? `<li><strong>Verification in host country:</strong> ${escape(plan.timeline.verification)}</li>` : ""}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Important Notes</h2>
    <div class="notes">
      <h3>⚠️ Please Read</h3>
      <p>${escape(plan.notes) || "Always verify requirements with official immigration and competent authority websites for both your home and destination countries, as procedures and documents can change."}</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>CARICOM Single Market and Economy (CSME)</strong></p>
    <p>This document was generated by My Caribbean Companion.</p>
    <p>For the most up-to-date information, please consult official government sources.</p>
    <p>Generated on ${currentDate}</p>
  </div>

  <div class="no-print" style="text-align:center; margin-top:20px;">
    <button onclick="window.print()" style="background:#117F74;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:16px;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
