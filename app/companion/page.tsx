"use client";

import { useEffect, useState } from "react";
import ChatWidget from "@/components/companion/ChatWidget";
import { type OnboardingContext } from "@/lib/persistence";

type Country = { code: string; name: string };
type Category = { code: string; label: string };

function getRawPlan() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("mcc_plan");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export default function CompanionPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [context, setContext] = useState<OnboardingContext | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [countriesRes, categoriesRes] = await Promise.all([
        fetch("/api/countries"),
        fetch("/api/categories"),
      ]);
      const [c, k] = await Promise.all([countriesRes.json(), categoriesRes.json()]);
      setCountries(c);
      setCategories(k);

      const plan = getRawPlan();
      const input = plan?.input;
      if (input) {
        setFromCode(input.fromCountry ?? "");
        setToCode(input.toCountry ?? "");
        setCategoryCode(input.category ?? "");
        setContext({
          homeCountry: input.homeCountryName ?? input.fromCountry ?? "",
          targetCountry: input.targetCountryName ?? input.toCountry ?? "",
          category: input.categoryLabel ?? input.category ?? "",
        });
      }
      setLoaded(true);
    }
    load();
  }, []);

  function saveContext(newFrom: string, newTo: string, newCategory: string, allCountries: Country[], allCategories: Category[]) {
    const homeCountryName = allCountries.find((c) => c.code === newFrom)?.name ?? newFrom;
    const targetCountryName = allCountries.find((c) => c.code === newTo)?.name ?? newTo;
    const categoryLabel = allCategories.find((c) => c.code === newCategory)?.label ?? newCategory;

    const plan = getRawPlan() ?? {};
    localStorage.setItem(
      "mcc_plan",
      JSON.stringify({
        ...plan,
        input: {
          ...(plan.input ?? {}),
          fromCountry: newFrom,
          toCountry: newTo,
          category: newCategory,
          homeCountryName,
          targetCountryName,
          categoryLabel,
        },
      })
    );

    if (newFrom && newTo && newCategory) {
      setContext({ homeCountry: homeCountryName, targetCountry: targetCountryName, category: categoryLabel });
    } else {
      setContext(null);
    }
  }

  return (
    <div className="page page-companion">
      <div className="companion-container">
        <header className="companion-header">
          <h1 className="section-title">Your AI Companion</h1>
          <p className="section-subtitle">
            Ask anything about relocating for work in the Caribbean. Powered
            by Google Gemini.
          </p>
        </header>

        <div className="companion-grid">
          <div className="companion-chat-col">
            <ChatWidget
              userContext={context ?? undefined}
              className="chat-widget-embedded"
            />
          </div>

          <aside className="companion-sidebar">
            <div className="planner-card">
              <h3 className="companion-card-title">Your Move Context</h3>

              {!loaded ? (
                <p className="companion-muted">Loading…</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="form-label">
                    From
                    <select
                      className="form-select"
                      value={fromCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFromCode(val);
                        saveContext(val, toCode, categoryCode, countries, categories);
                      }}
                    >
                      <option value="">Select country</option>
                      {countries
                        .filter((c) => c.code !== toCode)
                        .map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                  </label>

                  <label className="form-label">
                    To
                    <select
                      className="form-select"
                      value={toCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setToCode(val);
                        saveContext(fromCode, val, categoryCode, countries, categories);
                      }}
                    >
                      <option value="">Select country</option>
                      {countries
                        .filter((c) => c.code !== fromCode)
                        .map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                  </label>

                  <label className="form-label">
                    Category
                    <select
                      className="form-select"
                      value={categoryCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategoryCode(val);
                        saveContext(fromCode, toCode, val, countries, categories);
                      }}
                    >
                      <option value="">Select profession</option>
                      {categories.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="planner-card">
              <h3 className="companion-card-title">What I can help with</h3>
              <ul className="companion-bullet-list">
                <li>CSME eligibility questions</li>
                <li>Required documents by profession</li>
                <li>Skills Certificate guidance</li>
                <li>Country-specific requirements</li>
                <li>Cost and timeline estimates</li>
                <li>Next steps in your relocation</li>
              </ul>
            </div>

            <div className="companion-reminder">
              <h3 className="companion-card-title">Important reminder</h3>
              <p className="companion-reminder-body">
                I provide guidance based on CSME policy but I am not a lawyer.
                Always verify requirements with the official Competent
                Authority in your destination country before submitting
                documents.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
