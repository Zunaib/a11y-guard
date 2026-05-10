const stats = [
  { num: "36", label: "WCAG Rules" },
  { num: "14", label: "Laws Covered" },
  { num: "18", label: "Regions" },
  { num: "96.3%", label: "Of sites fail WCAG 2" },
];

export default function Stats() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        margin: "5rem 0",
        padding: "3.5rem 2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "4rem",
          flexWrap: "wrap",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{ textAlign: "center" }}
          >
            <div
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              {stat.num}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--muted)",
                marginTop: "0.4rem",
                fontWeight: 500,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
