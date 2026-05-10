"use client";

const links = [
  {
    label: "GitHub",
    href: "https://github.com/a11y-guard/a11y-guard",
    external: true,
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/a11y-guard",
    external: true,
  },
  {
    label: "WCAG Reference",
    href: "https://www.w3.org/WAI/standards-guidelines/wcag/",
    external: true,
  },
  {
    label: "Report an Issue",
    href: "https://github.com/a11y-guard/a11y-guard/issues",
    external: true,
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "3.5rem 2rem",
        textAlign: "center",
      }}
    >
      {/* Logo + tagline */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <span role="img" aria-hidden="true" style={{ fontSize: "1.3rem" }}>
          🛡️
        </span>
        <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
          a11y-guard
        </span>
      </div>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "0.875rem",
          marginBottom: "1.75rem",
        }}
      >
        Region-aware accessibility compliance linter
      </p>

      {/* Links */}
      <nav aria-label="Footer links">
        <ul
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            listStyle: "none",
            marginBottom: "2rem",
          }}
        >
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                style={{
                  color: "var(--accent)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--accent2)";
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                    "underline";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--accent)";
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                    "none";
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* License */}
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--muted)",
          opacity: 0.7,
        }}
      >
        MIT License · Built to make the web accessible to everyone
      </p>
    </footer>
  );
}
