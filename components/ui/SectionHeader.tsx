interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  green?: boolean;
}

export function SectionHeader({ title, subtitle, green = false }: SectionHeaderProps) {
  return (
    <>
      <h2 className={`section-title${green ? " section-title--accent" : ""}`}>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </>
  );
}
