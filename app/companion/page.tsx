"use client";

import { useEffect, useState } from "react";
import ChatWidget from "@/components/companion/ChatWidget";
import BackButton from "@/components/ui/BackButton";
import { Select } from "@/components/ui/Select";
import { categoryLabel, countryName } from "@/lib/constants";
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from "@/lib/options";
import {
  getOnboarding,
  readLocalPlanInput,
  updateLocalPlanInput,
  type OnboardingContext,
} from "@/lib/persistence";

const HELP_TOPICS = [
  "CSME eligibility questions",
  "Required documents by profession",
  "Skills Certificate guidance",
  "Country-specific requirements",
  "Cost and timeline estimates",
  "Next steps in your relocation",
];

type MoveSelection = { fromCode: string; toCode: string; categoryCode: string };

export default function CompanionPage() {
  const [selection, setSelection] = useState<MoveSelection>({
    fromCode: "",
    toCode: "",
    categoryCode: "",
  });
  const [context, setContext] = useState<OnboardingContext | null>(null);
  const [loaded, setLoaded] = useState(false);

  // localStorage is only available after mount.
  useEffect(() => {
    const input = readLocalPlanInput();
    setSelection({
      fromCode: input?.fromCountry ?? "",
      toCode: input?.toCountry ?? "",
      categoryCode: input?.category ?? "",
    });
    setContext(getOnboarding());
    setLoaded(true);
  }, []);

  function update(field: keyof MoveSelection, value: string) {
    const next = { ...selection, [field]: value };
    setSelection(next);

    const input = {
      fromCountry: next.fromCode,
      toCountry: next.toCode,
      category: next.categoryCode,
      homeCountryName: countryName(next.fromCode),
      targetCountryName: countryName(next.toCode),
      categoryLabel: categoryLabel(next.categoryCode),
    };
    updateLocalPlanInput(input);

    setContext(
      next.fromCode && next.toCode && next.categoryCode
        ? {
            homeCountry: input.homeCountryName,
            targetCountry: input.targetCountryName,
            category: input.categoryLabel,
          }
        : null
    );
  }

  return (
    <div className="page page-companion">
      <div className="companion-container">
        <header className="companion-header">
          <BackButton />
          <h1 className="section-title">Your AI Companion</h1>
          <p className="section-subtitle">
            Ask anything about relocating for work in the Caribbean. Powered
            by Google Gemini.
          </p>
        </header>

        <div className="companion-grid">
          <div className="companion-chat-col">
            <ChatWidget userContext={context ?? undefined} className="chat-widget-embedded" />
          </div>

          <aside className="companion-sidebar">
            <div className="planner-card">
              <h3 className="companion-card-title">Your Move Context</h3>

              {!loaded ? (
                <p className="companion-muted">Loading…</p>
              ) : (
                <div className="stack-md">
                  <Select
                    label="From"
                    value={selection.fromCode}
                    onChange={(v) => update("fromCode", v)}
                    options={COUNTRY_OPTIONS}
                    exclude={[selection.toCode]}
                    placeholder="Select country"
                  />
                  <Select
                    label="To"
                    value={selection.toCode}
                    onChange={(v) => update("toCode", v)}
                    options={COUNTRY_OPTIONS}
                    exclude={[selection.fromCode]}
                    placeholder="Select country"
                  />
                  <Select
                    label="Category"
                    value={selection.categoryCode}
                    onChange={(v) => update("categoryCode", v)}
                    options={CATEGORY_OPTIONS}
                    placeholder="Select profession"
                  />
                </div>
              )}
            </div>

            <div className="planner-card">
              <h3 className="companion-card-title">What I can help with</h3>
              <ul className="companion-bullet-list">
                {HELP_TOPICS.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
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
