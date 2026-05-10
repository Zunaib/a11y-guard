# `a11y-guard` — Accessibility Compliance Linter for Frontend Developers

> A TypeScript-first npm package that statically and dynamically audits UI code against disability
> compliance standards — filtered by **region** or **compliance type** — and integrates directly
> into your build pipeline, IDE, and CI/CD workflow.

---

## 1. The Problem

Over **1 billion people** worldwide live with some form of disability. Yet as of 2024, **96.3% of
the top one million homepages** fail basic WCAG 2 conformance (WebAIM Million Report, 2024).

Frontend developers face a fragmented compliance landscape:

- **No single standard** applies globally — the US, EU, Canada, Australia, Japan and others each
  have their own laws and enforcement mechanisms.
- **Existing tools** (axe-core, Lighthouse) check for WCAG violations generically, but don't map
  findings back to *which law you are violating* or *which region that law applies to*.
- **Developers don't know which standard their product must meet** — a SaaS serving federal US
  clients must meet Section 508 + WCAG 2.0 AA; the same product serving EU customers also now
  needs EAA / EN 301 549 compliance (mandatory since June 28, 2025).
- **CI/CD pipelines lack accessibility gates** — accessibility is typically an afterthought rather
  than a build-blocking check.

**`a11y-guard` solves all three problems**: it knows which rules map to which laws, which laws
apply to which regions, and it gives developers clear, actionable, law-specific feedback — in the
terminal, in the IDE, and in CI.

---

## 2. Global Disability Compliance Landscape

### 2.1 The Standards Hierarchy

```
WCAG (W3C Technical Spec — International)
  ├─ Level A   → Minimum baseline (30 criteria)
  ├─ Level AA  → Expected for most legal compliance (20 additional criteria)
  └─ Level AAA → Enhanced (28 additional criteria, rarely legally required)

Regional Laws reference WCAG as their technical benchmark:
  ├─ US:        ADA → WCAG 2.1 AA  |  Section 508 → WCAG 2.0 AA
  ├─ EU:        EAA / EN 301 549   → WCAG 2.1 AA + hardware
  ├─ UK:        Equality Act + PSBAR → WCAG 2.1 AA
  ├─ Canada:    AODA + ACA         → WCAG 2.0 AA (AODA) / WCAG 2.1 AA (ACA)
  ├─ Australia: DDA 1992           → WCAG 2.1 AA
  └─ Others:    Various → mostly WCAG 2.1 AA
```

### 2.2 Compliance Matrix by Region

| Region / Jurisdiction | Law / Standard | WCAG Version Required | Scope | Enforced Since |
|---|---|---|---|---|
| 🇺🇸 USA — Federal | Section 508 (Rehab Act) | WCAG 2.0 AA | Federal agencies + vendors | 2018 |
| 🇺🇸 USA — Public | ADA Title II | WCAG 2.1 AA | State/local governments | 2024 |
| 🇺🇸 USA — Private | ADA Title III | WCAG 2.1 AA (de facto) | Public accommodations | Ongoing |
| 🇪🇺 European Union | EAA / EN 301 549 | WCAG 2.1 AA + more | All digital products/services | **June 28, 2025** |
| 🇬🇧 United Kingdom | Equality Act 2010 + PSBAR | WCAG 2.1 AA | Public sector + services | 2020 |
| 🇨🇦 Canada (Ontario) | AODA | WCAG 2.0 AA | Organizations with 50+ employees | 2021 |
| 🇨🇦 Canada (Federal) | ACA | WCAG 2.1 AA | Federal bodies | 2019 |
| 🇦🇺 Australia | DDA 1992 | WCAG 2.1 AA | All orgs (complaint-based) | 2000+ |
| 🇳🇿 New Zealand | NZ Gov Web Standards | WCAG 2.2 AA | Public sector | 2024 |
| 🇯🇵 Japan | JIS X 8341-3 | WCAG 2.1 AA | Public + recommended private | 2010 |
| 🇧🇷 Brazil | LBI Law 13.146 | WCAG 2.1 AA | All digital services | 2015 |
| 🇮🇱 Israel | IS 5568 | WCAG 2.1 AA | Public + private sector | 2017 |
| 🇮🇳 India | GIGW Guidelines | WCAG 2.0 AA | Government websites | 2009 |
| 🇩🇪 Germany | BITV 2.0 + BGG | WCAG 2.1 AA | Federal + public sector | 2019 |
| 🌍 All EU states | EAA national transpositions | WCAG 2.1 AA | Private sector digital | 2025 |

