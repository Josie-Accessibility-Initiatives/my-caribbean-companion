"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import FraudAlert from "@/components/resources/FraudAlert";
import { Briefcase, Home, Calculator, BarChart2, ExternalLink, Phone, Mail, Globe } from "lucide-react";
import { COUNTRY_META } from "@/data/countryMeta";
import type { CSMEDocument, DocumentType } from "@/lib/types/documents";

type DbCountry = {
  id: number;
  code: string;
  name: string;
  immigrationUrl: string | null;
  competentAuthorityUrl: string | null;
  formsUrl: string | null;
  notes: string | null;
};

type CaribGovContact = {
  type: string;
  ministry: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  officer?: string | null;
  title?: string | null;
  address?: string | null;
};

type LiveContacts = {
  competentAuthority: CaribGovContact | null;
  immigrationDept: CaribGovContact | null;
  source: string;
};

const JOB_BOARD_EXCLUDE = ["linkedin", "caricom", "indeed"];
const HOUSING_EXCLUDE = ["airbnb", "vrbo", "facebook"];

function isExcluded(label: string, list: string[]): boolean {
  const l = label.toLowerCase();
  return list.some((term) => l.includes(term));
}

const TYPE_COLORS: Record<DocumentType, { bg: string; text: string }> = {
  guide:               { bg: "#dbeafe", text: "#1d4ed8" },
  form:                { bg: "#d1fae5", text: "#065f46" },
  authority:           { bg: "#ede9fe", text: "#5b21b6" },
  competent_authority: { bg: "#fce7f3", text: "#9d174d" },
  reference:           { bg: "#f3f4f6", text: "#374151" },
};

function TypeBadge({ type }: { type: DocumentType }) {
  const { bg, text } = TYPE_COLORS[type] ?? TYPE_COLORS.reference;
  const label = type.replace(/_/g, " ");
  return (
    <span
      style={{
        background: bg,
        color: text,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

function DocRow({ doc }: { doc: CSMEDocument }) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderLeft: "3px solid var(--color-primary)",
        borderRadius: "0.5rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <TypeBadge type={doc.type} />
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>
            {doc.title}
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.2rem" }}>
          {doc.description}
        </div>
      </div>
      <ExternalLink size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
    </a>
  );
}

function ContactCard({ contact, label }: { contact: CaribGovContact; label: string }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        padding: "0.875rem 1rem",
        marginBottom: "0.75rem",
      }}
    >
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>
        {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", marginBottom: "0.5rem" }}>
        {contact.ministry}
      </div>
      {contact.officer && (
        <div style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.3rem" }}>
          {contact.officer}{contact.title ? ` — ${contact.title}` : ""}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {contact.phone && (
          <a href={`tel:${contact.phone}`} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-primary)", textDecoration: "none" }}>
            <Phone size={13} /> {contact.phone}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-primary)", textDecoration: "none" }}>
            <Mail size={13} /> {contact.email}
          </a>
        )}
        {contact.website && (
          <a href={contact.website} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-primary)", textDecoration: "none" }}>
            <Globe size={13} /> {contact.website}
          </a>
        )}
      </div>
    </div>
  );
}

