interface FeatureCardProps {
  icon?: string;
  title: string;
  body: string;
}

export function FeatureCard({ icon, title, body }: FeatureCardProps) {
  return (
    <div className="feature-card">
      {icon && (
        <p style={{ fontSize: "1.6rem", margin: "0 0 0.5rem", lineHeight: 1 }}>
          {icon}
        </p>
      )}
      <h3 className="card-title">{title}</h3>
      <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem" }}>{body}</p>
    </div>
  );
}
