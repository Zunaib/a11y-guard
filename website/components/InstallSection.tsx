"use client";

import { useState } from "react";

const INSTALL_CMD = "npm install --save-dev a11y-guard @a11y-guard/cli";

const steps = [
  {
    number: "1",
    title: "Init",
    command: "npx a11y-guard init",
    description: "Creates a config file and injects package.json scripts",
  },
  {
    number: "2",
    title: "Scan",
    command: "pnpm a11y",
    description: "Scans your project and prints violations with law mappings",
  },
  {
    number: "3",
    title: "Report",
    command: "pnpm a11y:html",
    description:
      "Generates a11y-report.html to share with your team or legal counsel",
  },
];

export default function InstallSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section
      id="install"
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
        Get Started
      </div>
      <h2
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
          fontWeight: 800,
          marginBottom: "2.5rem",
          letterSpacing: "-0.02em",
        }}
      >
        Up and running in 60 seconds
      </h2>

      {/* Install command box */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "1.25rem 1.75rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <code
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "0.95rem",
            color: "var(--text)",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <span style={{ color: "var(--muted)", userSelect: "none" }}>$ </span>
          {INSTALL_CMD}
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? "#10b981" : "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1.25rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
            transition: "background 0.2s, transform 0.1s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.background = "#4f46e5";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--accent)";
            }
          }}
          aria-label={copied ? "Copied to clipboard" : "Copy install command"}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Steps */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {steps.map((step) => (
          <div
            key={step.number}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Step number watermark */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-0.5rem",
                right: "1rem",
                fontSize: "5rem",
                fontWeight: 900,
                color: "rgba(99,102,241,0.07)",
                lineHeight: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {step.number}
            </div>

            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}
            >
              Step {step.number}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                marginBottom: "0.75rem",
              }}
            >
              {step.title}
            </div>
            <code
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "0.85rem",
                color: "#93c5fd",
                display: "block",
                marginBottom: "0.6rem",
              }}
            >
              {step.command}
            </code>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--muted)",
                lineHeight: 1.55,
              }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
