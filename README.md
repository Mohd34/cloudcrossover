# ☁️ CloudCrossover — Serverless vs VPS Cost & Break-Even Engine

> **The mathematically rigorous break-even calculator for engineering teams deciding between AWS Lambda, Google Cloud Run, Fly.io, and VPS hosting (Hetzner, DigitalOcean, EC2).**

Live Production URL: [https://mohd34.github.io/cloudcrossover/](https://mohd34.github.io/cloudcrossover/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-16%20Passed-emerald.svg)](tests/)
[![Offline PWA](https://img.shields.io/badge/PWA-Ready-cyan.svg)](site.webmanifest)
[![Zero Tracking](https://img.shields.io/badge/Tracking-Zero-purple.svg)](legal/privacy.html)

---

## 🎯 The Problem

Developers and DevOps engineers frequently debate whether to build microservices on Serverless (AWS Lambda, Cloud Run) or fixed Virtual Private Servers (Hetzner, DigitalOcean Droplets, EC2).

While Serverless is celebrated for zero-maintenance and instant scaling from zero, it harbors severe financial pitfalls at scale:
1. **The API Gateway Tax:** AWS API Gateway charges \$1.00 to \$3.50 per million calls—often exceeding Lambda compute costs.
2. **The Private VPC NAT Gateway Tax:** Putting Lambda in a private VPC requires an AWS NAT Gateway at \$32.85/mo idle fee per AZ + \$0.045/GB.
3. **Bandwidth Egress Extortion:** AWS charges \$0.09/GB for egress, whereas Hetzner provides 20,000 GB for €3.79/month.

**CloudCrossover** computes the exact mathematical crossover point ($R^*$) where variable serverless fees exceed fixed VPS hosting costs, and provides 1-click sharing mechanics for pull requests, RFCs, and team discussions.

---

## 🚀 Key Features

- **Exact Mathematical Crossover ($R^*$):** Binary-search solved break-even threshold accounting for memory, execution latency, CPU architecture (ARM Graviton vs x86), and API Gateway types.
- **2026 Cloud Rates Pre-Loaded:**
  - **AWS Lambda:** x86 (\$0.00001667/GB-s), ARM Graviton (\$0.00001333/GB-s), HTTP API Gateway (\$1.00/M), REST API Gateway (\$3.50/M), 100GB free egress.
  - **Google Cloud Run:** vCPU-second (\$0.000024), GiB-second (\$0.0000025), requests (\$0.40/M).
  - **Hetzner Cloud CX22:** 2 vCPU / 4GB RAM at €3.79 (~$4.15 USD) with 20TB included traffic.
  - **DigitalOcean Droplets:** \$6 (1GB) and \$12 (2GB) with 1TB–2TB bandwidth.
  - **AWS EC2:** t4g.small + Application Load Balancer (ALB) + LCU metrics.
  - **Fly.io:** Shared CPU instances + global bandwidth.
- **Built-in Distribution & Sharing Hub:**
  - 🔗 **Deep-Linked URL State:** Every parameter encoded in URL hash (`#r=...`).
  - 📋 **GitHub PR Markdown Table:** 1-click formatted comparison table ready to paste into GitHub PRs and RFCs.
  - 💬 **Reddit / Discord Argument Snippet:** Concise summary for tech community discussions.
  - 📥 **Architectural Decision Record (ADR-001):** Downloadable Markdown document ready to commit to `docs/adr/0001-compute-platform-selection.md`.
- **100% Client-Side & Private:** No telemetry, no external database, no user tracking.

---

## 🛠️ Project Structure

```
cloudcrossover/
├── assets/
│   ├── css/
│   │   └── style.css            # Developer dark/light design system
│   ├── img/
│   │   └── favicon.svg          # Custom SVG crossover icon
│   └── js/
│       ├── app.js               # Reactive DOM controller & clipboard actions
│       └── calculators.js       # Core mathematical and pricing engine
├── legal/
│   ├── privacy.html             # Client-side privacy guarantee
│   └── terms.html               # Service terms & open-source disclaimer
├── tests/
│   ├── formulas.test.js         # Rigorous mathematical unit test suite (16 tests)
│   └── site-audit.js            # Structural, SEO, and link verification (21 tests)
├── adr-generator.html           # Dedicated Architectural Decision Record builder
├── crossover-guide.html         # In-depth architectural whitepaper
├── index.html                   # Main interactive comparison engine
├── robots.txt                   # Search crawler directives
├── sitemap.xml                  # XML sitemap
├── site.webmanifest             # PWA manifest
├── sw.js                        # Offline service worker
└── .nojekyll                    # Disable Jekyll on GitHub Pages
```

---

## 🧪 Testing

Run mathematical unit tests:
```bash
node tests/formulas.test.js
```

Run site structure and SEO audit:
```bash
node tests/site-audit.js
```

---

## 📄 License

MIT License © 2026 CloudCrossover.
