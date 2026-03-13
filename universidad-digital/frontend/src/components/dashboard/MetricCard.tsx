type MetricTone = "default" | "success" | "warning";

type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: MetricTone;
};

export function MetricCard({ label, value, hint, tone = "default" }: MetricCardProps) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </article>
  );
}
