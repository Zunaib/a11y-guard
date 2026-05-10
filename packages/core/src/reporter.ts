import type { AuditResult, Violation, Region, Law, A11yGuardConfig } from './types.js';

const REGION_FLAGS: Record<string, string> = {
  US: '🇺🇸', EU: '🇪🇺', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', NZ: '🇳🇿',
  JP: '🇯🇵', BR: '🇧🇷', IL: '🇮🇱', IN: '🇮🇳', DE: '🇩🇪', FR: '🇫🇷',
  ES: '🇪🇸', NL: '🇳🇱', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮',
};

const LAW_REGION_LABEL: Record<string, string> = {
  US: 'ADA + Section 508',
  EU: 'EAA / EN 301 549',
  UK: 'Equality Act + PSBAR',
  CA: 'AODA + ACA',
  AU: 'DDA',
  NZ: 'NZ Gov Web Standards',
  JP: 'JIS X 8341-3',
  BR: 'LBI 13.146',
  IL: 'IS 5568',
  IN: 'GIGW',
  DE: 'BITV 2.0',
  FR: 'RGAA',
};

function severityLabel(severity: string): string {
  switch (severity) {
    case 'error':   return 'ERROR  ';
    case 'warning': return 'WARNING';
    case 'info':    return 'INFO   ';
    default:        return severity.toUpperCase().padEnd(7);
  }
}

function line(char = '─', length = 60): string {
  return char.repeat(length);
}

export function formatPretty(result: AuditResult, config: A11yGuardConfig, scanTarget?: string): string {
  const out: string[] = [];
  const regions = config.regions ?? [];
  const version = config.wcagVersion ?? '2.1';
  const level = config.level ?? 'AA';

  out.push(`\na11y-guard v1.0.0 — Scanning ${scanTarget ?? 'target'}`);
  if (regions.length > 0) {
    const regionDesc = regions.map((r) => `${r} (${LAW_REGION_LABEL[r] ?? r})`).join(', ');
    out.push(`Regions: ${regionDesc}`);
  }
  out.push(`WCAG Level: ${version} ${level}`);
  out.push(line());

  const all = [...result.violations, ...result.warnings];
  if (all.length === 0) {
    out.push('\n✅ No accessibility violations found!');
  }

  for (const v of all) {
    const loc = v.file ? `${v.file}${v.line ? `:${v.line}` : ''}${v.col ? `:${v.col}` : ''}` : '';
    out.push(`\n${severityLabel(v.severity)}${loc ? '  ' + loc : ''}`);
    out.push(`  ${v.ruleId} — WCAG ${v.wcagCriterion.id} (Level ${v.wcagCriterion.level})`);
    out.push(`  ${v.message}`);
    if (v.element) out.push(`  Element: ${v.element}`);
    out.push(`  → Fix: ${v.suggestion}`);
    if (v.laws.length > 0) out.push(`  → Laws breached: ${v.laws.join(', ')}`);
    if (v.regions.length > 0) out.push(`  → Regions affected: ${v.regions.join(', ')}`);
  }

  out.push(`\n${line()}`);
  out.push(`Results:  ${result.violations.length} errors, ${result.warnings.length} warnings, ${result.passed} rules passed`);

  const configuredRegions = config.regions ?? [];
  if (configuredRegions.length > 0) {
    out.push('Compliance:');
    for (const region of configuredRegions) {
      const r = result.summary.byRegion[region as Region];
      if (!r) continue;
      const flag = REGION_FLAGS[region] ?? '🌐';
      const label = LAW_REGION_LABEL[region] ?? region;
      const status = r.compliant ? '✅ PASS' : `✗ FAIL (${r.violations} violation${r.violations !== 1 ? 's' : ''})`;
      out.push(`  ${flag} ${region.padEnd(4)} (${label.padEnd(24)}) — ${status}`);
    }
  }

  out.push('');
  return out.join('\n');
}

export function formatJson(result: AuditResult, config: A11yGuardConfig): string {
  return JSON.stringify({ config, result }, null, 2);
}

