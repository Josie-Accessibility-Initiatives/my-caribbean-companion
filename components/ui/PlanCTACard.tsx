import Link from "next/link";

export function PlanCTACard() {
  return (
    <section className="section plan-cta-section">
      <div className="step-card plan-cta-card">
        <h3>Ready to plan your CSME move?</h3>
        <p>
          Use My Caribbean Companion to get a personalized checklist, cost
          estimate, and step-by-step guidance based on your specific
          profession and destination.
        </p>
        <Link href="/onboarding" className="btn-primary">
          Start My Move Plan
        </Link>
      </div>
    </section>
  );
}