### 2.3 Compliance Types (by Disability Category)

Beyond region, compliance is also understood by *disability type* — the class of user it protects:

| Type | Covers | Key WCAG Criteria |
|---|---|---|
| **Visual** | Blindness, low vision, color blindness | 1.1.1 (alt text), 1.4.1–1.4.11 (color/contrast), screen reader support |
| **Auditory** | Deafness, hard of hearing | 1.2.x (captions, audio descriptions) |
| **Motor / Physical** | Limited mobility, tremors, no mouse | 2.1.x (keyboard), 2.5.x (pointer gestures), focus management |
| **Cognitive** | ADHD, dyslexia, autism, memory | 2.4.x (navigation), 3.1.x (readable), 3.3.x (error prevention) |
| **Seizure / Vestibular** | Photosensitivity, motion sensitivity | 2.3.x (flashing), 2.3.3 (animation from interactions) |
| **Speech** | Stuttering, non-verbal | Avoidance of voice-only interfaces |
| **Language** | Non-native readers, cognitive load | 3.1.x (language identification), plain language |

---

## 3. Package Design: `a11y-guard`

### 3.1 Core Philosophy

- **Region-aware**: configure which legal jurisdiction your product must satisfy
- **Type-aware**: optionally filter rules by disability category
- **Actionable**: every violation maps to a named law + criterion + fix suggestion
- **Shift-left**: works in TypeScript source, JSX/TSX, HTML, and at runtime in the browser
- **Zero-runtime by default**: static analysis at build time; runtime mode is opt-in

### 3.2 Package Structure

```
a11y-guard/
├── packages/
│   ├── core/                    # Rule engine, compliance mappings, violation types
│   │   ├── src/
│   │   │   ├── rules/           # Individual WCAG rule implementations
│   │   │   ├── compliance/
│   │   │   │   ├── regions.ts   # Region → law → WCAG criteria mapping
│   │   │   │   ├── types.ts     # Disability type → WCAG criteria mapping
│   │   │   │   └── matrix.ts   # Full compliance matrix
│   │   │   ├── engine.ts        # Rule execution engine
│   │   │   └── reporter.ts      # Output formatting
│   ├── eslint-plugin/           # @a11y-guard/eslint-plugin
│   │   └── src/
│   │       └── rules/           # ESLint rule wrappers
│   ├── vite-plugin/             # @a11y-guard/vite-plugin
│   ├── webpack-plugin/          # @a11y-guard/webpack-plugin
│   ├── runtime/                 # @a11y-guard/runtime (browser scanner)
│   └── cli/                     # @a11y-guard/cli
├── tsconfig.base.json
└── package.json (monorepo root)
```

### 3.3 TypeScript API Design

#### Configuration (`a11y-guard.config.ts`)

```typescript
import { defineConfig } from 'a11y-guard';

export default defineConfig({
  // Target compliance by REGION
  regions: ['US', 'EU', 'CA'],

  // OR target compliance by LAW
  laws: ['ADA', 'Section508', 'EAA', 'AODA'],

  // OR target compliance by DISABILITY TYPE
  disabilityTypes: ['visual', 'motor', 'cognitive'],

  // WCAG conformance level
  level: 'AA', // 'A' | 'AA' | 'AAA'

  // What counts as a failure in CI
  failOn: 'error', // 'error' | 'warning' | 'any'

  // Files to scan
  include: ['src/**/*.tsx', 'src/**/*.html'],
  exclude: ['**/*.test.tsx', 'node_modules/**'],

  // Output format
  reporter: 'pretty', // 'pretty' | 'json' | 'sarif' | 'github-actions'

  // Rules to override
  rules: {
    'color-contrast': 'error',
    'missing-alt-text': 'error',
    'keyboard-trap': 'error',
    'focus-visible': 'warning',
  },
});
```

