export default function AboutPage() {
  return (
    <div className="page page-about">
      <section className="banner">
        <div className="banner-content">
          <h1>About the Platform</h1>
          <p>Empowering Caribbean Mobility Through Technology.</p>
        </div>
      </section>

      <section className="section section-why">
        <h2 className="section-title">Why use the Movement Planner?</h2>
        <p className="section-subtitle">
          A smarter way to navigate work and mobility across CARICOM nations.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Built for CARICOM</h3>
            <p>Designed specifically for regional free movement and CSME.</p>
          </div>
          <div className="feature-card">
            <h3>Personalized Move Plan</h3>
            <p>
              Get customized steps based on your home country, destination, and
              profession.
            </p>
          </div>
          <div className="feature-card">
            <h3>Smart Checklist</h3>
            <p>Know exactly which documents you need, with explanations.</p>
          </div>
          <div className="feature-card">
            <h3>Action Timeline</h3>
            <p>
              See estimated timelines and suggested dates to keep you on track.
            </p>
          </div>
          <div className="feature-card">
            <h3>Country Requirements</h3>
            <p>View country-specific notes, links, and verification steps.</p>
          </div>
          <div className="feature-card">
            <h3>Save &amp; Track Progress</h3>
            <p>Log in to save your plan and track your checklist over time.</p>
          </div>
        </div>
      </section>

      <section className="section section-values">
        <h2>What We Stand For</h2>
        <div className="values-grid">
          <span>Clarity</span>
          <span>Empowerment</span>
          <span>Innovation</span>
          <span>Accessibility</span>
          <span>Unity</span>
        </div>
      </section>

      <section className="section section-impact">
        <p className="impact-quote">
          We envision a future where regional mobility is seamless,
          opportunities are borderless, and Caribbean professionals can
          confidently build their futures anywhere across the region.
        </p>

        <div className="about-two-column">
          <div className="about-image2-card" />
          <div>
            <h2>Mission Statement</h2>
            <p>
              We believe that Caribbean talent should be able to move freely
              across the region with clarity and confidence. The Inter Regional
              Movement Planner was created to bridge the gap between CARICOM
              policies and real-world user experience.
            </p>
            <p>Our mission is to provide:</p>
            <ul>
              <li>
                Clear, personalized guidance on how to work across CSME Member
                States
              </li>
              <li>Transparent requirements for each category and country</li>
              <li>
                Practical tools like checklists, timelines, and official links
              </li>
              <li>
                A simple digital space where anyone—student, professional, or
                employer—can understand and navigate regional mobility
              </li>
            </ul>
            <p>
              By translating policy into an intuitive digital planner, we aim
              to support economic opportunity, strengthen regional integration,
              and help build a more connected Caribbean workforce.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
