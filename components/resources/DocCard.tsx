import { ExternalLink } from "lucide-react";
import { Badge, type BadgeColors } from "@/components/ui/Badge";
import type { CSMEDocument, DocumentType } from "@/lib/types/documents";

const DOC_BADGES: Record<DocumentType, BadgeColors & { label: string }> = {
  guide:               { label: "Guide",     bg: "#d1fae5", color: "#065f46" },
  form:                { label: "Form",      bg: "#dbeafe", color: "#1e40af" },
  reference:           { label: "Reference", bg: "#f3f4f6", color: "#374151" },
  authority:           { label: "Authority", bg: "#e0e7ff", color: "#1e3a8a" },
  competent_authority: { label: "Authority", bg: "#e0e7ff", color: "#1e3a8a" },
};

export function DocTypeBadge({ type }: { type: DocumentType }) {
  const badge = DOC_BADGES[type] ?? DOC_BADGES.reference;
  return <Badge colors={badge}>{badge.label}</Badge>;
}

/**
 * Card for an official CSME document. `showSource` adds the source and
 * last-verified line with an outlined link (Resources page).
 */
export function DocCard({ doc, showSource = false }: { doc: CSMEDocument; showSource?: boolean }) {
  const link = (
    <a
      href={doc.url}
      target="_blank"
      rel="noreferrer"
      className={`inline-link${showSource ? " doc-card-source-btn" : ""}`}
    >
      View Official Source <ExternalLink size={13} />
    </a>
  );

  return (
    <div className="doc-card">
      <DocTypeBadge type={doc.type} />
      <div className="doc-card-title">{doc.title}</div>
      <p className="doc-card-desc">{doc.description}</p>
      {showSource ? (
        <div className="row-between">
          <div className="text-xs text-subtle">
            {doc.source} · Last verified: {doc.lastVerified}
          </div>
          {link}
        </div>
      ) : (
        link
      )}
    </div>
  );
}

/** Compact one-line document link (country detail page). */
export function DocRow({ doc }: { doc: CSMEDocument }) {
  return (
    <a href={doc.url} target="_blank" rel="noreferrer" className="row-link">
      <div className="flex-1">
        <div className="row">
          <DocTypeBadge type={doc.type} />
          <span className="link-card-title">{doc.title}</span>
        </div>
        <div className="link-card-desc">{doc.description}</div>
      </div>
      <ExternalLink size={14} />
    </a>
  );
}
