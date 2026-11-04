import { Fragment } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const STEPS = [
  {
    n: "1",
    title: "Check Your Eligibility",
    body: "Confirm your profession is in one of the 12 approved CSME categories and that your qualifications meet the requirements.",
  },
  {
    n: "2",
    title: "Apply for a Skills Certificate",
    body: "Contact the Competent Authority in your home country. Submit your qualifications, police certificate, and supporting documents.",
  },
  {
    n: "3",
    title: "Secure Employment",
    body: "With your Skills Certificate, you can legally seek employment in any CARICOM member state that participates in CSME.",
  },
  {
    n: "4",
    title: "Complete Immigration Requirements",
    body: "Report to the immigration authority in your destination country within the required timeframe after arrival.",
  },
];

/** "How the Process Works" — the four CSME application steps. */
export default function ProcessSteps() {
  return (
    <section className="section">
      <SectionHeader
        title="How the Process Works"
        subtitle="A simplified overview of the CSME application process."
      />

      {/* Circle row with connecting lines */}
      <div className="process-track">
        {STEPS.map((step, i) => (
          <Fragment key={step.n}>
            <div className="process-step-number">{step.n}</div>
            {i < STEPS.length - 1 && <div className="process-step-line" />}
          </Fragment>
        ))}
      </div>

      <div className="process-steps">
        {STEPS.map((step) => (
          <div key={step.n} className="feature-card">
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
