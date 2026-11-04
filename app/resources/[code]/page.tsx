"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Briefcase, Home, Calculator, BarChart2, ExternalLink, Phone, Mail, Globe } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import FraudAlert from "@/components/resources/FraudAlert";
import { DocRow } from "@/components/resources/DocCard";
import { COUNTRY_META } from "@/data/countryMeta";
import { COUNTRIES } from "@/lib/constants";
import { fetchJson } from "@/lib/fetch-json";
import type { CaribGovContact } from "@/lib/external/caribgov";
import type { CSMEDocument } from "@/lib/types/documents";

type DocumentsResponse = {
  liveContacts: {
    competentAuthority: CaribGovContact | null;
    immigrationDept: CaribGovContact | null;
    source: string;
  } | null;
  documents?: { countrySpecific?: CSMEDocument[] };
  disclaimer?: string;
};

function ContactCard({ contact, label }: { contact: CaribGovContact; label: string }) {
  const links = [
    contact.phone && { href: `tel:${contact.phone}`, Icon: Phone, text: contact.phone },
    contact.email && { href: `mailto:${contact.email}`, Icon: Mail, text: contact.email },
    contact.website && { href: contact.website, Icon: Globe, text: contact.website, external: true },
  ].filter(Boolean) as { href: string; Icon: typeof Phone; text: string; external?: boolean }[];

  return (
    <div className="contact-card">
      <div className="contact-card-label">{label}</div>
      <div className="contact-card-ministry">{contact.ministry}</div>
      {contact.officer && (
        <div className="contact-card-officer">
          {contact.officer}
          {contact.title ? ` — ${contact.title}` : ""}
        </div>
      )}
      <div className="stack-xs">
        {links.map(({ href, Icon, text, external }) => (
          <a
            key={href}
            href={href}
            className="inline-link"
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            <Icon size={13} /> {text}
          </a>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="planner-card mb-1">
      <h2 className="mt-0">{title}</h2>
      {children}
    </div>
  );
}

export default function CountryDetailPage() {
  const params = useParams<{ code: string }>();
  const countryCode = String(params?.code || "").toUpperCase();
  const country = COUNTRIES.find((c) => c.code === countryCode) ?? null;
  const meta = COUNTRY_META[countryCode] ?? null;

  const [docs, setDocs] = useState<DocumentsResponse | null>(null);

  useEffect(() => {
    if (!country) return;
    fetchJson<DocumentsResponse>(`/api/documents?country=${countryCode}`)
      .then(setDocs)
      .catch(() => {
        /* contacts and documents are optional extras */
      });
  }, [country, countryCode]);

  if (!country) {
    return (
      <div className="section">
        <h1>Country not found</h1>
        <p>We couldn&apos;t find a country with code: {countryCode}</p>
        <BackButton href="/resources" label="Back to Resources" />
      </div>
    );
  }

  const liveContacts = docs?.liveContacts;
  const countryDocs = docs?.documents?.countrySpecific ?? [];
  const officialLinks = [
    { label: "Immigration Department", url: country.immigrationUrl },
    { label: "Competent Authority (CSME)", url: country.competentAuthorityUrl },
    { label: "Application Forms", url: country.formsUrl },
  ].filter((l): l is { label: string; url: string } => !!l.url);

  const quickActions = [
    { label: "Find Jobs", href: `/jobs?country=${countryCode}`, Icon: Briefcase },
    { label: "View Housing", href: `/housing?country=${countryCode}`, Icon: Home },
    { label: "Cost Estimate", href: `/cost-estimate?country=${countryCode}`, Icon: Calculator },
    { label: "Compare Countries", href: `/compare?highlight=${countryCode}`, Icon: BarChart2 },
  ];

  return (
    <div className="section">
      <BackButton href="/resources" label="Back to Resources" />

      <h1 className="section-title mt-1">
        {country.name} <span className="text-muted">({country.code})</span>
      </h1>

      <div className="action-grid">
        {quickActions.map(({ label, href, Icon }) => (
          <Link key={href} href={href} className="action-tile">
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>

      {meta?.stats && (
        <div className="planner-card mb-1">
          <div className="stat-grid">
            {[
              { label: "Capital", value: meta.stats.capital },
              { label: "Population", value: meta.stats.population },
              { label: "Currency", value: meta.stats.currency },
              { label: "Languages", value: meta.stats.languages.join(", ") },
            ].map(({ label, value }) => (
              <div key={label} className="stat-tile">
                <div className="stat-tile-label">{label}</div>
                <div className="stat-tile-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meta && meta.industries.length > 0 && (
        <Section title="Emerging Industries">
          <div className="tag-list">
            {meta.industries.map((x) => (
              <span key={x} className="tag">
                {x}
              </span>
            ))}
          </div>
        </Section>
      )}

      {liveContacts?.source === "caribgov" && (
        <Section title="Government Contacts">
          {liveContacts.competentAuthority && (
            <ContactCard contact={liveContacts.competentAuthority} label="Competent Authority (CSME)" />
          )}
          {liveContacts.immigrationDept && (
            <ContactCard contact={liveContacts.immigrationDept} label="Immigration Department" />
          )}
          {!liveContacts.competentAuthority && !liveContacts.immigrationDept && (
            <p className="text-muted no-margin">
              Live contact data is not available for this country. Check the{" "}
              <a href="https://caribgov.com" target="_blank" rel="noreferrer">
                CaribGov directory
              </a>{" "}
              for up-to-date contacts.
            </p>
          )}
        </Section>
      )}

      {officialLinks.length > 0 && (
        <Section title="Official CSME Resources">
          <div className="stack-sm">
            {officialLinks.map(({ label, url }) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="row-link">
                <div>
                  <div className="link-card-title">{label}</div>
                  <div className="text-xs text-subtle">Last verified: January 2025</div>
                </div>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        </Section>
      )}

      {countryDocs.length > 0 && (
        <Section title="Document Resources">
          <div className="stack-sm">
            {countryDocs.map((doc) => (
              <DocRow key={doc.id} doc={doc} />
            ))}
          </div>
        </Section>
      )}

      {docs?.disclaimer && <p className="fine-print mt-1">{docs.disclaimer}</p>}

      <div className="mt-2">
        <FraudAlert context="documents" />
      </div>
    </div>
  );
}
