interface FeatureCardProps {
  icon?: string;
  title: string;
  body: string;
}

export function FeatureCard({ icon, title, body }: FeatureCardProps) {
  return (
    <div className="feature-card">
      {icon && <p className="feature-card-icon">{icon}</p>}
      <h3 className="card-title">{title}</h3>
      <p className="feature-card-body">{body}</p>
    </div>
  );
}