#### Core Types

```typescript
// packages/core/src/types.ts

export type WcagLevel = 'A' | 'AA' | 'AAA';
export type WcagVersion = '2.0' | '2.1' | '2.2';
export type Severity = 'error' | 'warning' | 'info';

export type Region =
  | 'US' | 'EU' | 'UK' | 'CA' | 'AU' | 'NZ'
  | 'JP' | 'BR' | 'IL' | 'IN' | 'DE' | 'FR'
  | 'ES' | 'NL' | 'SE' | 'NO' | 'DK' | 'FI';

export type Law =
  | 'ADA'           // Americans with Disabilities Act
  | 'Section508'    // US Rehabilitation Act Section 508
  | 'EAA'           // European Accessibility Act
  | 'EN301549'      // EU ICT Standard (used by EAA)
  | 'EqualityAct'   // UK Equality Act 2010
  | 'PSBAR'         // UK Public Sector Bodies Accessibility Regulations
  | 'AODA'          // Accessibility for Ontarians with Disabilities Act
  | 'ACA'           // Accessible Canada Act
  | 'DDA'           // Australian Disability Discrimination Act
  | 'BITV20'        // German BITV 2.0
  | 'RGAA'          // French RGAA
  | 'JIS'           // Japanese JIS X 8341-3
  | 'LBI'           // Brazilian Lei Brasileira de Inclusão
  | 'IS5568';       // Israeli Standard 5568

export type DisabilityType =
  | 'visual'
  | 'auditory'
  | 'motor'
  | 'cognitive'
  | 'seizure'
  | 'speech'
  | 'language';

export interface WcagCriterion {
  id: string;             // e.g. "1.1.1"
  name: string;           // e.g. "Non-text Content"
  level: WcagLevel;
  wcagVersion: WcagVersion;
  disabilityTypes: DisabilityType[];
  laws: Law[];            // Which laws reference this criterion
  regions: Region[];      // Which regions' laws apply to this
  url: string;            // Link to official WCAG docs
}

export interface Violation {
  ruleId: string;
  wcagCriterion: WcagCriterion;
  severity: Severity;
  message: string;
  suggestion: string;
  element?: string;       // The HTML element or component
  file?: string;
  line?: number;
  col?: number;
  laws: Law[];            // Which laws this violation breaches
  regions: Region[];      // Which regions are affected
}

export interface AuditResult {
  violations: Violation[];
  warnings: Violation[];
  passed: number;
  summary: ComplianceSummary;
}

export interface ComplianceSummary {
  byRegion: Record<Region, { compliant: boolean; violations: number }>;
  byLaw: Record<Law, { compliant: boolean; violations: number }>;
  byDisabilityType: Record<DisabilityType, { compliant: boolean; violations: number }>;
}
```

#### Region → Law → WCAG Mapping

