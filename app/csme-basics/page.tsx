"use client";

import { useState, Fragment, useEffect } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PlanCTACard } from "@/components/ui/PlanCTACard";
import {
  GraduationCap,
  Heart,
  BookOpen,
  Wrench,
  Tv,
  Trophy,
  Music,
  Award,
  Home,
  Leaf,
  Shield,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import type { CSMEDocument, DocumentType } from "@/lib/types/documents";

const BADGE: Record<DocumentType, { label: string; bg: string; color: string }> = {
  guide:               { label: "Guide",     bg: "#d1fae5", color: "#065f46" },
  form:                { label: "Form",      bg: "#dbeafe", color: "#1e40af" },
  reference:           { label: "Reference", bg: "#f3f4f6", color: "#374151" },
  authority:           { label: "Authority", bg: "#e0e7ff", color: "#1e3a8a" },
  competent_authority: { label: "Authority", bg: "#e0e7ff", color: "#1e3a8a" },
};

function TypeBadge({ type }: { type: DocumentType }) {
  const b = BADGE[type] ?? BADGE.reference;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: b.bg, color: b.color, marginBottom: "0.4rem" }}>
      {b.label}
    </span>
  );
}

function DocCard({ doc }: { doc: CSMEDocument }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderLeft: "3px solid var(--color-primary)", borderRadius: "0.5rem", padding: "1rem" }}>
      <TypeBadge type={doc.type} />
      <div style={{ fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>{doc.title}</div>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem" }}>{doc.description}</p>
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-primary)", textDecoration: "none" }}
      >
        View Official Source <ExternalLink size={13} />
      </a>
    </div>
  );
}

const CATEGORIES = [
  { label: "University Graduates",        Icon: GraduationCap },
  { label: "Nurses",                       Icon: Heart },
  { label: "Teachers",                     Icon: BookOpen },
  { label: "Artisans",                     Icon: Wrench },
  { label: "Media Workers",               Icon: Tv },
  { label: "Sportspersons",               Icon: Trophy },
  { label: "Musicians & Artistes",        Icon: Music },
  { label: "Holders of Associate Degrees", Icon: Award },
  { label: "Domestic Workers",            Icon: Home },
  { label: "Agricultural Workers",        Icon: Leaf },
  { label: "Private Security Officers",   Icon: Shield },
];

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

const FAQS = [
  {
    q: "Do I need a job offer before applying for a Skills Certificate?",
    a: "No. You apply for the Skills Certificate in your home country before securing employment. The certificate gives you the right to seek work in member states.",
  },
  {
    q: "How long does the Skills Certificate application take?",
    a: "Processing times vary by country, typically 2 to 16 weeks. Barbados and smaller islands tend to process faster than larger countries. Check your country's competent authority for current timelines.",
  },
  {
    q: "Is the Skills Certificate the same as a work permit?",
    a: "No. The Skills Certificate confirms your eligibility under CSME. Some countries may still require you to register with their labour or immigration authority on arrival, but you do not need a traditional work permit.",
  },
  {
    q: "Can my family come with me?",
    a: "Dependants (spouse and minor children) of a CSME worker are generally allowed to accompany you, but they may not automatically have the right to work. Rules vary by member state.",
  },
  {
    q: "What happens if I want to move to a different CARICOM country later?",
    a: "You would need to repeat the process for the new destination country. Your Skills Certificate from your home country remains valid, but you need to meet the immigration requirements of each new destination.",
  },
];

