import Link from "next/link";

export default function Home() {
  return (
    <div className="page page-home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">My Caribbean Companion</h1>
          <p className="hero-subtitle">
            Your guide to working anywhere in the Caribbean.
          </p>

          <div className="hero-actions">
            <Link href="/onboarding" className="btn-primary">
              Start My Move Plan
            </Link>
            <Link href="/about" className="btn-secondary">
              Learn About CSME
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-about-main">
        <div className="about-two-column">
          <div>
            <h2>What is My Caribbean Companion?</h2>
            <p>
              My Caribbean Companion helps CARICOM citizens understand and
              navigate the process of legally moving to another Caribbean
              country for work under the CSME Free Movement of Skills
              framework.
            </p>
            <p>It provides:</p>
            <ul>
              <li>Readiness Score</li>
              <li>Step-by-Step Checklist</li>
              <li>Country Comparison</li>
              <li>AI Companion</li>
              <li>Cost Estimator</li>
              <li>Document Hub</li>
              <li>Community Stories</li>
            </ul>
          </div>
          <div className="about-image-card" />
        </div>
      </section>

      <section className="section section-how">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Plan your move across the Caribbean in four simple steps.
        </p>

        <div className="steps-list">
          <div className="step-card">
            <h3>Step 1 — Tell Us About Your Move</h3>
            <p>
              Share your home country, destination, and professional
              category so we can tailor your plan:
            </p>
            <ul>
              <li>Choose where you&apos;re coming from</li>
              <li>Choose where you want to work</li>
              <li>
                Pick your category (Graduate, Nurse, Artisan, Teacher, etc.)
              </li>
            </ul>
          </div>

          <div className="step-card">
            <h3>Step 2 — Get Your Readiness Score</h3>
            <p>
              See exactly how prepared you are with a personalized readiness
              score based on:
            </p>
            <ul>
              <li>Eligibility under CSME</li>
              <li>Documents you already have</li>
              <li>Country-specific requirements</li>
              <li>Verification steps still needed</li>
            </ul>
          </div>

          <div className="step-card">
            <h3>Step 3 — Follow Your Personalized Plan</h3>
            <p>Work through a clear, actionable checklist:</p>
            <ul>
              <li>Document checklist with explanations</li>
              <li>Sample templates &amp; document hints</li>
              <li>Status tracking with checkmarks</li>
              <li>Estimated timelines for each step</li>
            </ul>
          </div>

          <div className="step-card">
            <h3>Step 4 — Move with Confidence</h3>
            <p>
              Use verified resources and official links to take action:
            </p>
            <ul>
              <li>Visit immigration websites</li>
              <li>Find competent authorities</li>
              <li>Compare cost of living and jobs by country</li>
              <li>Read community stories from people who&apos;ve moved</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
