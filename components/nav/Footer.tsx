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
              <li>Students &amp; Graduates</li>
              <li>Skilled Professionals</li>
              <li>Regional Job Seekers</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Explore</h4>
            <ul>
              <li>CSME Basics</li>
              <li>Plan My Move</li>
              <li>Country Resources</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li>Help &amp; FAQ</li>
              <li>Contact</li>
              <li>Privacy &amp; Terms</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