export default function CsmeBasicsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [globalDocs, setGlobalDocs] = useState<CSMEDocument[]>([]);

  useEffect(() => {
    fetch("/api/documents?global=true")
      .then((r) => r.json())
      .then((d) => setGlobalDocs(d.global ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="page page-csme">

      {/* ── SECTION 1 — Hero ────────────────────────────────── */}
      <section className="banner">
        <div className="banner-content">
          <h1>Understanding CSME</h1>
          <p>
            Everything you need to know about Free Movement of Skills across
            the Caribbean.
          </p>
        </div>
      </section>

      {/* ── SECTION 2 — What is CSME? ───────────────────────── */}
      <section className="section">
        <div className="about-two-column">
          <div>
            <h2 className="section-title">What is CSME?</h2>
            <p style={{ marginBottom: "1.25rem" }}>
              The CARICOM Single Market and Economy (CSME) is an arrangement
              among Caribbean Member States allowing the free movement of goods,
              services, people, and capital across participating countries.
            </p>

            <div className="dashboard-section" style={{ marginBottom: "1rem" }}>
              <p style={{ fontWeight: 600, marginBottom: "0.35rem", margin: "0 0 0.35rem" }}>
                Free Movement of Skills
              </p>
              <p style={{ margin: 0, color: "#4b5563" }}>
                Eligible CARICOM nationals can live and work in another
                participating country with a Skills Certificate and without a
                traditional work permit.
              </p>
            </div>

            <div className="dashboard-section" style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontWeight: 600, margin: "0 0 0.35rem" }}>
                Not Citizenship or Residency
              </p>
              <p style={{ margin: 0, color: "#4b5563" }}>
                Free movement gives you the right to seek and take up employment
                only. It does not grant permanent residency or citizenship.
              </p>
            </div>

            <a
              href="https://caricom.org/caricom-single-market-and-economy-csme/"
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              Visit the official CSME website ↗
            </a>
          </div>
          <div className="about-csme-card" />
        </div>
      </section>

      {/* ── SECTION 4 — Who Can Move? ────────────────────────── */}
      <section className="section section-values">
        <SectionHeader
          title="Who Can Move Under Free Movement of Skills?"
          subtitle="CSME currently recognises these professional categories:"
        />
        <div className="csme-category-grid">
          {CATEGORIES.map(({ label, Icon }) => (
            <div key={label} className="csme-category-card">
              <Icon size={24} color="var(--color-primary)" />
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5 — How the Process Works ───────────────── */}
      <section className="section">
        <SectionHeader
          title="How the Process Works"
          subtitle="A simplified overview of the CSME application process."
        />

        {/* Circle row with connecting lines (desktop) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          {STEPS.map((step, i) => (
            <Fragment key={step.n}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                  flexShrink: 0,
                }}
              >
                {step.n}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: "#e5e7eb" }} />
              )}
            </Fragment>
          ))}
        </div>

        {/* Step text grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {STEPS.map((step) => (
            <div key={step.n} className="feature-card" style={{ padding: "1rem" }}>
              <h3 style={{ margin: "0 0 0.4rem", fontWeight: 600, fontSize: "0.95rem" }}>
                {step.title}
              </h3>
              <p style={{ margin: 0, color: "#4b5563", fontSize: "0.875rem" }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 7 — Document Hub ─────────────────────────── */}
      {globalDocs.length > 0 && (
        <section className="section">
          <SectionHeader
            title="Official CSME Documents"
            subtitle="Verified resources from the CARICOM Secretariat to help you start your application."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            {globalDocs.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 6 — FAQ ──────────────────────────────────── */}
      <section className="section">
        <SectionHeader title="Frequently Asked Questions" />

        <div style={{ marginTop: "1rem" }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                style={{ borderBottom: "1px solid #e5e7eb", padding: "1rem 0" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#111827",
                    padding: 0,
                  }}
                >
                  {faq.q}
                  <ChevronDown
                    size={18}
                    style={{
                      flexShrink: 0,
                      marginLeft: "1rem",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: "#6b7280",
                    }}
                  />
                </button>
                {isOpen && (
                  <p
                    style={{
                      margin: "0.75rem 0 0",
                      color: "#4b5563",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 8 — CTA ──────────────────────────────────── */}
      <PlanCTACard />

    </div>
  );
}