export function formatGithubActions(result: AuditResult): string {
  const lines: string[] = [];
  for (const v of [...result.violations, ...result.warnings]) {
    const level = v.severity === 'error' ? 'error' : 'warning';
    const file = v.file ?? '';
    const line_ = v.line ?? 1;
    const col = v.col ?? 1;
    const title = `${v.ruleId} — WCAG ${v.wcagCriterion.id}`;
    const msg = `${v.message} Fix: ${v.suggestion}`;
    lines.push(`::${level} file=${file},line=${line_},col=${col},title=${title}::${msg}`);
  }
  return lines.join('\n');
}

export function formatSarif(result: AuditResult, scanTarget?: string): string {
  const all = [...result.violations, ...result.warnings];

  const rules = [...new Map(all.map((v) => [v.ruleId, v])).values()].map((v) => ({
    id: v.ruleId,
    name: v.wcagCriterion.name,
    shortDescription: { text: v.wcagCriterion.name },
    fullDescription: { text: v.message },
    helpUri: v.wcagCriterion.url,
    properties: {
      tags: ['accessibility', `wcag-${v.wcagCriterion.id}`, `level-${v.wcagCriterion.level}`],
    },
  }));

  const results = all.map((v) => ({
    ruleId: v.ruleId,
    level: v.severity === 'error' ? 'error' : v.severity === 'warning' ? 'warning' : 'note',
    message: { text: `${v.message} ${v.suggestion}` },
    locations: v.file ? [{
      physicalLocation: {
        artifactLocation: { uri: v.file },
        region: { startLine: v.line ?? 1, startColumn: v.col ?? 1 },
      },
    }] : [],
  }));

  const sarif = {
    $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
    version: '2.1.0',
    runs: [{
      tool: {
        driver: {
          name: 'a11y-guard',
          version: '1.0.0',
          informationUri: 'https://github.com/a11y-guard/a11y-guard',
          rules,
        },
      },
      artifacts: scanTarget ? [{ location: { uri: scanTarget } }] : [],
      results,
    }],
  };

  return JSON.stringify(sarif, null, 2);
}

