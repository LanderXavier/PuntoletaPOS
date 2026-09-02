export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
