import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="coming-soon">
      <div className="coming-soon-card">
        <h1 className="section-title">Page not found</h1>
        <p
          style={{
            color: "#4b5563",
            marginTop: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          Let&apos;s get you back on track.
        </p>
        <Link href="/" className="btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
