# 🥊 Competitor Research & Market Gap Analysis

## 1. Competitive Landscape Overview

We analyzed existing tools and approaches engineering teams currently use to estimate serverless and VPS compute costs.

| Solution | Strengths | Severe Weaknesses | CloudCrossover Advantage |
|---|---|---|---|
| **Official AWS Pricing Calculator** (`calculator.aws`) | Authoritative rate tables, supports enterprise contracts | Horrendous UX; dozens of nested dropdowns; requires manual arithmetic; **does not compute crossover points**; zero multi-cloud comparison (won't show Hetzner or DigitalOcean). | Instant responsive sliders; computes crossover threshold ($R^*$) automatically; cross-compares AWS, GCP, DO, Hetzner, and Fly side-by-side in real-time. |
| **Holori / Vantage / CloudZero** | Multi-cloud enterprise FinOps suites | Enterprise sales gates; require connecting live cloud billing credentials (IAM / CUR); heavy telemetry; no quick zero-login sandbox for individual devs. | 100% free; zero login; zero credential risk; runs completely client-side in the browser. |
| **Old Open-Source Tools (`theserverless.dev`, etc.)** | Lightweight web calculators | **Defunct / Abandoned** (`theserverless.dev` is offline / 404); outdated 2019 pricing formulas; ignore ARM Graviton discounts; ignore HTTP API Gateway ($1/M); ignore NAT Gateway taxes. | Maintained 2026 pricing; covers ARM vs x86; accounts for NAT Gateways, REST vs HTTP API gateways, and bandwidth overage tiers. |
| **Ad-Hoc Google Sheets / Excel** | Custom formulas tailored to a team | High maintenance; prone to formula errors; not easily shareable across public GitHub issues or Reddit threads. | 1-click Markdown table export for PRs, 1-click ADR generator, and deep-linked URL state hash. |

---

## 2. Key Differentiation & Unfair Advantages

1. **Direct Focus on the "Crossover Point":**
   Competitors answer: *"What will 10M requests cost on AWS?"*
   CloudCrossover answers: *"At what exact request volume will AWS Lambda become 3x more expensive than a Hetzner server?"*
2. **First-Class Pull Request Integration:**
   No other tool offers a **"Copy GitHub PR Markdown"** button that formats a complete, formatted comparison table with winner badges and methodology notes ready to paste into a Git review.
3. **Architectural Governance Integration (ADR):**
   Engineering organizations increasingly require formal Architectural Decision Records (ADRs). CloudCrossover is the first tool to generate a standardized `0001-compute-platform-selection.md` file populated with live financial matrices.
4. **Zero-Friction Privacy:**
   No email collection, no cookies, no tracking scripts, no database backends.
