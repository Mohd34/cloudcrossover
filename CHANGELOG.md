# 📝 Changelog

All notable changes to the CloudCrossover project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-24

### Added
- **Core Calculation Engine (`CloudMath`):**
  - AWS Lambda cost model with x86 and ARM Graviton rates, duration GB-seconds, invocation fees, HTTP vs REST API Gateway multipliers, and 100GB free tier egress.
  - Google Cloud Run cost model with vCPU-seconds, GiB-seconds, request tiers, and egress charges.
  - AWS EC2 model featuring t4g.small with optional Application Load Balancer (ALB) base and LCU fees.
  - DigitalOcean Droplet pricing with 1TB–4TB included bandwidth and \$0.01/GB overage fees.
  - Hetzner Cloud CX22 model (€3.79 / ~$4.15 USD) with 20TB included traffic.
  - Fly.io shared CPU container model.
- **Exact Crossover Solver:**
  - Binary search algorithm computing the exact break-even request volume $R^*$ across all provider combinations.
- **Organic Distribution Mechanisms:**
  - Dynamic URL state hash encoding/decoding (`#r=...`) for shareable scenarios.
  - 1-click Markdown table generator optimized for GitHub Pull Requests and RFCs.
  - 1-click Reddit / Discord technical discussion argument generator.
  - 1-click Architectural Decision Record (ADR-001) generator in Michael Nygard format.
- **Hidden Cost Traps Audit:**
  - Dynamic calculators for AWS NAT Gateway idle taxes (\$32.85/mo per AZ), REST API Gateway penalties (\$3.50/M vs \$1.00/M), and AWS egress markups (\$0.09/GB vs \$0.01/GB).
- **User Interface & Design System:**
  - Modern developer-focused dark/light theme with monospace metrics and interactive sliders.
  - Workload presets: Content API, Webhook Ingest, Microservice, Compute-Heavy, and Side Project.
  - Comparative bar chart visualizer.
  - Responsive mobile navigation and touch slider controls.
- **Offline & PWA Support:**
  - Service worker (`sw.js`) and web app manifest (`site.webmanifest`).
- **Whitepapers & Architectural Governance:**
  - `crossover-guide.html`: Mathematical derivation and migration patterns (Kamal, Coolify, Traefik).
  - `adr-generator.html`: Dedicated ADR customizer with instant markdown export.
- **Verification Suites:**
  - `tests/formulas.test.js` (16 mathematical verification tests).
  - `tests/site-audit.js` (21 structural and technical SEO checks).
