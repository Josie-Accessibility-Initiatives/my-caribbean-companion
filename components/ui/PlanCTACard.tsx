import Link from "next/link";

export function PlanCTACard() {
  return (
    <section className="section" style={{ paddingBottom: "3rem" }}>
      <div className="step-card" style={{ maxWidth: 680, margin: "0 auto" }}>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.2rem", fontWeight: 600 }}>
          Ready to plan your CSME move?
        </h3>
        <p style={{ margin: "0 0 1.25rem", color: "#4b5563" }}>
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
