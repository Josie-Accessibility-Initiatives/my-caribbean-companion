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

      {/* ── SECTION 3 — Why use My Caribbean Companion? ─────── */}
      <section className="section section-why">
        <SectionHeader
          title="Why use My Caribbean Companion?"
          subtitle="My Caribbean Companion helps CARICOM citizens understand and navigate
          the process of legally relocating for work under the CSME Free
          Movement of Skills framework. We make the process clear, personalized,
          and stress-free."
          green
        />
        <div className="feature-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <FeatureCard
            title="Built for CARICOM"
            body="Designed specifically for CSME free movement rights across all 12 member states."
          />
          <FeatureCard
            title="Personalized Move Plan"
            body="Get a customized checklist and timeline based on your home country, destination, and profession."
          />
          <FeatureCard
            title="Live Job Board"
            body="Search real job opportunities across the Caribbean matched to your profession and destination."
          />
          <FeatureCard
            title="Cost Estimator"
            body="Know exactly what your relocation will cost: flights, housing, documents, and living expenses."
          />
          <FeatureCard
            title="Housing Discovery"
            body="Find rental ranges, neighborhoods, Facebook housing groups, and temporary accommodation in your destination."
          />
          <FeatureCard
            title="AI Companion"
            body="Ask anything about CSME in plain language. Your AI guide is available on every page."
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
