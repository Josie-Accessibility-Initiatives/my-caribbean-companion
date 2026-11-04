"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { DocCard } from "@/components/resources/DocCard";
import { fetchJson } from "@/lib/fetch-json";
import type { CSMEDocument } from "@/lib/types/documents";

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
    fetchJson<{ global?: CSMEDocument[] }>("/api/documents?global=true")
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
            <p className="mb-1">
              The CARICOM Single Market and Economy (CSME) is an arrangement
              among Caribbean Member States allowing the free movement of goods,
              services, people, and capital across participating countries.
            </p>

            <div className="dashboard-section">
              <p className="dashboard-section-title">
                Free Movement of Skills
              </p>
              <p className="no-margin text-body">
                Eligible CARICOM nationals can live and work in another
                participating country with a Skills Certificate and without a
                traditional work permit.
              </p>
            </div>

            <div className="dashboard-section">
              <p className="dashboard-section-title">
                Not Citizenship or Residency
              </p>
              <p className="no-margin text-body">
                Free movement gives you the right to seek and take up employment
                only. It does not grant permanent residency or citizenship.
              </p>
            </div>

            <a
              href="https://caricom.org/caricom-single-market-and-economy-csme/"
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
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
              <p>{label}</p>
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
          <div className="stack-md mt-1">
            {globalDocs.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 6 — CTA ──────────────────────────────────── */}
      <PlanCTACard />

      {/* ── SECTION 7 — FAQ ──────────────────────────────────── */}
      <section className="section">
        <SectionHeader title="Frequently Asked Questions" />

        <div className="mt-1">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={faq.q} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {faq.q}
                  <ChevronDown size={18} className={`faq-chevron${isOpen ? " open" : ""}`} />
                </button>
                {isOpen && <p className="faq-answer">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
