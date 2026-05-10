export default function CodeShowcase() {
  return (
    <section
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
        Integrations
      </div>
      <h2
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
          fontWeight: 800,
          marginBottom: "1rem",
          letterSpacing: "-0.02em",
        }}
      >
        Works where you already work
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginTop: "3rem",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <CodeBlock title="a11y-guard.config.ts">
            <span style={{ color: "#c792ea" }}>import</span>
            {" { defineConfig } "}
            <span style={{ color: "#c792ea" }}>from</span>{" "}
            <span style={{ color: "#c3e88d" }}>&apos;a11y-guard&apos;</span>;
            {"\n\n"}
            <span style={{ color: "#c792ea" }}>export default</span> defineConfig({"{"}{"\n"}
            {"  "}<span style={{ color: "#82aaff" }}>regions</span>:{" "}
            [<span style={{ color: "#c3e88d" }}>&apos;US&apos;</span>,{" "}
            <span style={{ color: "#c3e88d" }}>&apos;EU&apos;</span>,{" "}
            <span style={{ color: "#c3e88d" }}>&apos;CA&apos;</span>],{"\n"}
            {"  "}<span style={{ color: "#82aaff" }}>level</span>:{" "}
            <span style={{ color: "#c3e88d" }}>&apos;AA&apos;</span>,{"\n"}
            {"  "}<span style={{ color: "#82aaff" }}>failOn</span>:{" "}
            <span style={{ color: "#c3e88d" }}>&apos;error&apos;</span>,{"\n"}
            {"  "}<span style={{ color: "#82aaff" }}>reporter</span>:{" "}
            <span style={{ color: "#c3e88d" }}>&apos;html&apos;</span>,{"\n"}
            {"  "}<span style={{ color: "#82aaff" }}>rules</span>: {"{"}{"\n"}
            {"    "}
            <span style={{ color: "#c3e88d" }}>&apos;missing-alt-text&apos;</span>:{" "}
            <span style={{ color: "#c3e88d" }}>&apos;error&apos;</span>,{"\n"}
            {"    "}
            <span style={{ color: "#c3e88d" }}>&apos;color-contrast&apos;</span>:{" "}
            <span style={{ color: "#c3e88d" }}>&apos;error&apos;</span>,{"\n"}
            {"    "}
            <span style={{ color: "#c3e88d" }}>&apos;focus-visible&apos;</span>:{" "}
            <span style={{ color: "#c3e88d" }}>&apos;warn&apos;</span>,{"\n"}
            {"  }"},
            {"\n"});
          </CodeBlock>

          <CodeBlock title=".github/workflows/a11y.yml">
            <span style={{ color: "#82aaff" }}>- name</span>:{" "}
            <span style={{ color: "#c3e88d" }}>Accessibility audit</span>
            {"\n"}
            {"  "}
            <span style={{ color: "#82aaff" }}>run</span>:{" "}
            <span style={{ color: "#c3e88d" }}>
              npx a11y-guard scan \{"\n"}
              {"    "}--region US EU \{"\n"}
              {"    "}--reporter github-actions \{"\n"}
              {"    "}--fail-on error
            </span>
          </CodeBlock>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <CodeBlock title="vite.config.ts">
            <span style={{ color: "#c792ea" }}>import</span>
            {" { a11yGuard } "}
            <span style={{ color: "#c792ea" }}>from</span>{" "}
            <span style={{ color: "#c3e88d" }}>
              &apos;@a11y-guard/vite-plugin&apos;
            </span>
            ;{"\n\n"}
            <span style={{ color: "#c792ea" }}>export default</span>{" "}
            defineConfig({"{"}{"\n"}
            {"  "}plugins: [{"\n"}
            {"    "}a11yGuard({"{"}{"\n"}
            {"      "}
            <span style={{ color: "#82aaff" }}>regions</span>:{" "}
            [<span style={{ color: "#c3e88d" }}>&apos;US&apos;</span>,{" "}
            <span style={{ color: "#c3e88d" }}>&apos;EU&apos;</span>],{"\n"}
            {"      "}
            <span style={{ color: "#82aaff" }}>failOnError</span>:{" "}
            <span style={{ color: "#c792ea" }}>true</span>,{"\n"}
            {"    }"},){"\n"}
            {"  }"},
            {"\n"}{");"}
          </CodeBlock>

          <CodeBlock title="eslint.config.js">
            <span style={{ color: "#c792ea" }}>import</span> a11yGuard{" "}
            <span style={{ color: "#c792ea" }}>from</span>{" "}
            <span style={{ color: "#c3e88d" }}>
              &apos;@a11y-guard/eslint-plugin&apos;
            </span>
            ;{"\n\n"}
            <span style={{ color: "#c792ea" }}>export default</span> [{"{"}{"\n"}
            {"  "}
            <span style={{ color: "#82aaff" }}>plugins</span>:{" "}
            {"{ "}
            <span style={{ color: "#c3e88d" }}>&apos;@a11y-guard&apos;</span>:
            a11yGuard {"} "},{"\n"}
            {"  "}
            <span style={{ color: "#82aaff" }}>rules</span>: {"{"}{"\n"}
            {"    "}
            <span style={{ color: "#c3e88d" }}>
              &apos;@a11y-guard/jsx-img-alt&apos;
            </span>
            :{" "}
            <span style={{ color: "#c3e88d" }}>&apos;error&apos;</span>,{"\n"}
            {"    "}
            <span style={{ color: "#c3e88d" }}>
              &apos;@a11y-guard/jsx-label-association&apos;
            </span>
            :{" "}
            <span style={{ color: "#c3e88d" }}>&apos;error&apos;</span>,{"\n"}
            {"    "}
            <span style={{ color: "#c3e88d" }}>
              &apos;@a11y-guard/jsx-link-text&apos;
            </span>
            : <span style={{ color: "#c3e88d" }}>&apos;warn&apos;</span>,{"\n"}
            {"  }"},
            {"\n"}];
          </CodeBlock>
        </div>
      </div>
    </section>
  );
}

function CodeBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#08081a",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          padding: "0.6rem 1rem",
          fontSize: "0.75rem",
          color: "var(--muted)",
          fontFamily: "var(--font-geist-mono), monospace",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </div>
      <pre
        style={{
          padding: "1.25rem 1.5rem",
          fontFamily: "var(--font-geist-mono), 'SF Mono', 'Fira Code', monospace",
          fontSize: "0.82rem",
          lineHeight: 1.75,
          overflowX: "auto",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}
