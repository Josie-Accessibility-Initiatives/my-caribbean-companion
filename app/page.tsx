import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { PlanCTACard } from "@/components/ui/PlanCTACard";

export default function Home() {
  return (
    <div className="page page-home">

      {/* ── SECTION 1 — Hero ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">My Caribbean Companion</h1>
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
      

      {/* ── SECTION 2 — Highlights ─────────────────────────────── */}
      <section className="section section-features">
        <SectionHeader
          title="A smarter way to plan your move"
          subtitle="Personalized insights, eligibility guidance, and Caribbean-specific support in one place."
        />
        <div className="feature-grid">
          <FeatureCard
            title="Destination Insights"
            body="Compare living costs, housing, and job opportunities across Caribbean countries."
          />
          <FeatureCard
            title="Personalized Move Plan"
            body="Receive a CSME checklist, eligibility summary, and document roadmap tailored to your profession."
          />
          <FeatureCard
            title="AI Companion Support"
            body="Get on-demand guidance and move-ready advice as you build your relocation plan."
          />
        </div>
      </section>

      {/* ── SECTION 4 — How It Works ─────────────────────────── */}
      <section className="section section-how">
        <SectionHeader
          title="How It Works"
          subtitle="Plan your Caribbean relocation in four simple steps."
          green
        />
        <div className="steps-list">
          <div className="step-card">
            <h3 className="card-title">Step 1: Tell Us About Your Move</h3>
            <p>
              Select your home country, destination, and professional category
              to get started.
            </p>
          </div>
          <div className="step-card">
            <h3 className="card-title">Step 2: Get Your Personalized Plan</h3>
            <p>
              Receive a customized CSME checklist, eligibility summary, and
              document requirements specific to your move.
            </p>
          </div>
          <div className="step-card">
            <h3 className="card-title">Step 3: Explore Jobs, Housing &amp; Costs</h3>
            <p>
              Browse live job listings, housing options, and a full cost
              breakdown for your destination country.
            </p>
          </div>
          <div className="step-card">
            <h3 className="card-title">Step 4: Move with Confidence</h3>
            <p>
              Use your AI companion, download your PDF roadmap, and track your
              application status every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — Mission / Vision ─────────────────────── */}
      <section className="section section-impact">
        <p className="impact-quote">
          We envision a future where Caribbean professionals can move freely,
          work confidently, and build their futures anywhere across the region.
        </p>
      </section>

      {/* ── SECTION 7 — CTA Card ─────────────────────────────── */}
      <PlanCTACard />

    </div>
  );
}
