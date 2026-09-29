export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}) {
  const centered = align === "center";

  return (
    <div
      className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} mb-12 ${className}`}
    >
      {eyebrow && (
        <p className="text-brand-400 text-xs font-medium uppercase tracking-wide mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="font-display text-3xl md:text-4xl font-semibold leading-[1.15] scroll-mt-28"
      >
        {title}
      </h2>
      {description && <p className="text-ink-500 mt-4">{description}</p>}
    </div>
  );
}
