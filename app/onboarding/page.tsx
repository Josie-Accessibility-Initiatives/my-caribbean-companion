"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Step1Country from "@/components/wizard/Step1Country";
import Step2Destination from "@/components/wizard/Step2Destination";
import Step3Category from "@/components/wizard/Step3Category";
import ProcessSteps from "@/components/csme/ProcessSteps";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchProfile } from "@/lib/userData";
import { readLocalPlanInput, writeLocalPlan } from "@/lib/persistence";
import { categoryLabel, countryName } from "@/lib/constants";
import { errorMessage, postJson } from "@/lib/fetch-json";
import type { Plan } from "@/lib/types/plan";

const STEP_LABELS = ["Your Background", "Destination", "Your Profession"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [homeCountry, setHomeCountry] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Signed-in users: pre-fill home country and profession from their profile
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchProfile(user.id)
      .then((profile) => {
        if (cancelled || !profile) return;
        if (profile.home_country) setHomeCountry((v) => v || profile.home_country!);
        if (profile.profession) setCategory((v) => v || profile.profession!);
      })
      .catch(() => {
        /* pre-fill is best-effort */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Pre-fill from the existing plan so revisiting doesn't wipe previous choices.
  // "?new=1" (from the dashboard's "New plan") starts fresh instead.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("new")) return;
    const input = readLocalPlanInput();
    if (input?.fromCountry) setHomeCountry(input.fromCountry);
    if (input?.toCountry) setTargetCountry(input.toCountry);
    if (input?.category) setCategory(input.category);
  }, []);

  const canContinue =
    (step === 1 && !!homeCountry) ||
    (step === 2 && !!targetCountry) ||
    (step === 3 && !!category);

  const generatePlan = async () => {
    try {
      setSubmitting(true);
      const plan = await postJson<Plan>(
        "/api/plan",
        { fromCountry: homeCountry, toCountry: targetCountry, category },
        "Failed to generate plan"
      );
      writeLocalPlan({
        input: {
          fromCountry: homeCountry,
          toCountry: targetCountry,
          category,
          homeCountryName: countryName(homeCountry),
          targetCountryName: countryName(targetCountry),
          categoryLabel: categoryLabel(category),
        },
        plan,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Something went wrong generating your plan."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    setError("");
    if (!canContinue) return;
    if (step < 3) setStep(step + 1);
    else void generatePlan();
  };

  return (
    <div className="page page-onboarding">
      <section className="section">
        <div className="planner-card">
          <div className="wizard-progress">
            <div className="wizard-progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className="wizard-steps-labels">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className={step >= i + 1 ? "active" : ""}>
                {label}
              </div>
            ))}
          </div>

          <h1 className="section-title">Plan My Move</h1>
          <p className="section-subtitle">
            Tell us where you are headed and what you do, and we&apos;ll build
            your CSME-ready plan.
          </p>

          {error && <div className="form-error">{error}</div>}

          {step === 1 && <Step1Country value={homeCountry} onChange={setHomeCountry} />}
          {step === 2 && (
            <Step2Destination
              value={targetCountry}
              onChange={setTargetCountry}
              excludeCode={homeCountry}
            />
          )}
          {step === 3 && <Step3Category value={category} onChange={setCategory} />}

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
                {step < 3 ? "Continue" : submitting ? "Generating Plan…" : "Generate My Plan"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <ProcessSteps />
    </div>
  );
}
