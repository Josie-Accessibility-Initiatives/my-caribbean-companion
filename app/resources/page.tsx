"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Country = {
  id: number;
  code: string;
  name: string;
  immigrationUrl: string | null;
  competentAuthorityUrl: string | null;
  formsUrl: string | null;
  notes: string | null;
};

export default function ResourcesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Country[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const res = await fetch("/api/countries");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load resources");
        }
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load resources");
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [items, q]);

  return (
    <div className="section">
      <h1 className="section-title">Resources</h1>
      <p className="section-subtitle">
        Search a country to view stats, industries, maps, job boards, and
        housing.
      </p>

      <input
        className="form-input"
        placeholder="Search by country or territory..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%" }}
      />

      {error && <p className="form-error">{error}</p>}

      <div style={{ marginTop: "1rem" }}>
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

            <p style={{ color: "#4b5563", marginTop: 0 }}>
              Click to view country details, map, jobs, and housing.
            </p>

            <ul style={{ marginBottom: 0 }}>
              {c.immigrationUrl && (
                <li>
                  <a
                    href={c.immigrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Immigration website
                  </a>
                </li>
              )}
              {c.competentAuthorityUrl && (
                <li>
                  <a
                    href={c.competentAuthorityUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Competent Authority
                  </a>
                </li>
              )}
              {c.formsUrl && (
                <li>
                  <a
                    href={c.formsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Forms / Online services
                  </a>
                </li>
              )}
            </ul>
          </button>
        ))}

        {!error && filtered.length === 0 && (
          <p style={{ color: "#6b7280" }}>No countries match your search.</p>
        )}
      </div>
    </div>
  );
}