export function formatHtml(results: Array<{ result: AuditResult; file: string }>, config: A11yGuardConfig): string {
  const allViolations = results.flatMap((r) => r.result.violations);
  const allWarnings  = results.flatMap((r) => r.result.warnings);
  const infoItems    = allWarnings.filter((v) => v.severity === 'info');
  const warnItems    = allWarnings.filter((v) => v.severity === 'warning');
  const totalPassed  = results.reduce((n, r) => n + r.result.passed, 0);
  const scannedFiles = results.map((r) => r.file);
  const regions      = config.regions ?? [];
  const generatedAt  = new Date().toLocaleString();
  const hasIssues    = allViolations.length > 0 || allWarnings.length > 0;

  // ── helpers ──────────────────────────────────────────────────────────────
  function escHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── region compliance pills ───────────────────────────────────────────────
  const regionPills = regions.map((region) => {
    const flag  = REGION_FLAGS[region] ?? '🌐';
    const label = LAW_REGION_LABEL[region] ?? region;
    const count = allViolations.filter((v) => v.regions.includes(region as never)).length;
    const pass  = count === 0;
    return `<span class="region-pill ${pass ? 'pill-pass' : 'pill-fail'}">${flag} ${region} · ${label} · ${pass ? '✅ PASS' : '✗ FAIL'}</span>`;
  }).join('');

  // ── single violation card ─────────────────────────────────────────────────
  function violationCard(v: Violation, type: 'error' | 'warning' | 'info'): string {
    const loc = v.file
      ? `${v.file}${v.line ? `:${v.line}` : ''}${v.col ? `:${v.col}` : ''}`
      : '';
    return `
        <div class="vcard vcard-${type}">
          <div class="vcard-header">
            <span class="sev-badge sev-${type}">${type.toUpperCase()}</span>
            <span class="vcard-rule">${escHtml(v.ruleId)}</span>
            <span class="wcag-chip">WCAG ${escHtml(v.wcagCriterion.id)} · Level ${escHtml(v.wcagCriterion.level)}</span>
            ${loc ? `<span class="loc-chip">${escHtml(loc)}</span>` : ''}
          </div>
          <p class="vcard-msg">${escHtml(v.message)}</p>
          ${v.element ? `<pre class="code-block">${escHtml(v.element)}</pre>` : ''}
          <div class="vcard-footer">
            <div class="footer-row">
              <span class="footer-icon">💡</span>
              <span class="footer-text">${escHtml(v.suggestion)}</span>
            </div>
            ${v.laws.length > 0 ? `<div class="footer-row"><span class="footer-icon">⚖️</span><span class="footer-text">${v.laws.map((l) => `<span class="chip chip-law">${escHtml(l)}</span>`).join('')}</span></div>` : ''}
            ${v.regions.length > 0 ? `<div class="footer-row"><span class="footer-icon">🌍</span><span class="footer-text">${v.regions.map((r) => `<span class="chip chip-region">${REGION_FLAGS[r] ?? '🌐'} ${r}</span>`).join('')}</span></div>` : ''}
          </div>
        </div>`;
  }

  // ── group violations by file ──────────────────────────────────────────────
  function fileGroups(
    violations: Violation[],
    type: 'error' | 'warning' | 'info',
    openByDefault: boolean,
  ): string {
    if (violations.length === 0) return '';
    const byFile = new Map<string, Violation[]>();
    for (const v of violations) {
      const key = v.file ?? '(unknown file)';
      if (!byFile.has(key)) byFile.set(key, []);
      byFile.get(key)!.push(v);
    }
    return [...byFile.entries()].map(([file, vs]) => `
      <details class="file-group" ${openByDefault ? 'open' : ''}>
        <summary class="file-summary">
          <span class="file-summary-icon">📄</span>
          <span class="file-summary-name">${escHtml(file)}</span>
          <span class="file-summary-count">${vs.length} issue${vs.length !== 1 ? 's' : ''}</span>
        </summary>
        <div class="file-cards">
          ${vs.map((v) => violationCard(v, type)).join('')}
        </div>
      </details>`).join('');
  }

  const errorGroups   = fileGroups(allViolations, 'error',   true);
  const warnGroups    = fileGroups(warnItems,     'warning',  false);
  const infoGroups    = fileGroups(infoItems,     'info',     false);

  // ── files chip list ───────────────────────────────────────────────────────
  const fileChips = scannedFiles
    .map((f) => `<span class="file-chip">${escHtml(f)}</span>`)
    .join('');

  // ── empty state ───────────────────────────────────────────────────────────
  const emptyState = !hasIssues ? `
    <div class="empty-state">
      <div class="empty-check">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="#10b981" stroke-width="3" stroke-dasharray="188.5" stroke-dashoffset="188.5" style="animation:drawCircle 0.6s ease forwards;"/>
          <polyline points="18,33 27,42 46,22" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="42" stroke-dashoffset="42" style="animation:drawCheck 0.4s ease 0.5s forwards;"/>
        </svg>
      </div>
      <h2 class="empty-title">All clear!</h2>
      <p class="empty-sub">All ${totalPassed} rules passed across ${scannedFiles.length} file${scannedFiles.length !== 1 ? 's' : ''}.</p>
    </div>` : '';

  // ── final HTML ────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>a11y-guard Accessibility Report</title>
  <style>
    /* ── reset & base ─────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #060612;
      color: #e2e2f0;
      line-height: 1.6;
      min-height: 100vh;
    }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── topbar ───────────────────────────────────── */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(6,6,18,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 0 2rem;
      height: 56px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .topbar-logo {
      font-size: 1rem;
      font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }
    .topbar-version {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.3);
      font-weight: 500;
      padding: 0.15rem 0.45rem;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 99px;
    }
    .topbar-date {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
      margin-left: auto;
    }
    .topbar-chip {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      background: rgba(99,102,241,0.15);
      color: #818cf8;
      border: 1px solid rgba(99,102,241,0.25);
    }

    /* ── layout ───────────────────────────────────── */
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 2.5rem 2rem 4rem;
    }
    .section-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.3);
      margin: 2.5rem 0 0.75rem;
    }

    /* ── summary hero ─────────────────────────────── */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    @media (max-width: 640px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-card {
      background: #0e0e22;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 1.5rem 1.25rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    .stat-icon { font-size: 1.25rem; line-height: 1; }
    .stat-num {
      font-size: 2.75rem;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .stat-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255,255,255,0.35);
    }
    .stat-card.sc-error  .stat-num { color: #ef4444; }
    .stat-card.sc-warn   .stat-num { color: #f59e0b; }
    .stat-card.sc-info   .stat-num { color: #3b82f6; }
    .stat-card.sc-passed .stat-num { color: #10b981; }

    /* ── region pills ─────────────────────────────── */
    .region-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .region-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.35rem 0.8rem;
      border-radius: 99px;
      border: 1px solid;
      white-space: nowrap;
    }
    .pill-pass {
      background: rgba(16,185,129,0.1);
      color: #10b981;
      border-color: rgba(16,185,129,0.25);
    }
    .pill-fail {
      background: rgba(239,68,68,0.1);
      color: #ef4444;
      border-color: rgba(239,68,68,0.25);
    }

    /* ── files chip strip ─────────────────────────── */
    .files-strip {
      display: flex;
      flex-wrap: nowrap;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    .files-strip::-webkit-scrollbar { height: 4px; }
    .files-strip::-webkit-scrollbar-track { background: transparent; }
    .files-strip::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
    .file-chip {
      display: inline-block;
      white-space: nowrap;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.72rem;
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5);
    }

    /* ── file group (collapsible) ─────────────────── */
    .file-group {
      background: #0e0e22;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      margin-bottom: 0.75rem;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(0,0,0,0.3);
    }
    .file-summary {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.9rem 1.25rem;
      cursor: pointer;
      list-style: none;
      user-select: none;
      transition: background 0.15s ease;
    }
    .file-summary::-webkit-details-marker { display: none; }
    .file-summary::marker { display: none; }
    .file-summary:hover { background: rgba(255,255,255,0.03); }
    .file-summary-icon { font-size: 0.9rem; opacity: 0.6; }
    .file-summary-name {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.7);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-summary-count {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.4);
      white-space: nowrap;
    }
    .file-summary::before {
      content: '▶';
      font-size: 0.6rem;
      color: rgba(255,255,255,0.25);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }
    details[open] > .file-summary::before { transform: rotate(90deg); }
    .file-cards {
      padding: 0 1rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      animation: fadeIn 0.15s ease;
    }

    /* ── violation card ───────────────────────────── */
    .vcard {
      border-radius: 10px;
      padding: 1.1rem 1.2rem;
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.05);
      border-left: 3px solid;
    }
    .vcard-error   { border-left-color: #ef4444; }
    .vcard-warning { border-left-color: #f59e0b; }
    .vcard-info    { border-left-color: #3b82f6; }

    .vcard-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.65rem;
    }
    .sev-badge {
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      padding: 0.18rem 0.5rem;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .sev-error   { background: rgba(239,68,68,0.18);  color: #f87171; }
    .sev-warning { background: rgba(245,158,11,0.18); color: #fbbf24; }
    .sev-info    { background: rgba(59,130,246,0.18); color: #60a5fa; }
    .vcard-rule {
      font-weight: 700;
      font-size: 0.88rem;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      color: #e2e2f0;
    }
    .wcag-chip {
      font-size: 0.72rem;
      padding: 0.18rem 0.5rem;
      border-radius: 4px;
      background: rgba(139,92,246,0.12);
      color: #a78bfa;
      border: 1px solid rgba(139,92,246,0.2);
    }
    .loc-chip {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.7rem;
      color: rgba(255,255,255,0.3);
      margin-left: auto;
      white-space: nowrap;
    }

    .vcard-msg {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 0.65rem;
      line-height: 1.55;
    }

    .code-block {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.78rem;
      line-height: 1.6;
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 7px;
      padding: 0.75rem 1rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      color: #a5b4fc;
      margin-bottom: 0.65rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .vcard-footer {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .footer-row {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      font-size: 0.82rem;
    }
    .footer-icon { flex-shrink: 0; font-size: 0.85rem; }
    .footer-text { color: rgba(255,255,255,0.5); line-height: 1.5; }

    /* ── inline chips ─────────────────────────────── */
    .chip {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      margin: 0 0.2rem 0.2rem 0;
    }
    .chip-law {
      background: rgba(99,102,241,0.12);
      color: #818cf8;
      border: 1px solid rgba(99,102,241,0.2);
    }
    .chip-region {
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.45);
      border: 1px solid rgba(255,255,255,0.08);
    }

    /* ── empty state ──────────────────────────────── */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #0e0e22;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    .empty-check { display: inline-block; margin-bottom: 1.5rem; }
    .empty-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #10b981;
      margin-bottom: 0.5rem;
    }
    .empty-sub { color: rgba(255,255,255,0.35); font-size: 0.9rem; }

    /* ── footer ───────────────────────────────────── */
    .footer {
      text-align: center;
      padding: 2rem;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.2);
      border-top: 1px solid rgba(255,255,255,0.05);
      margin-top: 3rem;
    }
    .footer a { color: #6366f1; }
    .footer a:hover { color: #818cf8; }

    /* ── animations ───────────────────────────────── */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes drawCircle {
      to { stroke-dashoffset: 0; }
    }
    @keyframes drawCheck {
      to { stroke-dashoffset: 0; }
    }
  </style>
</head>
<body>

  <!-- ── topbar ─────────────────────────────────────────────────────────── -->
  <header class="topbar">
    <span class="topbar-logo">a11y-guard</span>
    <span class="topbar-version">v1.0.0</span>
    <span class="topbar-chip">${scannedFiles.length} file${scannedFiles.length !== 1 ? 's' : ''}</span>
    <span class="topbar-date">Generated ${generatedAt}</span>
  </header>

  <div class="container">

    <!-- ── summary hero ─────────────────────────────────────────────────── -->
    <p class="section-label">Summary</p>
    <div class="summary-grid">
      <div class="stat-card sc-error">
        <span class="stat-icon">🔴</span>
        <span class="stat-num">${allViolations.length}</span>
        <span class="stat-label">Errors</span>
      </div>
      <div class="stat-card sc-warn">
        <span class="stat-icon">🟡</span>
        <span class="stat-num">${warnItems.length}</span>
        <span class="stat-label">Warnings</span>
      </div>
      <div class="stat-card sc-info">
        <span class="stat-icon">🔵</span>
        <span class="stat-num">${infoItems.length}</span>
        <span class="stat-label">Info</span>
      </div>
      <div class="stat-card sc-passed">
        <span class="stat-icon">✅</span>
        <span class="stat-num">${totalPassed}</span>
        <span class="stat-label">Rules Passed</span>
      </div>
    </div>

    ${regions.length > 0 ? `
    <!-- ── compliance by region ───────────────────────────────────────── -->
    <p class="section-label">Compliance by Region</p>
    <div class="region-pills">${regionPills}</div>` : ''}

    <!-- ── files scanned ────────────────────────────────────────────────── -->
    <p class="section-label">Files Scanned</p>
    <div class="files-strip">${fileChips}</div>

    ${emptyState}

    ${allViolations.length > 0 ? `
    <!-- ── errors ─────────────────────────────────────────────────────── -->
    <p class="section-label">Errors (${allViolations.length})</p>
    ${errorGroups}` : ''}

    ${warnItems.length > 0 ? `
    <!-- ── warnings ───────────────────────────────────────────────────── -->
    <p class="section-label">Warnings (${warnItems.length})</p>
    ${warnGroups}` : ''}

    ${infoItems.length > 0 ? `
    <!-- ── info ───────────────────────────────────────────────────────── -->
    <p class="section-label">Info (${infoItems.length})</p>
    ${infoGroups}` : ''}

  </div>

  <footer class="footer">
    Generated by <a href="https://github.com/a11y-guard/a11y-guard" target="_blank" rel="noopener">a11y-guard</a>
    &mdash; Region-aware accessibility compliance linter
  </footer>

</body>
</html>`;
}

export function format(result: AuditResult, config: A11yGuardConfig, scanTarget?: string): string {
  switch (config.reporter) {
    case 'json':           return formatJson(result, config);
    case 'sarif':          return formatSarif(result, scanTarget);
    case 'github-actions': return formatGithubActions(result);
    default:               return formatPretty(result, config, scanTarget);
  }
}
