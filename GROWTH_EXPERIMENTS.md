# 🧪 Controlled Growth & Distribution Experiments

Every optimization and distribution push must follow the scientific method:
1. **Hypothesis**
2. **Baseline**
3. **Controlled Single Variable Change**
4. **Date & Scope**
5. **Success Criterion**
6. **Result & Decision**

---

## Experiment Log

### Experiment 001: Default Workload Preset Optimization
- **Date:** 2026-09-24
- **Hypothesis:** Setting the initial page load to a realistic 10M request "Content API" preset rather than a 500k side project immediately demonstrates significant dollar savings (\$8.30 vs \$33.00), increasing the copy-to-clipboard conversion rate for GitHub PR tables.
- **Baseline:** Neutral 1M request workload (crossover difference is only \$1.50).
- **Variant:** Pre-selected 10M request Content API workload showcasing an 87% savings difference and explicit Hetzner crossover threshold.
- **Measurement:** Percentage of sessions clicking "Copy GitHub PR Table" or "Copy URL".
- **Success Criteria:** >12% clipboard action rate on first session.
- **Status:** Active in v1.0 Release.

---

### Experiment 002: In-PR Badge vs Link-Only Footers
- **Date:** Planned for Post-Launch
- **Hypothesis:** Including a clean markdown shield badge `[![CloudCrossover Benchmark](...)]` in exported PR tables increases click-through rate from PR reviewers by 35% compared to a plain text hyperlink.
- **Baseline:** Text markdown link: `👉 [Inspect Full Interactive Scenario on CloudCrossover](url)`
- **Variant:** Badge + text markdown link.
- **Measurement:** Inbound referral sessions carrying UTM tag `utm_source=github_pr&utm_medium=badge`.
- **Success Criteria:** 25%+ higher referral volume over 30 PR instances.
- **Status:** Queued for v1.1.

---

### Experiment 003: Architectural Decision Record (ADR) Direct Downloader
- **Date:** 2026-09-24
- **Hypothesis:** Providing an instant `.md` file download named `0001-compute-platform-selection.md` encourages engineers to save the file directly into their Git repo's `/docs/adr` folder, creating permanent organic brand retention.
- **Baseline:** Copy-only clipboard text.
- **Variant:** Dual button: "📋 Copy" and "📥 Download .md".
- **Measurement:** Proportion of users choosing download over copy.
- **Success Criteria:** At least 30% of ADR interactions utilize the direct `.md` download button.
- **Status:** Active in v1.0 Release.
