export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl space-y-2">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        {subtitle && <p className="text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