```typescript
// packages/core/src/compliance/regions.ts

import type { Region, Law, WcagCriterion } from '../types';

export const REGION_LAW_MAP: Record<Region, Law[]> = {
  US: ['ADA', 'Section508'],
  EU: ['EAA', 'EN301549'],
  UK: ['EqualityAct', 'PSBAR'],
  CA: ['AODA', 'ACA'],
  AU: ['DDA'],
  NZ: [],          // NZ Gov Web Standards (WCAG 2.2 AA - public sector)
  JP: ['JIS'],
  BR: ['LBI'],
  IL: ['IS5568'],
  IN: [],          // GIGW Guidelines (WCAG 2.0 AA - government)
  DE: ['BITV20'],
  FR: ['RGAA'],
  ES: ['EAA'],     // Spain implements EAA
  NL: ['EAA'],
  SE: ['EAA'],
  NO: [],          // Norway references WCAG 2.1 AA independently
  DK: ['EAA'],
  FI: ['EAA'],
};

export const LAW_WCAG_REQUIREMENT: Record<Law, {
  version: WcagVersion;
  level: WcagLevel;
  notes: string;
}> = {
  ADA:         { version: '2.1', level: 'AA', notes: 'Title II explicit (2024); Title III de facto via courts' },
  Section508:  { version: '2.0', level: 'AA', notes: 'Federal agencies and vendors; WCAG 2.0 still referenced' },
  EAA:         { version: '2.1', level: 'AA', notes: 'Mandatory June 28 2025; private + public sector in EU' },
  EN301549:    { version: '2.1', level: 'AA', notes: 'Technical spec behind EAA; also covers non-web ICT' },
  EqualityAct: { version: '2.1', level: 'AA', notes: 'UK civil rights law; no explicit WCAG ref but AA is standard' },
  PSBAR:       { version: '2.1', level: 'AA', notes: 'UK public sector bodies; explicit WCAG 2.1 AA requirement' },
  AODA:        { version: '2.0', level: 'AA', notes: 'Ontario; 50+ employees; WCAG 2.0 AA' },
  ACA:         { version: '2.1', level: 'AA', notes: 'Federal Canada; adopts EN 301 549:2021 / WCAG 2.1 AA' },
  DDA:         { version: '2.1', level: 'AA', notes: 'Australia; complaint-based enforcement' },
  BITV20:      { version: '2.1', level: 'AA', notes: 'Germany; federal + public sector' },
  RGAA:        { version: '2.1', level: 'AA', notes: 'France; public sector; national interpretation of WCAG' },
  JIS:         { version: '2.1', level: 'AA', notes: 'Japan; public sector + recommended private' },
  LBI:         { version: '2.1', level: 'AA', notes: 'Brazil; all digital services' },
  IS5568:      { version: '2.1', level: 'AA', notes: 'Israel; public + private sector' },
};
```

#### Rule Implementation Example

```typescript
// packages/core/src/rules/missing-alt-text.ts

import type { Rule, RuleContext, Violation } from '../types';

export const missingAltText: Rule = {
  id: 'missing-alt-text',
  wcagCriterion: '1.1.1',
  name: 'Images must have alternative text',
  description:
    'All non-decorative images must have an alt attribute that describes the content ' +
    'or function of the image for screen reader users.',

  // Which disability types this rule protects
  disabilityTypes: ['visual'],

  // Automatically derived from criterion mapping — no manual listing needed
  // laws: ['ADA', 'Section508', 'EAA', 'AODA', 'DDA', ...all that reference 1.1.1]

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const images = context.querySelectorAll('img');

    for (const img of images) {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      const ariaHidden = img.getAttribute('aria-hidden');

      // Decorative images with role="presentation" or aria-hidden="true" are exempt
      if (role === 'presentation' || ariaHidden === 'true') continue;

      if (alt === null) {
        violations.push({
          ruleId: 'missing-alt-text',
          severity: 'error',
          element: img.outerHTML.slice(0, 100),
          message: 'Image is missing an alt attribute.',
          suggestion:
            'Add alt="descriptive text" for informative images, or alt="" for decorative images.',
          wcagCriterion: context.getCriterion('1.1.1'),
          laws: context.getApplicableLaws('1.1.1'),
          regions: context.getApplicableRegions('1.1.1'),
        });
      } else if (alt.trim() === '' && role !== 'presentation') {
        // Empty alt without explicit decorative marking is suspicious
        violations.push({
          ruleId: 'missing-alt-text',
          severity: 'warning',
          element: img.outerHTML.slice(0, 100),
          message: 'Image has an empty alt attribute but is not marked as decorative.',
          suggestion:
            'If decorative, also set role="presentation". If informative, provide descriptive alt text.',
          wcagCriterion: context.getCriterion('1.1.1'),
          laws: context.getApplicableLaws('1.1.1'),
          regions: context.getApplicableRegions('1.1.1'),
        });
      }
    }

    return violations;
  },
};
```

