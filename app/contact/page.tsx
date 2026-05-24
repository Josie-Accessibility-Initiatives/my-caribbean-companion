"use client";

export default function ContactPage() {
  return (
    <div className="page page-contact">
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          Have questions, feedback, or suggestions? We&apos;re here to help.
        </p>
      </section>

      <section className="contact-layout">
        <div className="contact-form-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks for your message! (Demo only)");
            }}
          >
            <label className="form-label">
              Name
              <input
                className="form-input"
                type="text"
                placeholder="Your name"
              />
            </label>

            <label className="form-label">
              Surname
              <input
                className="form-input"
                type="text"
                placeholder="Your surname"
              />
            </label>

            <label className="form-label">
              Email
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
              />
            </label>

            <label className="form-label">
              Message
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Tell us how we can help…"
              />
            </label>

            <button type="submit" className="btn-primary full-width">
              Submit
            </button>
          </form>
        </div>

        <div className="contact-info-card">
          <h2>Reach Us Directly</h2>
          <p>
            This is a prototype platform for exploring how technology can
            support CSME-based regional mobility.
          </p>
          <ul className="contact-list">
            <li>
              <strong>Email:</strong> support@interregionalplanner.org (demo)
            </li>
            <li>
              <strong>Region:</strong> Caribbean (virtual project)
            </li>
            <li>
              <strong>Response time:</strong> Within 2–3 business days
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
