import { Fragment } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";

const EVOLUTION_STEPS = [
  {
    color: "#117F74",
    period: "Nov 2025 to Jan 2026",
    title: "Inter Regional Movement Planner",
    body: "A rule-based wizard generating personalized CSME plans. Built with React + Express + Supabase."
  },
  {
    color: "#D85A30",
    period: "March 2026",
    title: "Technovation AIVA Programme",
    body: "After winning the hackathon, I continued development through the Technovation AIVA programme, expanding the vision from a planner into a full relocation intelligence platform."
  },
  {
    color: "#1e3a5f",
    period: "2026 to Present",
    title: "My Caribbean Companion",
    body: "A complete rebranding and rebuild in Next.js 14 with AI, live APIs, job board, housing discovery, cost estimator, and Gemini-powered guidance."
  },
];

export default function AboutPage() {
  return (
    <div className="page page-about">

      {/* ── SECTION 1 — Hero banner ──────────────────────────── */}
      <section className="banner">
        <div className="banner-content">
          <h1>Behind the Companion</h1>
          <p>
            A Caribbean student, a regional problem, and a platform built to
            solve it.
          </p>
        </div>
      </section>

      {/* ── SECTION 2 — Meet the developer ──────────────────── */}
      <section className="section" style={{ paddingTop: "2.5rem" }}>
        <div className="about-dev-grid">

          {/* Left — avatar card */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/joseann-profile.JPG"
              alt="Joseann Boneo"
              className="developer-photo"
            />
            <p style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "1.2rem", color: "#111827" }}>
              Joseann Boneo
            </p>
            <p style={{ margin: "0 0 0.2rem", color: "#6b7280", fontSize: "0.9rem" }}>
              University Student
            </p>
            <p style={{ margin: "0 0 0.75rem", color: "#6b7280", fontSize: "0.9rem" }}>
              🇹🇹 Trinidad and Tobago
            </p>
            <a
              href="https://www.linkedin.com/in/joseann-boneo/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "var(--color-primary)",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              LinkedIn ↗
            </a>
          </div>

          {/* Right — story text */}
          <div>
            <SectionHeader title="Hi, I'm Joseann." />
            <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: "1rem" }}>
              I&apos;m a university student and aspiring product manager from
              Trinidad and Tobago with a background in front-end development and
              UI/UX design. I&apos;m passionate about using technology to solve
              real problems for Caribbean people.
            </p>
            <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: "1rem" }}>
              My Caribbean Companion started as a personal frustration. I kept
              hearing from people around me (graduates, nurses, teachers) who
              wanted to work in another Caribbean country but had no idea where
              to start. The CSME free movement rights existed, but the
              information was scattered, confusing, and often wrong.
            </p>
            <p style={{ color: "#4b5563", lineHeight: 1.7, margin: 0, fontWeight: 600 }}>
              So I built something to fix that.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — The origin story ────────────────────── */}
      <section className="section section-values" style={{ maxWidth: "100%", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <SectionHeader title="Where It All Started" subtitle="November 2025" />

          <div className="about-two-column" style={{ marginTop: "1.5rem" }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.75rem", color: "#111827" }}>
                Caribbean Science Foundation: CSO Coding Olympiad
              </h3>
              <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: "1rem" }}>
                In November 2025, I joined the Caribbean Science Foundation&apos;s
                Computer Science Olympiad at Level 3. It was my first serious
                competitive programming challenge and it pushed me to think bigger
                about what technology could do for the Caribbean.
              </p>
              <p style={{ color: "#4b5563", lineHeight: 1.7, margin: 0 }}>
                The experience gave me a clearer picture of the region&apos;s
                digital gaps, and the confidence that I could help close them.
              </p>
            </div>

            <div className="planner-card quote-card">
              <p style={{ fontStyle: "italic", fontSize: "1rem", color: "#374151", lineHeight: 1.7, margin: "0 0 0.75rem" }}>
                &ldquo;The Caribbean has all the talent it needs. What it&apos;s
                missing is the infrastructure to connect that talent across
                borders.&rdquo;
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: 600 }}>
                - Joseann Boneo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — The hackathon win ───────────────────── */}
      <section className="section" style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)", gap: "2rem", alignItems: "start" }}>

          <div style={{ background: "var(--color-primary)", borderRadius: "0.75rem", padding: "2rem 1.5rem", textAlign: "center", color: "#ffffff" }}>
            <p style={{ fontSize: "3rem", margin: "0 0 0.5rem", lineHeight: 1 }}>🥇</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0 0 0.4rem" }}>1st Place</p>
            <p style={{ fontSize: "0.9rem", fontWeight: 500, margin: "0 0 0.3rem", opacity: 0.95 }}>CSO Computer Coding Olympiad</p>
            <p style={{ fontSize: "0.85rem", margin: "0 0 0.75rem", opacity: 0.85 }}>Level 3 Finals · 2026</p>
            <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.7 }}>Island Innovators · Trinidad and Tobago</p>
          </div>

          <div>
            <SectionHeader title="The Hackathon That Started Everything" />
            <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: "1rem" }}>
              I built the Inter Regional Movement Planner in response: a
              rule-based web platform that generated a personalized CSME
              migration plan based on your home country, destination, and
              profession. It was built with React, Node.js, and Supabase,
              powered by structured JSON rule files and my own front-end
              development background.
            </p>
            <p style={{ color: "#4b5563", lineHeight: 1.7, margin: 0 }}>
              In late January 2026, that project won Gold at the CSO Computer
              Coding Olympiad Level 3 Finals under the team name Island
              Innovators. It was the validation I needed to keep going.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — The evolution ───────────────────────── */}
      <section className="section section-values" style={{ maxWidth: "100%", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <SectionHeader title="From Planner to Companion" />

          <div className="evolution-flow">
            {EVOLUTION_STEPS.map((step, i) => (
              <Fragment key={step.title}>
                <div className="evolution-card" style={{ background: step.color }}>
                  <p style={{ fontSize: "0.75rem", opacity: 0.8, margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {step.period}
                  </p>
                  <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", opacity: 0.9, lineHeight: 1.6 }}>
                    {step.body}
                  </p>
                </div>
                {i < EVOLUTION_STEPS.length - 1 && (
                  <div className="evolution-arrow">→</div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7 — CTA ─────────────────────────────────── */}
      <div style={{ background: "var(--color-primary)", padding: "3.5rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.75rem", fontWeight: 700, margin: "0 0 1rem" }}>
          The work isn&apos;t done.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 1.75rem" }}>
          CSME free movement has existed since 2006. Twenty years later, most
          Caribbean nationals still don&apos;t know how to use it. My Caribbean
          Companion is my contribution to changing that, one relocation plan at
          a time.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/onboarding"
            style={{ background: "#ffffff", color: "var(--color-primary)", borderRadius: "999px", padding: "0.65rem 1.5rem", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "2px solid #ffffff" }}
          >
            Start My Move Plan
          </Link>
          <Link
            href="/"
            style={{ background: "transparent", color: "#ffffff", borderRadius: "999px", padding: "0.65rem 1.5rem", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "2px solid rgba(255,255,255,0.6)" }}
          >
            View the Platform
          </Link>
        </div>
      </div>

    </div>
  );
}