#### ESLint Plugin Rule Example (JSX/TSX static analysis)

```typescript
// packages/eslint-plugin/src/rules/jsx-img-alt.ts

import type { Rule } from 'eslint';
import { getApplicableLaws, getApplicableRegions } from '@a11y-guard/core';
import type { Law, Region } from '@a11y-guard/core';

export const jsxImgAlt: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce alt attribute on <img> elements in JSX',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          regions: { type: 'array', items: { type: 'string' } },
          laws:    { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingAlt:
        'img element is missing alt text. ' +
        'Violates WCAG 1.1.1 (Level A). ' +
        'Required by: {{laws}} in regions: {{regions}}.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const regions = (options.regions ?? []) as Region[];
    const laws = getApplicableLaws('1.1.1', { regions }) as Law[];
    const applicableRegions = getApplicableRegions('1.1.1', { laws });

    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'img') return;

        const altAttr = node.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'alt'
        );

        if (!altAttr) {
          context.report({
            node,
            messageId: 'missingAlt',
            data: {
              laws: laws.join(', ') || 'ADA, EAA, Section 508, AODA',
              regions: applicableRegions.join(', ') || 'US, EU, CA, AU',
            },
          });
        }
      },
    };
  },
};
```

### 3.4 CLI Usage

```bash
# Install
npm install --save-dev a11y-guard

# Scan with region filter
npx a11y-guard scan --region US --region EU

# Scan with law filter
npx a11y-guard scan --law ADA --law Section508

# Scan by disability type
npx a11y-guard scan --disability-type visual --disability-type motor

# Scan a built directory (HTML output)
npx a11y-guard scan ./dist --level AA --reporter github-actions

# Show the compliance matrix
npx a11y-guard matrix --region US --region EU

# Initialize config
npx a11y-guard init
```

**Example CLI output:**

```
a11y-guard v1.0.0 — Scanning src/**/*.tsx
Regions: US (ADA, Section 508), EU (EAA / EN 301 549)
WCAG Level: 2.1 AA
────────────────────────────────────────────────────────────

ERROR  src/components/Hero.tsx:14:5
  missing-alt-text — WCAG 1.1.1 (Level A)
  <img src="/banner.jpg" /> has no alt attribute.
  → Fix: Add alt="..." with a description of the image content.
  → Laws breached: ADA (US), EAA (EU), Section 508 (US), AODA (CA)
  → Regions affected: US, EU, CA, AU, UK

WARNING  src/components/Form.tsx:42:3
  label-association — WCAG 1.3.1 (Level A)
  <input type="text" /> has no associated <label>.
  → Fix: Add <label htmlFor="input-id"> or use aria-label.
  → Laws breached: ADA (US), EAA (EU)
  → Regions affected: US, EU, UK

────────────────────────────────────────────────────────────
Results:  2 errors, 1 warning, 47 rules passed
Compliance:
  🇺🇸 US (ADA + Section 508)  — ✗ FAIL (2 violations)
  🇪🇺 EU (EAA)                 — ✗ FAIL (2 violations)
  🇨🇦 CA (AODA)                — ✗ FAIL (1 violation)
  🇦🇺 AU (DDA)                 — ✗ FAIL (1 violation)
```

