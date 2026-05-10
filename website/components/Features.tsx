"use client";

const features = [
  {
    icon: "🌍",
    iconLabel: "Globe",
    title: "Region-aware",
    description:
      "Filter rules by jurisdiction. US and EU have different legal requirements — a11y-guard knows the difference.",
  },
  {
    icon: "⚖️",
    iconLabel: "Scales",
    title: "Law-specific output",
    description:
      "Every violation maps to ADA, EAA, Section 508, AODA, DDA, and 10 more. Your legal team will thank you.",
  },
  {
    icon: "♿",
    iconLabel: "Accessibility",
    title: "Disability-type filtering",
    description:
      "Focus on visual, motor, cognitive, auditory, or seizure-related rules. Audit what matters for your users.",
  },
  {
    icon: "📄",
    iconLabel: "Document",
    title: "HTML Reports",
    description:
      "Generate shareable, self-contained HTML reports with violation cards, fix suggestions, and compliance summaries.",
  },
  {
    icon: "🔌",
    iconLabel: "Plug",
    title: "Vite & ESLint plugins",
    description:
      "Catch violations at build time with the Vite plugin, or inline in JSX/TSX with the ESLint plugin.",
  },
  {
    icon: "🚦",
    iconLabel: "Traffic light",
    title: "CI/CD ready",
    description:
      "GitHub Actions output, SARIF for Advanced Security, and an exit code 1 gate to block non-compliant builds.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "5rem 2rem",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "0.75rem",
        }}
      >
        Why a11y-guard
      </div>
      <h2
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
          fontWeight: 800,
          marginBottom: "1rem",
          letterSpacing: "-0.02em",
        }}
      >
        Everything axe-core doesn&apos;t tell you
      </h2>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "1rem",
          maxWidth: "540px",
          lineHeight: 1.7,
        }}
      >
        Existing tools find violations. a11y-guard tells you which law
        you&apos;re breaking and who&apos;s at risk.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "1.25rem",
          marginTop: "3rem",
        }}
      >
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  iconLabel,
  title,
  description,
}: {
  icon: string;
  iconLabel: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.75rem",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "rgba(99, 102, 241, 0.4)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--border)";
        el.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{ fontSize: "1.75rem", marginBottom: "1rem" }}
        role="img"
        aria-label={iconLabel}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          color: "var(--text)",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>
        {description}
      </p>
    </div>
  );
}
