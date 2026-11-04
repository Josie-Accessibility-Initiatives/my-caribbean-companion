"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Globe } from "lucide-react";
import FraudAlert from "@/components/resources/FraudAlert";
import { DocCard } from "@/components/resources/DocCard";
import { COUNTRIES } from "@/lib/constants";
import { errorMessage, fetchJson } from "@/lib/fetch-json";
import type { CSMEDocument } from "@/lib/types/documents";

type Tab = "official" | "countries";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "official", label: "Official Resources", Icon: FileText },
  { id: "countries", label: "Browse Countries", Icon: Globe },
];

function CountryLinks({ country }: { country: (typeof COUNTRIES)[number] }) {
  const links = [
    { url: country.immigrationUrl, label: "Immigration website" },
    { url: country.competentAuthorityUrl, label: "Competent Authority" },
    { url: country.formsUrl, label: "Forms / Online services" },
  ].filter((l): l is { url: string; label: string } => !!l.url);

  if (links.length === 0) return null;
  return (
    <ul className="no-margin">
      {links.map(({ url, label }) => (
        <li key={url}>
          <a href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ResourcesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("official");
  const [globalDocs, setGlobalDocs] = useState<CSMEDocument[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchJson<{ global?: CSMEDocument[] }>("/api/documents?global=true", undefined, "Failed to load documents")
      .then((data) => setGlobalDocs(data.global ?? []))
      .catch((e) => setGlobalError(errorMessage(e, "Failed to load documents")))
      .finally(() => setGlobalLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="section">
      <h1 className="section-title">Document Hub</h1>
      <p className="section-subtitle mb-1-5">
        Verified CSME resources, government contacts, and official forms for every CARICOM member state.
      </p>

      <div className="segmented">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`segmented-btn${activeTab === id ? " active" : ""}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "official" && (
        <section>
          <p className="text-muted text-sm mt-0 mb-1">
            Verified documents from the CARICOM Secretariat — always go to the official source.
          </p>
          {globalLoading && <p className="text-muted">Loading resources…</p>}
          {globalError && <p className="form-error">{globalError}</p>}
          {!globalLoading && !globalError && (
            <div className="stack-md">
              {globalDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} showSource />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "countries" && (
        <section>
          <p className="text-muted text-sm mt-0 mb-1">
            Select a country to view live government contacts, immigration links, and country-specific documents.
          </p>
          <input
            className="form-input full-width mb-1"
            placeholder="Search by country or territory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filtered.map((c) => (
            <button
              key={c.code}
              type="button"
              className="planner-card country-card"
              onClick={() => router.push(`/resources/${c.code}`)}
            >
              <h2>
                {c.name} <span className="text-muted">({c.code})</span>
              </h2>
              <CountryLinks country={c} />
            </button>
          ))}
          {filtered.length === 0 && <p className="text-muted">No countries match your search.</p>}
        </section>
      )}

      <div className="mt-2">
        <FraudAlert context="general" />
      </div>
    </div>
  );
}
