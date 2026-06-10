import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/Logo-simple.png" alt="Caribbean Companion" style={{ height: 40, width: "auto", display: "block" }} />
        </div>
        <p className="footer-tagline">
          My Caribbean Companion: Your guide to working anywhere in the
          Caribbean.
        </p>

        <div className="footer-columns" style={{ marginTop: "1.5rem" }}>
          <div className="footer-column">
            <h4>Use cases</h4>
            <ul>
              <li><Link href="/onboarding">Students &amp; Graduates</Link></li>
              <li><Link href="/onboarding">Skilled Professionals</Link></li>
              <li><Link href="/jobs">Regional Job Seekers</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/csme-basics">CSME Basics</Link></li>
              <li><Link href="/onboarding">Plan My Move</Link></li>
              <li><Link href="/resources">Country Resources</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li><Link href="/csme-basics">Help &amp; FAQ</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/csme-basics">Privacy &amp; Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
