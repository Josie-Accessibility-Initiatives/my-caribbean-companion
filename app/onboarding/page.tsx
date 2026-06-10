"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Step1Country from "@/components/wizard/Step1Country";
import Step2Destination from "@/components/wizard/Step2Destination";
import Step3Category from "@/components/wizard/Step3Category";
import type { Country, Category } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [homeCountry, setHomeCountry] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [category, setCategory] = useState("");

  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from existing plan so revisiting doesn't wipe previous choices
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mcc_plan");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const input = parsed?.input;
      if (!input) return;
      if (input.fromCountry) setHomeCountry(input.fromCountry);
      if (input.toCountry) setTargetCountry(input.toCountry);
      if (input.category) setCategory(input.category);
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadOptions() {
      try {
        setLoading(true);
        setError("");
        const [countriesRes, categoriesRes] = await Promise.all([
          fetch("/api/countries"),
          fetch("/api/categories"),
        ]);
        if (!countriesRes.ok || !categoriesRes.ok) {
          throw new Error("Failed to load options");
        }
        const [c, k] = await Promise.all([
          countriesRes.json(),
          categoriesRes.json(),
        ]);
        if (cancelled) return;
        setCountries(c);
        setCategories(k);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Unable to load countries and categories. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const progressWidth = `${(step / 3) * 100}%`;

  const canContinue =
    (step === 1 && !!homeCountry) ||
    (step === 2 && !!targetCountry) ||
    (step === 3 && !!category);

  const handleContinue = async () => {
    setError("");

    if (step === 1 && homeCountry) {
      setStep(2);
      return;
    }
    if (step === 2 && targetCountry) {
      setStep(3);
      return;
    }
    if (step === 3 && category) {
      try {
        setSubmitting(true);
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromCountry: homeCountry,
            toCountry: targetCountry,
            category,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to generate plan");
        }

        localStorage.setItem(
          "mcc_plan",
          JSON.stringify({
            input: {
              fromCountry: homeCountry,
              toCountry: targetCountry,
              category,
              homeCountryName:
                countries.find((c) => c.code === homeCountry)?.name ?? "",
              targetCountryName:
                countries.find((c) => c.code === targetCountry)?.name ?? "",
              categoryLabel:
                categories.find((c) => c.code === category)?.label ?? "",
            },
            plan: data,
          })
        );
        router.push("/dashboard");
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong generating your plan."
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="planner-card">
          <p style={{ color: "#6b7280" }}>Loading options…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-onboarding">
      <section className="section">
        <div className="planner-card">
          <div className="wizard-progress">
            <div
              className="wizard-progress-fill"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="wizard-steps-labels">
            <div className={step >= 1 ? "active" : ""}>Your Background</div>
            <div className={step >= 2 ? "active" : ""}>Destination</div>
            <div className={step >= 3 ? "active" : ""}>Your Profession</div>
          </div>

          <h1 className="section-title">Plan My Move</h1>
          <p className="section-subtitle">
            Tell us where you are headed and what you do, and we&apos;ll build
            your CSME-ready plan.
          </p>

          {error && <div className="form-error">{error}</div>}

          {step === 1 && (
            <Step1Country
              value={homeCountry}
              onChange={setHomeCountry}
              countries={countries}
            />
          )}
          {step === 2 && (
            <Step2Destination
              value={targetCountry}
              onChange={setTargetCountry}
              countries={countries}
              excludeCode={homeCountry}
            />
          )}
          {step === 3 && (
            <Step3Category
              value={category}
              onChange={setCategory}
              categories={categories}
            />
          )}

          <div className="wizard-actions">
            <div className="wizard-actions-row">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || submitting}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue || submitting}
                className="btn-primary"
              >
                {step === 3
                  ? submitting
                    ? "Generating Plan…"
                    : "Generate My Plan"
                  : "Continue"}
              </button>
            </div>

            {step === 1 ? (
              <Link href="/dashboard" className="guest-link">
                Continue as guest
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
