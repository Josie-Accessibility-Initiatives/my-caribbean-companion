import Link from "next/link";

export default function CsmeBasicsPage() {
  return (
    <div className="page page-csme">
      <section className="banner">
        <div className="banner-content">
          <h1>CSME Basics</h1>
          <p>Understanding Free Movement of Skills across the Caribbean.</p>
        </div>
      </section>

      <section className="section">
        <div className="about-two-column">
          <div>
            <h2>What is the CARICOM Single Market and Economy (CSME)?</h2>
            <p>
              The CARICOM Single Market and Economy (CSME) is an arrangement
              among Member States to create a single economic space. It allows
              for the free movement of goods, services, people, capital, and the
              right of establishment across participating Caribbean countries.
            </p>
            <p>
              For individuals, the most important part is{" "}
              <strong>Free Movement of Skills</strong>, which gives eligible
              CARICOM nationals the right to work in another participating
              Member State without a traditional work permit.
            </p>
            <p className="section-text">
              <a
                href="https://caricom.org/caricom-single-market-and-economy-csme/"
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                Visit the official CSME website for more information.
              </a>
            </p>
          </div>
          <div className="about-csme-card" />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Key Concepts</h2>
        <p className="section-subtitle">
          A quick overview of the ideas behind CSME and Free Movement of Skills.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Free Movement of Skills</h3>
            <p>
              Eligible CARICOM nationals can live and work in another
              participating country once they hold a valid{" "}
              <strong>Skills Certificate</strong> and meet immigration
              requirements.
            </p>
          </div>

          <div className="feature-card">
            <h3>Skills Certificate</h3>
            <p>
              A document issued by a Competent Authority which confirms that
              you belong to an approved category (e.g. university graduate,
              nurse, teacher, artisan). It is usually required before you can
              work in a host country.
            </p>
          </div>

          <div className="feature-card">
            <h3>Not Citizenship or Residency</h3>
            <p>
              Free movement under CSME does <strong>not</strong> automatically
              grant permanent residency or citizenship. It gives you the right
              to seek and take up employment, subject to each country&apos;s
              laws.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-values">
        <h2>Who Can Move Under Free Movement of Skills?</h2>
        <p className="section-subtitle">
          Categories currently approved by many CSME Member States include:
        </p>

        <div className="values-grid">
          <span>University Graduates</span>
          <span>Nurses</span>
          <span>Teachers</span>
          <span>Artisans</span>
          <span>Media Workers</span>
          <span>Sportspersons</span>
          <span>Musicians &amp; Artistes</span>
          <span>Holders of Associate Degrees</span>
          <span>Domestic Workers</span>
          <span>Agricultural Workers</span>
          <span>Private Security Officers</span>
        </div>
      </section>

      <section className="section">
        <div className="step-card">
          <h2>Ready to See What This Means for You?</h2>
          <p>
            Use the Planner to generate a personalized guide based on your home
            country, destination, and category. You&apos;ll see the documents,
            steps, timelines, and official links relevant to your specific
            move.
          </p>
          <Link href="/onboarding" className="btn-primary">
            Plan My Move
          </Link>
        </div>
      </section>
    </div>
  );
}
