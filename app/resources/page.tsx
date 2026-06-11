"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Globe } from "lucide-react";
import FraudAlert from "@/components/resources/FraudAlert";
import type { CSMEDocument, DocumentType } from "@/lib/types/documents";

type Country = {
  id: number;
  code: string;
  name: string;
  immigrationUrl: string | null;
  competentAuthorityUrl: string | null;
  formsUrl: string | null;
  notes: string | null;
};

const BADGE: Record<DocumentType, { label: string; bg: string; color: string }> = {
  guide:               { label: "Guide",     bg: "#d1fae5", color: "#065f46" },
  form:                { label: "Form",      bg: "#dbeafe", color: "#1e40af" },
  reference:           { label: "Reference", bg: "#f3f4f6", color: "#374151" },
  authority:           { label: "Authority", bg: "#e0e7ff", color: "#1e3a8a" },
  competent_authority: { label: "Authority", bg: "#e0e7ff", color: "#1e3a8a" },
};

function TypeBadge({ type }: { type: DocumentType }) {
  const b = BADGE[type] ?? BADGE.reference;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: b.bg,
        color: b.color,
        marginBottom: "0.5rem",
      }}
    >
      {b.label}
    </span>
  );
}

function DocCard({ doc }: { doc: CSMEDocument }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderLeft: "3px solid var(--color-primary)",
        borderRadius: "0.5rem",
        padding: "1rem",
      }}
    >
      <TypeBadge type={doc.type} />
      <div style={{ fontWeight: 700, color: "#111827", marginBottom: "0.3rem" }}>
        {doc.title}
      </div>
      <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 0.5rem" }}>
        {doc.description}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
          {doc.source} · Last verified: {doc.lastVerified}
        </div>
        <a
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--color-primary)",
            border: "1px solid var(--color-primary)",
            borderRadius: "0.375rem",
            padding: "0.3rem 0.65rem",
            textDecoration: "none",
          }}
        >
          View Official Source
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

type Tab = "official" | "countries";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "official",  label: "Official Resources", Icon: FileText },
  { id: "countries", label: "Browse Countries",   Icon: Globe },
];

export default function ResourcesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("official");

  const [globalDocs, setGlobalDocs] = useState<CSMEDocument[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryError, setCountryError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    async function loadGlobal() {
      try {
        const res = await fetch("/api/documents?global=true");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load documents");
        setGlobalDocs(data.global ?? []);
      } catch (e) {
        setGlobalError(e instanceof Error ? e.message : "Failed to load documents");
      } finally {
        setGlobalLoading(false);
      }
    }
    async function loadCountries() {
      try {
        const res = await fetch("/api/countries");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load countries");
        setCountries(Array.isArray(data) ? data : []);
      } catch (e) {
        setCountryError(e instanceof Error ? e.message : "Failed to load countries");
      }
    }
    loadGlobal();
    loadCountries();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [countries, q]);

  return (
    <div className="section">
      <h1 className="section-title">Document Hub</h1>
      <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
        Verified CSME resources, government contacts, and official forms for every CARICOM member state.
      </p>

      {/* 2-button tab row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.5rem",
          marginBottom: "1.75rem",
        }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.7rem 0.5rem",
                borderRadius: "0.5rem",
                border: active ? "2px solid var(--color-primary)" : "1px solid #e5e7eb",
                background: active ? "var(--color-primary)" : "#ffffff",
                color: active ? "#ffffff" : "#374151",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Official Resources ── */}
      {activeTab === "official" && (
        <section>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: 0, marginBottom: "1rem" }}>
            Verified documents from the CARICOM Secretariat — always go to the official source.
          </p>
          {globalLoading && <p style={{ color: "#6b7280" }}>Loading resources…</p>}
          {globalError && <p className="form-error">{globalError}</p>}
          {!globalLoading && !globalError && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {globalDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Tab: Browse Countries ── */}
      {activeTab === "countries" && (
        <section>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: 0, marginBottom: "1rem" }}>
            Select a country to view live government contacts, immigration links, and country-specific documents.
          </p>
          <input
            className="form-input"
            placeholder="Search by country or territory..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          {countryError && <p className="form-error">{countryError}</p>}
          <div>
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                className="planner-card"
                onClick={() => router.push(`/resources/${c.code}`)}
                style={{
                  marginBottom: "1rem",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  {c.name}{" "}
                  <span style={{ color: "#6b7280" }}>({c.code})</span>
                </h2>
                {(c.immigrationUrl || c.competentAuthorityUrl || c.formsUrl) && (
                  <ul style={{ marginBottom: 0 }}>
                    {c.immigrationUrl && (
                      <li>
                        <a href={c.immigrationUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          Immigration website
                        </a>
                      </li>
                    )}
                    {c.competentAuthorityUrl && (
                      <li>
                        <a href={c.competentAuthorityUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          Competent Authority
                        </a>
                      </li>
                    )}
                    {c.formsUrl && (
                      <li>
                        <a href={c.formsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          Forms / Online services
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </button>
            ))}
            {!countryError && filtered.length === 0 && (
              <p style={{ color: "#6b7280" }}>No countries match your search.</p>
            )}
          </div>
        </section>
      )}

      <div style={{ marginTop: "2rem" }}>
        <FraudAlert context="general" />
      </div>
    </div>
  );
}
