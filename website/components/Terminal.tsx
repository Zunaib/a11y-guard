export default function Terminal() {
  return (
    <div
      style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "0 2rem",
      }}
    >
      <div
        style={{
          background: "#08081a",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
        role="region"
        aria-label="Terminal output example"
      >
        {/* Traffic light bar */}
        <div
          style={{
            background: "var(--surface)",
            padding: "0.65rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ff5f57",
              display: "inline-block",
            }}
            aria-hidden="true"
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#febc2e",
              display: "inline-block",
            }}
            aria-hidden="true"
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28c840",
              display: "inline-block",
            }}
            aria-hidden="true"
          />
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
              marginLeft: "auto",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            a11y-guard scan --region US EU --level AA
          </span>
        </div>

        {/* Terminal body */}
        <div
          style={{
            padding: "1.5rem 1.75rem",
            fontFamily: "var(--font-geist-mono), 'SF Mono', 'Fira Code', monospace",
            fontSize: "0.83rem",
            lineHeight: 1.85,
            overflowX: "auto",
          }}
        >
          <div style={{ color: "var(--muted)" }}>
            Regions: US (ADA + Section 508), EU (EAA / EN 301 549)
          </div>
          <div style={{ color: "var(--muted)" }}>
            WCAG Level: 2.1 AA &nbsp;·&nbsp; Scanning src/**/*.html
          </div>
          <div style={{ color: "var(--muted)" }}>
            ────────────────────────────────────────────────
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ color: "#ef4444", fontWeight: 700 }}>
              ERROR &nbsp; src/components/Hero.tsx:14
            </div>
            <div>
              &nbsp;&nbsp;
              <span style={{ color: "#c9b1ff" }}>missing-alt-text</span> —
              WCAG 1.1.1 (Level A)
            </div>
            <div style={{ color: "var(--text)" }}>
              &nbsp;&nbsp;&lt;img src=&quot;/banner.jpg&quot; /&gt; has no alt
              attribute.
            </div>
            <div>
              &nbsp;&nbsp;→ Fix: Add{" "}
              <span style={{ color: "#86efac" }}>
                alt=&quot;description of image content&quot;
              </span>
            </div>
            <div>
              &nbsp;&nbsp;→{" "}
              <span style={{ color: "#fde68a" }}>
                Laws breached: ADA (US), EAA (EU), Section 508 (US), AODA (CA)
              </span>
            </div>
            <div style={{ color: "var(--muted)" }}>
              &nbsp;&nbsp;→ Regions affected: US, EU, CA, AU, UK
            </div>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ color: "#f59e0b", fontWeight: 700 }}>
              WARNING src/components/Form.tsx:42
            </div>
            <div>
              &nbsp;&nbsp;
              <span style={{ color: "#c9b1ff" }}>label-association</span> —
              WCAG 1.3.1 (Level A)
            </div>
            <div style={{ color: "var(--text)" }}>
              &nbsp;&nbsp;&lt;input type=&quot;text&quot; /&gt; has no
              associated &lt;label&gt;.
            </div>
            <div>
              &nbsp;&nbsp;→ Fix: Add{" "}
              <span style={{ color: "#86efac" }}>
                &lt;label htmlFor=&quot;input-id&quot;&gt;
              </span>{" "}
              or use aria-label.
            </div>
          </div>

          <div style={{ marginTop: "0.75rem", color: "var(--muted)" }}>
            ────────────────────────────────────────────────
          </div>

          <div style={{ marginTop: "0.25rem" }}>
            Results: &nbsp;
            <span style={{ color: "#ef4444", fontWeight: 700 }}>2 errors</span>
            &nbsp;&nbsp;
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>
              1 warning
            </span>
            &nbsp;&nbsp;
            <span style={{ color: "#10b981", fontWeight: 700 }}>
              47 rules passed
            </span>
          </div>
          <div>
            🇺🇸 US (ADA + Section 508) —{" "}
            <span style={{ color: "#ef4444", fontWeight: 700 }}>
              ✗ FAIL (2 violations)
            </span>
          </div>
          <div>
            🇪🇺 EU (EAA) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;—{" "}
            <span style={{ color: "#ef4444", fontWeight: 700 }}>
              ✗ FAIL (2 violations)
            </span>
          </div>
          <div>
            🇨🇦 CA (AODA) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;—{" "}
            <span style={{ color: "#ef4444", fontWeight: 700 }}>
              ✗ FAIL (1 violation)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
