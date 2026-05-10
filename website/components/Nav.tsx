"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled
          ? "rgba(6, 6, 18, 0.92)"
          : "rgba(6, 6, 18, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        padding: "0.85rem 2rem",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        transition: "background 0.3s ease",
      }}
    >
      <a
        href="#"
        style={{
          fontWeight: 800,
          fontSize: "1.1rem",
          color: "#fff",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          letterSpacing: "-0.02em",
        }}
        aria-label="a11y-guard home"
      >
        <span role="img" aria-hidden="true" style={{ fontSize: "1.3rem" }}>
          🛡️
        </span>
        a11y-guard
      </a>

      <ul
        style={{
          display: "flex",
          gap: "1.5rem",
          listStyle: "none",
          marginLeft: "auto",
          alignItems: "center",
        }}
      >
        {[
          { label: "Features", href: "#features" },
          { label: "Compliance", href: "#compliance" },
          { label: "Install", href: "#install" },
          {
            label: "GitHub",
            href: "https://github.com/a11y-guard/a11y-guard",
            external: true,
          },
        ].map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--muted)")
              }
            >
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href="https://github.com/a11y-guard/a11y-guard"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "background 0.2s, transform 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "#4f46e5";
              (e.currentTarget as HTMLAnchorElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "var(--accent)";
              (e.currentTarget as HTMLAnchorElement).style.transform =
                "translateY(0)";
            }}
          >
            GitHub ↗
          </a>
        </li>
      </ul>
    </nav>
  );
}