export default function CountryDetailPage() {
  const params = useParams<{ code: string }>();
  const countryCode = String(params?.code || "").toUpperCase();

  const [resources, setResources] = useState<DbCountry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [liveContacts, setLiveContacts] = useState<LiveContacts | null>(null);
  const [countryDocs, setCountryDocs] = useState<CSMEDocument[]>([]);
  const [docsDisclaimer, setDocsDisclaimer] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [countriesRes, docsRes] = await Promise.all([
          fetch("/api/countries"),
          fetch(`/api/documents?country=${countryCode}`),
        ]);
        const countriesData = await countriesRes.json();
        if (!countriesRes.ok) throw new Error(countriesData?.error || "Failed to load resources");
        setResources(Array.isArray(countriesData) ? countriesData : []);

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setLiveContacts(docsData.liveContacts ?? null);
          setCountryDocs(docsData.documents?.countrySpecific ?? []);
          setDocsDisclaimer(docsData.disclaimer ?? "");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load resources");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [countryCode]);

  const dbCountry = useMemo(
    () => resources.find((c) => String(c.code || "").toUpperCase() === countryCode) ?? null,
    [resources, countryCode],
  );

  const meta = COUNTRY_META[countryCode] ?? null;

  const filteredJobBoards = (meta?.jobBoards ?? []).filter(
    (j) => !isExcluded(j.label, JOB_BOARD_EXCLUDE),
  );
  const filteredHousing = (meta?.housing ?? []).filter(
    (h) => !isExcluded(h.label, HOUSING_EXCLUDE),
  );

  if (loading) {
    return (
      <div className="section">
        <p>Loading country details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <p className="form-error">{error}</p>
        <BackButton href="/resources" label="Back to Resources" />
      </div>
    );
  }

  if (!dbCountry) {
    return (
      <div className="section">
        <h1>Country not found</h1>
        <p>We couldn&apos;t find a country with code: {countryCode}</p>
        <BackButton href="/resources" label="Back to Resources" />
      </div>
    );
  }

  const officialLinks = [
    { label: "Immigration Department",     url: dbCountry.immigrationUrl },
    { label: "Competent Authority (CSME)", url: dbCountry.competentAuthorityUrl },
    { label: "Application Forms",          url: dbCountry.formsUrl },
  ].filter((l): l is { label: string; url: string } => !!l.url);

  return (
    <div className="section">
      <BackButton href="/resources" label="Back to Resources" />

      <h1 className="section-title" style={{ marginTop: "1rem" }}>
        {dbCountry.name}{" "}
        <span style={{ color: "#6b7280" }}>({dbCountry.code})</span>
      </h1>

      {/* 1. Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.6rem",
          margin: "1.25rem 0",
        }}
      >
        {[
          { label: "Find Jobs",         href: `/jobs?country=${countryCode}`,          Icon: Briefcase },
          { label: "View Housing",      href: `/housing?country=${countryCode}`,       Icon: Home },
          { label: "Cost Estimate",     href: `/cost-estimate?country=${countryCode}`, Icon: Calculator },
          { label: "Compare Countries", href: `/compare?highlight=${countryCode}`,     Icon: BarChart2 },
        ].map(({ label, href, Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              background: "#ffffff",
              border: "1px solid var(--color-primary)",
              color: "var(--color-primary)",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-primary)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#ffffff";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-primary)";
            }}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>

      {/* 5. Country Snapshot — stat grid */}
      {meta?.stats && (
        <div className="planner-card" style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.6rem",
            }}
          >
            {[
              { label: "Capital",     value: meta.stats.capital },
              { label: "Population",  value: meta.stats.population },
              { label: "Currency",    value: meta.stats.currency },
              { label: "Languages",   value: meta.stats.languages.join(", ") },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "#f9fafb",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>
                  {label}
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Emerging Industries — pills */}
      {(meta?.industries?.length ?? 0) > 0 && (
        <div className="planner-card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            Emerging Industries
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", margin: "-4px" }}>
            {meta!.industries.map((x) => (
              <span
                key={x}
                style={{
                  border: "1px solid var(--color-primary)",
                  color: "var(--color-primary)",
                  background: "#ffffff",
                  borderRadius: "999px",
                  padding: "4px 12px",
                  fontSize: "0.85rem",
                  margin: "4px",
                  display: "inline-block",
                }}
              >
                {x}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Live Government Contacts (CaribGov) */}
      {liveContacts && liveContacts.source === "caribgov" && (
        <div className="planner-card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, marginBottom: "0.85rem" }}>
            Government Contacts
          </h2>
          {liveContacts.competentAuthority && (
            <ContactCard contact={liveContacts.competentAuthority} label="Competent Authority (CSME)" />
          )}
          {liveContacts.immigrationDept && (
            <ContactCard contact={liveContacts.immigrationDept} label="Immigration Department" />
          )}
          {!liveContacts.competentAuthority && !liveContacts.immigrationDept && (
            <p style={{ color: "#6b7280", margin: 0 }}>
              Live contact data is not available for this country. Check the{" "}
              <a href="https://caribgov.com" target="_blank" rel="noreferrer">
                CaribGov directory
              </a>{" "}
              for up-to-date contacts.
            </p>
          )}
        </div>
      )}

      {/* 3. Official CSME Resources (from DB) */}
      {officialLinks.length > 0 && (
        <div className="planner-card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, marginBottom: "0.85rem" }}>
            Official CSME Resources
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {officialLinks.map(({ label, url }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderLeft: "3px solid var(--color-primary)",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  textDecoration: "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.15rem" }}>
                    Last verified: January 2025
                  </div>
                </div>
                <ExternalLink size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 4. Country-specific document hub docs */}
      {countryDocs.length > 0 && (
        <div className="planner-card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, marginBottom: "0.85rem" }}>
            Document Resources
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {countryDocs.map((doc) => (
              <DocRow key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {docsDisclaimer && (
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "1.5rem", lineHeight: 1.5 }}>
          {docsDisclaimer}
        </p>
      )}

      <div style={{ marginTop: "2rem" }}>
        <FraudAlert context="documents" />
      </div>
    </div>
  );
}
