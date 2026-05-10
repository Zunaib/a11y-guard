"use client";

export default function Hero() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "7rem 2rem 5rem",
        maxWidth: "920px",
        margin: "0 auto",
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(99, 102, 241, 0.12)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          color: "#a5b4fc",
          padding: "0.35rem 1rem",
          borderRadius: "999px",
          fontSize: "0.8rem",
          fontWeight: 600,
          marginBottom: "2rem",
          letterSpacing: "0.01em",
        }}
      >
        <span role="img" aria-label="New">🆕</span>
        EAA enforcement starts June 28, 2025 — are you ready?
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(2.6rem, 6.5vw, 4.25rem)",
          fontWeight: 900,
          lineHeight: 1.08,
          marginBottom: "1.5rem",
          letterSpacing: "-0.03em",
          color: "var(--text)",
        }}
      >
        Stop guessing.
        <br />
        <span
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Know which law
        </span>
        <br />
        you&apos;re breaking.
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "1.15rem",
          color: "var(--muted)",
          maxWidth: "620px",
          margin: "0 auto 2.75rem",
          lineHeight: 1.7,
        }}
      >
        a11y-guard is a region-aware accessibility linter that maps every
        violation to the exact law, jurisdiction, and disability type — so
        engineers and legal teams speak the same language.
      </p>

      {/* CTAs */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a
          href="#install"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.8rem 2rem",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.95rem",
            textDecoration: "none",
            transition: "all 0.2s",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "#4f46e5";
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = "0 8px 28px rgba(99, 102, 241, 0.45)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "var(--accent)";
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "0 4px 16px rgba(99, 102, 241, 0.3)";
          }}
        >
          Get started free →
        </a>
        <a
          href="https://github.com/a11y-guard/a11y-guard"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.8rem 2rem",
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.95rem",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "rgba(255,255,255,0.25)";
            el.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--border)";
            el.style.background = "transparent";
          }}
        >
          View on GitHub
        </a>
      </div>
    </section>
  );
}