### 3.5 Vite Plugin Integration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { a11yGuard } from '@a11y-guard/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    a11yGuard({
      regions: ['US', 'EU'],
      failOnError: true,   // Fail build on accessibility errors
      reporter: 'pretty',
    }),
  ],
});
```

### 3.6 Runtime Browser Mode (`@a11y-guard/runtime`)

For dev servers and testing, `@a11y-guard/runtime` injects a live overlay:

```typescript
// main.tsx (dev only)
if (import.meta.env.DEV) {
  import('@a11y-guard/runtime').then(({ mountOverlay }) => {
    mountOverlay({
      regions: ['US', 'EU'],
      showPanel: true,     // Floating panel with violation list
      highlightElements: true, // Red outline on violating elements
    });
  });
}
```

---

## 4. Rule Coverage (v1.0 Scope)

### Visual Accessibility
| Rule ID | WCAG | Description |
|---|---|---|
| `missing-alt-text` | 1.1.1 | Images without alt text |
| `color-contrast` | 1.4.3 / 1.4.6 | Text contrast ratio < 4.5:1 (AA) or < 7:1 (AAA) |
| `color-contrast-large` | 1.4.3 | Large text contrast < 3:1 |
| `non-text-contrast` | 1.4.11 | UI components contrast < 3:1 |
| `text-resize` | 1.4.4 | Text doesn't resize to 200% without loss |
| `images-of-text` | 1.4.5 | Text conveyed via images |
| `focus-visible` | 2.4.11 | Focus indicator not visible |
| `target-size` | 2.5.8 | Touch target < 24x24px |

### Auditory Accessibility
| Rule ID | WCAG | Description |
|---|---|---|
| `video-captions` | 1.2.2 | Video without closed captions |
| `audio-description` | 1.2.5 | Video without audio description |
| `live-captions` | 1.2.4 | Live video without captions |
| `audio-control` | 1.4.2 | Auto-playing audio without stop control |

### Motor / Keyboard Accessibility
| Rule ID | WCAG | Description |
|---|---|---|
| `keyboard-accessible` | 2.1.1 | Interactive elements not keyboard accessible |
| `keyboard-trap` | 2.1.2 | Keyboard focus gets trapped |
| `focus-order` | 2.4.3 | Focus order doesn't match visual order |
| `label-in-name` | 2.5.3 | Accessible name doesn't contain visible label |
| `pointer-gestures` | 2.5.1 | Multi-point gestures with no single-pointer alternative |
| `skip-links` | 2.4.1 | No mechanism to skip repeated content |

### Cognitive Accessibility
| Rule ID | WCAG | Description |
|---|---|---|
| `page-title` | 2.4.2 | Page missing descriptive `<title>` |
| `link-purpose` | 2.4.4 | Link text doesn't describe destination |
| `error-identification` | 3.3.1 | Form errors not identified |
| `error-suggestion` | 3.3.3 | No suggestion provided on form error |
| `label-association` | 1.3.1 | Form inputs without associated labels |
| `language-attr` | 3.1.1 | `<html>` missing `lang` attribute |
| `language-parts` | 3.1.2 | Language changes in content not marked |
| `consistent-navigation` | 3.2.3 | Navigation not consistent across pages |
| `on-input` | 3.2.2 | Unexpected context change on input |
| `timeout-adjustable` | 2.2.1 | Session timeout with no adjustment |

### Seizure / Vestibular
| Rule ID | WCAG | Description |
|---|---|---|
| `no-flashing` | 2.3.1 | Content flashing > 3 times per second |
| `animation-from-interactions` | 2.3.3 | Motion animation without reduced-motion respect |

### Structural / Semantic
| Rule ID | WCAG | Description |
|---|---|---|
| `heading-order` | 1.3.1 | Heading levels skipped (h1 → h3) |
| `landmark-regions` | 1.3.6 | No ARIA landmark regions |
| `aria-required-attr` | 4.1.2 | ARIA roles missing required attributes |
| `aria-valid-attr` | 4.1.2 | Invalid ARIA attribute names |
| `aria-valid-attr-value` | 4.1.2 | Invalid ARIA attribute values |
| `duplicate-id` | 4.1.1 | Duplicate `id` attributes on page |
| `html-has-lang` | 3.1.1 | `<html>` missing lang attribute |
| `list-structure` | 1.3.1 | `<li>` outside `<ul>` or `<ol>` |
| `table-headers` | 1.3.1 | Data tables without `<th>` headers |

---

## 5. Differentiators vs Existing Tools

| Feature | `a11y-guard` | axe-core | Lighthouse | eslint-plugin-jsx-a11y |
|---|---|---|---|---|
| Region-aware (US vs EU vs CA etc.) | ✅ | ❌ | ❌ | ❌ |
| Law-specific output (ADA, EAA, AODA) | ✅ | ❌ | ❌ | ❌ |
| Disability-type filtering | ✅ | ❌ | ❌ | ❌ |
| TypeScript-first config | ✅ | ❌ | ❌ | Partial |
| Static JSX/TSX analysis | ✅ | ❌ | ❌ | ✅ |
| Runtime dev overlay | ✅ | ✅ (browser ext) | ✅ (Chrome) | ❌ |
| CI/CD build gate | ✅ | Partial | ✅ | ✅ |
| Vite / Webpack plugin | ✅ | ❌ | ❌ | ❌ |
| WCAG version selection (2.0/2.1/2.2) | ✅ | Partial | 2.1 only | ❌ |
| Compliance summary report | ✅ | ❌ | Partial | ❌ |
| SARIF output (GitHub Advanced Security) | ✅ | ❌ | ❌ | ❌ |

---

## 6. Roadmap

### v1.0 (MVP)
- [x] Core rule engine with WCAG 2.1 AA coverage
- [x] Region + law + disability-type filtering
- [x] CLI with pretty/JSON/SARIF output
- [x] ESLint plugin for JSX/TSX static analysis
- [x] Vite plugin

### v1.1
- [ ] Webpack plugin
- [ ] GitHub Actions integration (`uses: a11y-guard/action@v1`)
- [ ] VS Code extension with inline diagnostics
- [ ] WCAG 2.2 rule additions (2.4.11 Focus Not Obscured, 2.5.8 Target Size)

### v2.0
- [ ] Runtime browser overlay (`@a11y-guard/runtime`)
- [ ] Playwright / Cypress test integration
- [ ] AI-powered fix suggestions via Anthropic API
- [ ] PDF / document accessibility scanning
- [ ] Dashboard web UI for team compliance tracking

---

## 7. Technical Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.x (strict mode) |
| Monorepo | Turborepo + pnpm workspaces |
| Build | tsup (fast ESM + CJS dual output) |
| Testing | Vitest + Testing Library |
| HTML Parsing (runtime) | `parse5` (spec-compliant HTML parser) |
| DOM querying | `css-select` (SSR-compatible) |
| Color contrast | `wcag-contrast` (correct relative luminance) |
| Linting | ESLint + `@typescript-eslint` |
| Docs | TypeDoc |
| Publishing | Changesets |

---

## 8. Monetization Potential

| Model | Description |
|---|---|
| **Open source core** | Free, MIT licensed — builds adoption |
| **Pro CLI** | Team license with SARIF, historical tracking, baseline diffing |
| **Cloud dashboard** | SaaS compliance dashboard per-org, per-project |
| **Consulting hook** | Compliance report generation for enterprise legal needs (VPAT/ACR) |
| **IDE extension** | VS Code marketplace (freemium) |

---

## 9. Getting Started (Quick Reference)

```bash
# Install
npm install --save-dev a11y-guard @a11y-guard/eslint-plugin

# Initialize config
npx a11y-guard init

# Run a scan
npx a11y-guard scan --region US --region EU --level AA

# Add to package.json scripts
{
  "scripts": {
    "a11y": "a11y-guard scan --region US --region EU",
    "a11y:ci": "a11y-guard scan --region US --region EU --reporter github-actions --fail-on error"
  }
}
```

---

*Generated: May 2026 | Based on WCAG 2.1, WCAG 2.2, EAA (enforced June 2025), ADA Title II (2024), Section 508, AODA, DDA, and 30+ other international accessibility laws.*
