"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatWidget from "@/components/companion/ChatWidget";
import { getOnboarding, type OnboardingContext } from "@/lib/persistence";

export default function CompanionPage() {
  const [context, setContext] = useState<OnboardingContext | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setContext(getOnboarding());
    setLoaded(true);
  }, []);

  return (
    <div className="page page-companion">
      <div className="companion-container">
        <header className="companion-header">
          <h1 className="section-title">Your AI Companion</h1>
          <p className="section-subtitle">
            Ask anything about relocating for work in the Caribbean. Powered
            by Google Gemini.
          </p>
        </header>

        <div className="companion-grid">
          <div className="companion-chat-col">
            <ChatWidget
              userContext={context ?? undefined}
              className="chat-widget-embedded"
            />
          </div>

          <aside className="companion-sidebar">
            <div className="planner-card">
              <h3 className="companion-card-title">Your Move Context</h3>
              {!loaded ? (
                <p className="companion-muted">Loading your plan…</p>
              ) : context ? (
                <>
                  <ul className="companion-context-list">
                    <li>
                      <strong>From:</strong> {context.homeCountry}
                    </li>
                    <li>
                      <strong>To:</strong> {context.targetCountry}
                    </li>
                    <li>
                      <strong>Category:</strong> {context.category}
                    </li>
                  </ul>
                  <Link href="/onboarding" className="companion-change-link">
                    Change plan
                  </Link>
                </>
              ) : (
                <>
                  <p className="companion-muted">
                    No move plan yet. Start the wizard to personalize your
                    guidance.
                  </p>
                  <Link href="/onboarding" className="btn-primary">
                    Start the wizard
                  </Link>
                </>
              )}
            </div>

            <div className="planner-card">
              <h3 className="companion-card-title">What I can help with</h3>
              <ul className="companion-bullet-list">
                <li>CSME eligibility questions</li>
                <li>Required documents by profession</li>
                <li>Skills Certificate guidance</li>
                <li>Country-specific requirements</li>
                <li>Cost and timeline estimates</li>
                <li>Next steps in your relocation</li>
              </ul>
            </div>

            <div className="companion-reminder">
              <h3 className="companion-card-title">Important reminder</h3>
              <p className="companion-reminder-body">
                I provide guidance based on CSME policy but I am not a lawyer.
                Always verify requirements with the official Competent
                Authority in your destination country before submitting
                documents.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
