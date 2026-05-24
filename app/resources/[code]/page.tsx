"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  COUNTRY_META,
  REGIONAL_HOUSING,
  REGIONAL_JOB_BOARDS,
} from "@/data/countryMeta";

type Country = {
  id: number;
  code: string;
  name: string;
  immigrationUrl: string | null;
  competentAuthorityUrl: string | null;
  formsUrl: string | null;
  notes: string | null;
};

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
      ) || null,
    [resources, countryCode],
  );

  const meta = COUNTRY_META[countryCode] || null;
  const coords = meta?.stats?.coordinates;
  const mapSrc =
    coords && GMAPS_KEY
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GMAPS_KEY)}&q=${coords.lat},${coords.lng}&zoom=8`
      : null;

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

  return (
    <div className="section">
      <Link href="/resources">← Back to Resources</Link>

      <h1 className="section-title" style={{ marginTop: "1rem" }}>
        {dbCountry.name}{" "}
        <span style={{ color: "#6b7280" }}>({dbCountry.code})</span>
      </h1>

      <div className="planner-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Official Resources</h2>
        {dbCountry.immigrationUrl ||
        dbCountry.competentAuthorityUrl ||
        dbCountry.formsUrl ? (
          <ul>
            {dbCountry.immigrationUrl && (
              <li>
                <a
                  href={dbCountry.immigrationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Immigration website
                </a>
              </li>
            )}
            {dbCountry.competentAuthorityUrl && (
              <li>
                <a
                  href={dbCountry.competentAuthorityUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Competent Authority
                </a>
              </li>
            )}
            {dbCountry.formsUrl && (
              <li>
                <a href={dbCountry.formsUrl} target="_blank" rel="noreferrer">
                  Forms / Online services
                </a>
              </li>
            )}
          </ul>
        ) : (
          <p style={{ color: "#6b7280", margin: 0 }}>
            Official links for {dbCountry.name} aren&apos;t available yet.
          </p>
        )}
        {dbCountry.notes && (
          <p style={{ color: "#4b5563" }}>{dbCountry.notes}</p>
        )}
      </div>

      <div className="planner-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Country Snapshot</h2>

        {meta?.stats ? (
          <ul>
            <li>
              <strong>Capital:</strong> {meta.stats.capital}
            </li>
            <li>
              <strong>Population:</strong> {meta.stats.population}
            </li>
            <li>
              <strong>Currency:</strong> {meta.stats.currency}
            </li>
            <li>
              <strong>Languages:</strong> {meta.stats.languages.join(", ")}
            </li>
          </ul>
        ) : (
          <p style={{ color: "#6b7280" }}>
            Stats coming soon for {countryCode}.
          </p>
        )}

        <h3>Emerging Industries</h3>
        {meta?.industries?.length ? (
          <ul>
            {meta.industries.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6b7280" }}>
            Industries coming soon for {countryCode}.
          </p>
        )}
      </div>

      <div className="planner-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Map</h2>
        {mapSrc ? (
          <iframe
            title={`${dbCountry.name} map`}
            width="100%"
            height={350}
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
          />
        ) : (
          <p style={{ color: "#6b7280" }}>
            Map preview unavailable. Set{" "}
            <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in{" "}
            <code>.env.local</code> to enable embedded maps.
          </p>
        )}
      </div>

      <div className="planner-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Job Boards</h2>

        <h3>Country-specific</h3>
        {meta?.jobBoards?.length ? (
          <ul>
            {meta.jobBoards.map((j) => (
              <li key={j.url}>
                <a href={j.url} target="_blank" rel="noreferrer">
                  {j.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6b7280" }}>
            Country-specific boards coming soon for {countryCode}.
          </p>
        )}

        <h3>Caribbean-wide</h3>
        <ul>
          {REGIONAL_JOB_BOARDS.map((j) => (
            <li key={j.url}>
              <a href={j.url} target="_blank" rel="noreferrer">
                {j.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="planner-card">
        <h2 style={{ marginTop: 0 }}>Housing &amp; Accommodation</h2>

        <h3>Country-specific</h3>
        {meta?.housing?.length ? (
          <ul>
            {meta.housing.map((h) => (
              <li key={h.url}>
                <a href={h.url} target="_blank" rel="noreferrer">
                  {h.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6b7280" }}>
            Housing links coming soon for {countryCode}.
          </p>
        )}

        <h3>Regional / short-term</h3>
        <ul>
          {REGIONAL_HOUSING.map((h) => (
            <li key={h.url}>
              <a href={h.url} target="_blank" rel="noreferrer">
                {h.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
