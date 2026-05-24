import Link from "next/link";

export default function Home() {
  return (
    <div className="page page-home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Inter Regional Movement Planner</h1>
          <p className="hero-subtitle">Bridging Islands, Building Futures.</p>

          <div className="hero-actions">
            <Link href="/onboarding" className="btn-primary">
              Start My Move Plan
            </Link>
            <Link href="/csme-basics" className="btn-secondary">
              Learn About CSME
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-about-main">
        <div className="about-two-column">
          <div>
            <h2>What is the Inter Regional Movement Planner?</h2>
            <p>
              A digital platform that helps Caribbean nationals understand how
              to work legally in other CARICOM countries under CSME. The
              Movement Planner is designed to make CSME free movement easier,
              clearer, and more accessible for every Caribbean national.
            </p>
            <p>It provides:</p>
            <ul>
              <li>Personalized move plans</li>
              <li>Document checklists</li>
              <li>Estimated timelines</li>
              <li>Official government links</li>
              <li>Competent Authority details</li>
              <li>Country-specific requirements</li>
              <li>Tools to track progress and save plans (for logged-in users)</li>
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
            <h3>Step 1 — Tell Us Your Migration Details</h3>
            <p>
              Select your home country, destination country, and professional
              category:
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
            <h3>Step 2 — Generate Your Personalized Migration Plan</h3>
            <p>
              Get a customized guide based on your exact country-to-country
              path, including:
            </p>
            <ul>
              <li>Eligibility summary</li>
              <li>Country-specific requirements</li>
              <li>Category-specific documents</li>
              <li>Verification steps</li>
            </ul>
          </div>

          <div className="step-card">
            <h3>Step 3 — Complete Your Interactive Checklist</h3>
            <p>Track everything you need with clear, actionable tasks:</p>
            <ul>
              <li>Document checklist with explanations</li>
              <li>Sample templates &amp; document hints</li>
              <li>Status tracking with checkmarks</li>
              <li>&ldquo;Add to calendar&rdquo; suggestions (future feature)</li>
            </ul>
          </div>

          <div className="step-card">
            <h3>Step 4 — Explore Resources &amp; Take Action</h3>
            <p>Access official websites, competent authorities, and links:</p>
            <ul>
              <li>Visit immigration websites</li>
              <li>Find competent authorities</li>
              <li>Download forms</li>
              <li>Read country-specific tips</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
