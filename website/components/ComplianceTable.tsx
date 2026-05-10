"use client";

const rows = [
  {
    flag: "🇺🇸",
    region: "USA (Federal)",
    law: "Section 508",
    wcag: "WCAG 2.0 AA",
    since: "2018",
  },
  {
    flag: "🇺🇸",
    region: "USA (Public)",
    law: "ADA Title II",
    wcag: "WCAG 2.1 AA",
    since: "2024",
  },
  {
    flag: "🇪🇺",
    region: "European Union",
    law: "EAA / EN 301 549",
    wcag: "WCAG 2.1 AA",
    since: "June 2025",
  },
  {
    flag: "🇬🇧",
    region: "United Kingdom",
    law: "Equality Act + PSBAR",
    wcag: "WCAG 2.1 AA",
    since: "2020",
  },
  {
    flag: "🇨🇦",
    region: "Canada",
    law: "AODA + ACA",
    wcag: "WCAG 2.0–2.1 AA",
    since: "2019–2021",
  },
  {
    flag: "🇦🇺",
    region: "Australia",
    law: "DDA 1992",
    wcag: "WCAG 2.1 AA",
    since: "2000+",
  },
  {
    flag: "🇩🇪",
    region: "Germany",
    law: "BITV 2.0",
    wcag: "WCAG 2.1 AA",
    since: "2019",
  },
  {
    flag: "🇫🇷",
    region: "France",
    law: "RGAA",
    wcag: "WCAG 2.1 AA",
    since: "2020",
  },
  {
    flag: "🇧🇷",
    region: "Brazil",
    law: "LBI 13.146",
    wcag: "WCAG 2.1 AA",
    since: "2015",
  },
  {
    flag: "🇯🇵",
    region: "Japan",
    law: "JIS X 8341-3",
    wcag: "WCAG 2.1 AA",
    since: "2010",
  },
];

export default function ComplianceTable() {
  return (
    <section
      id="compliance"
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
        Global Coverage
      </div>
      <h2
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
          fontWeight: 800,
          marginBottom: "1rem",
          letterSpacing: "-0.02em",
        }}
      >
        14 laws · 18 regions · WCAG 2.0 / 2.1 / 2.2
      </h2>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "1rem",
          maxWidth: "560px",
          lineHeight: 1.7,
          marginBottom: "2.5rem",
        }}
      >
        a11y-guard maintains a complete mapping of which laws apply to which
        regions and which WCAG criteria they require.
      </p>

      <div
        style={{
          overflowX: "auto",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--surface)",
              }}
            >
              {["Region", "Law / Standard", "WCAG Required", "Enforced Since"].map(
                (heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "0.85rem 1.25rem",
                      textAlign: "left",
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "var(--muted)",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.region}
                style={{
                  borderBottom:
                    i < rows.length - 1 ? "1px solid var(--border)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    "rgba(99, 102, 241, 0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)";
                }}
              >
                <td
                  style={{
                    padding: "0.9rem 1.25rem",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span aria-hidden="true">{row.flag}</span>{" "}
                  {row.region}
                </td>
                <td
                  style={{
                    padding: "0.9rem 1.25rem",
                    fontSize: "0.9rem",
                    color: "var(--text)",
                  }}
                >
                  {row.law}
                </td>
                <td style={{ padding: "0.9rem 1.25rem" }}>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#10b981",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "5px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.wcag}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.9rem 1.25rem",
                    fontSize: "0.9rem",
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.since}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
