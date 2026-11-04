import { Fragment } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

const EVOLUTION_STEPS = [
  {
    color: "var(--color-primary)",
    period: "Nov 2025 to Jan 2026",
    title: "Inter Regional Movement Planner",
    body: "A rule-based wizard generating personalized CSME plans. Built with React + Express + Supabase.",
  },
  {
    color: "var(--color-accent)",
    period: "March 2026",
    title: "Technovation AIVA Programme",
    body: "After winning the hackathon, I continued development through the Technovation AIVA programme, expanding the vision from a planner into a full relocation intelligence platform.",
  },
  {
    color: "#1e3a5f",
    period: "2026 to Present",
    title: "My Caribbean Companion",
    body: "A complete rebranding and rebuild in Next.js 14 with AI, live APIs, job board, housing discovery, cost estimator, and Gemini-powered guidance.",
  },
];

export default function AboutPage() {
  return (
    <div className="page page-about">

      {/* ── Hero banner ──────────────────────────────────────── */}
      <section className="banner">
        <div className="banner-content">
          <h1>Behind the Companion</h1>
          <p>
            A Caribbean student, a regional problem, and a platform built to
            solve it.
          </p>
        </div>
      </section>

      {/* ── Meet the developer ───────────────────────────────── */}
      <section className="section">
        <div className="about-dev-grid">
          <div className="about-dev-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/joseann-profile.JPG"
              alt="Joseann Boneo"
              className="developer-photo"
            />
            <p className="about-dev-name">Joseann Boneo</p>
            <p className="about-dev-meta">University Student</p>
            <p className="about-dev-meta">🇹🇹 Trinidad and Tobago</p>
            <a
              href="https://www.linkedin.com/in/joseann-boneo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              LinkedIn ↗
            </a>
          </div>

          <div className="prose">
            <SectionHeader title="Hi, I'm Joseann." />
            <p>
              I&apos;m a university student and aspiring product manager from
              Trinidad and Tobago with a background in front-end development and
              UI/UX design. I&apos;m passionate about using technology to solve
              real problems for Caribbean people.
            </p>
            <p>
              My Caribbean Companion started as a personal frustration. I kept
              hearing from people around me (graduates, nurses, teachers) who
              wanted to work in another Caribbean country but had no idea where
              to start. The CSME free movement rights existed, but the
              information was scattered, confusing, and often wrong.
            </p>
            <p>
              <strong>So I built something to fix that.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── The origin story ─────────────────────────────────── */}
      <section className="section section-values section-band">
        <div className="section-band-inner">
          <SectionHeader title="Where It All Started" subtitle="November 2025" />

          <div className="about-two-column">
            <div className="prose">
              <h3>Caribbean Science Foundation: CSO Coding Olympiad</h3>
              <p>
                In November 2025, I joined the Caribbean Science Foundation&apos;s
                Computer Science Olympiad at Level 3. It was my first serious
                competitive programming challenge and it pushed me to think bigger
                about what technology could do for the Caribbean.
              </p>
              <p>
                The experience gave me a clearer picture of the region&apos;s
                digital gaps, and the confidence that I could help close them.
              </p>
            </div>

            <div className="planner-card quote-card">
              <p className="quote-card-text">
                &ldquo;The Caribbean has all the talent it needs. What it&apos;s
                missing is the infrastructure to connect that talent across
                borders.&rdquo;
              </p>
              <p className="quote-card-author">- Joseann Boneo</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The hackathon win ────────────────────────────────── */}
      <section className="section">
        <div className="about-award-grid">
          <div className="award-card">
            <p className="award-card-medal">🥇</p>
            <p className="award-card-title">1st Place</p>
            <p className="award-card-event">CSO Computer Coding Olympiad</p>
            <p className="award-card-meta">Level 3 Finals · 2026</p>
            <p className="award-card-team">Island Innovators · Trinidad and Tobago</p>
          </div>

          <div className="prose">
            <SectionHeader title="The Hackathon That Started Everything" />
            <p>
              I built the Inter Regional Movement Planner in response: a
              rule-based web platform that generated a personalized CSME
              migration plan based on your home country, destination, and
              profession. It was built with React, Node.js, and Supabase,
              powered by structured JSON rule files and my own front-end
              development background.
            </p>
            <p>
              In late January 2026, that project won Gold at the CSO Computer
              Coding Olympiad Level 3 Finals under the team name Island
              Innovators. It was the validation I needed to keep going.
            </p>
          </div>
        </div>
      </section>

      {/* ── The evolution ────────────────────────────────────── */}
      <section className="section section-values section-band">
        <div className="section-band-inner">
          <SectionHeader title="From Planner to Companion" />

          <div className="evolution-flow">
            {EVOLUTION_STEPS.map((step, i) => (
              <Fragment key={step.title}>
                <div className="evolution-card" style={{ background: step.color }}>
                  <p className="evolution-card-period">{step.period}</p>
                  <h3>{step.title}</h3>
                  <p className="evolution-card-body">{step.body}</p>
                </div>
                {i < EVOLUTION_STEPS.length - 1 && (
                  <div className="evolution-arrow">→</div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div className="cta-band">
        <h2>The work isn&apos;t done.</h2>
        <p>
          CSME free movement has existed since 2006. Twenty years later, most
          Caribbean nationals still don&apos;t know how to use it. My Caribbean
          Companion is my contribution to changing that, one relocation plan at
          a time.
        </p>
        <div className="row row--center">
          <Link href="/onboarding" className="btn-inverse">
            Start My Move Plan
          </Link>
          <Link href="/" className="btn-outline-light">
            View the Platform
          </Link>
        </div>
      </div>

    </div>
  );
}
