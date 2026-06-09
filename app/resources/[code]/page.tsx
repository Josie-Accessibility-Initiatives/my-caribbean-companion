"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Briefcase, Home, Calculator, BarChart2, ExternalLink } from "lucide-react";
import { COUNTRY_META } from "@/data/countryMeta";

type Country = {
  id: number;
  code: string;
  name: string;
  immigrationUrl: string | null;
  competentAuthorityUrl: string | null;
  formsUrl: string | null;
  notes: string | null;
};

// Labels to filter from country-specific lists
const JOB_BOARD_EXCLUDE = ["linkedin", "caricom", "indeed"];
const HOUSING_EXCLUDE = ["airbnb", "vrbo", "facebook"];

function isExcluded(label: string, list: string[]): boolean {
  const l = label.toLowerCase();
  return list.some((term) => l.includes(term));
}

export default function CountryDetailPage() {
  const params = useParams<{ code: string }>();
  const countryCode = String(params?.code || "").toUpperCase();

  const [resources, setResources] = useState<Country[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/countries");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load resources");
        }
        setResources(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load resources");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dbCountry = useMemo(
    () =>
      resources.find(
        (c) => String(c.code || "").toUpperCase() === countryCode,
      ) ?? null,
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
        <Link href="/resources">← Back to Resources</Link>
      </div>
    );
  }

  if (!dbCountry) {
    return (
      <div className="section">
        <h1>Country not found</h1>
        <p>We couldn&apos;t find a country with code: {countryCode}</p>
        <Link href="/resources">← Back to Resources</Link>
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
      <Link href="/resources">← Back to Resources</Link>

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

      {/* 2. Official CSME Resources */}
      <div className="planner-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, marginBottom: "0.85rem" }}>
          Official CSME Resources
        </h2>

        {officialLinks.length > 0 ? (
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
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "#111827",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      marginTop: "0.15rem",
                    }}
                  >
                    Last verified: January 2025
                  </div>
                </div>
                <ExternalLink size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              </a>
            ))}
          </div>
        ) : (
          <p style={{ color: "#6b7280", margin: 0 }}>
            Official resource links coming soon. Check back or contact the
            competent authority directly.
          </p>
        )}
      </div>

      {/* 3. Country Snapshot — stat grid */}
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
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    marginBottom: "0.25rem",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#111827",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Emerging Industries — pills */}
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
    </div>
  );
}
