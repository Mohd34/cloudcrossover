# 🗺️ CloudCrossover Roadmap

This roadmap outlines planned capabilities for CloudCrossover across product development, distribution channels, and feature expansions.

---

## Phase 1 — MVP Launch & Distribution Engine (Current - v1.0) ✅
- [x] Accurate 2026 mathematical modeling for AWS Lambda, Google Cloud Run, EC2, DigitalOcean, Hetzner, and Fly.io.
- [x] Exact binary-search crossover threshold solver ($R^*$).
- [x] Hidden cost audit engine (NAT Gateway idle tax, API Gateway multipliers, egress markups).
- [x] 1-Click Sharing Hub:
  - Deep-linked URL state hash.
  - Formatted Markdown table for GitHub PRs / RFCs.
  - Reddit / Discord discussion summary snippet.
  - Downloadable Architectural Decision Record (ADR-001).
- [x] Full responsive mobile UI with dark/light mode toggle.
- [x] Offline Service Worker PWA support.
- [x] Automated unit test suite & site audit runner.
- [x] Free deployment to GitHub Pages.

---

## Phase 2 — Distribution Amplification & Community Integrations (Q4 2026)
- [ ] **GitHub Action (`cloudcrossover-action`):**
  - Run automatically on PRs touching Terraform / Serverless / CDK files to output a cost comparison table directly in PR comments.
- [ ] **Grafana / Prometheus Export:**
  - Export PromQL query templates to calculate live real-time crossover based on existing production request metrics.
- [ ] **Additional Cloud Providers:**
  - Scaleway, OVHcloud, Linode (Akamai), and Cloudflare Workers (CPU time vs wall clock).
- [ ] **Interactive Visual Graph:**
  - Canvas / SVG line graph showing the intersecting cost curves across request volume (0 to 100M).

---

## Phase 3 — Enterprise & FinOps Extensibility (2027)
- [ ] **AWS Cost Explorer Ingest (Local JSON):**
  - Drag-and-drop AWS Cost & Usage Report (CUR) JSON to automatically detect current Lambda + API Gateway spend and calculate exact VPS replacement savings.
- [ ] **Team Workspaces & PDF Export:**
  - Executive summary PDF generator for CTO / VP Engineering infrastructure budget sign-offs.
