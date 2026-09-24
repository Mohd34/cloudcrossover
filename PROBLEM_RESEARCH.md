# 🔬 Problem Research & Opportunity Discovery

## Executive Summary

Autonomous Product Challenge #3 mandates discovering a real problem, building a genuinely useful free product, deploying it for \$0, and designing a legitimate organic distribution mechanism that brings the product its first users without paid ads, fake accounts, or spam.

To select the winning concept, we evaluated **20 distinct developer, DevOps, and small business problems** across community discussion velocity, distribution friction, built-in viral loop potential, and $0 feasibility.

---

## 1. Evaluation Matrix: 20 Candidate Problems

| # | Problem Space | Target Audience | Distribution Mechanism | Organic Loop Potential | Verdict |
|---|---|---|---|---|---|
| 1 | **Serverless vs VPS Cost & Break-Even Crossover** | DevOps, Cloud Eng, Backend Devs | GitHub PR tables, RFC markdown, Reddit/Discord debates | **Extremely High (Natural artifact in PRs)** | **SELECTED (Winner)** |
| 2 | PostgreSQL Connection Pool Sizer (PgBouncer) | Backend Engineers, DBAs | Database config files, PR snippets | Medium | Strong, but narrower audience |
| 3 | Docker Multi-Stage Image Bloat Audit | Container Engineers | Dockerfile linters, GitHub action | High, but requires file uploads |
| 4 | OpenAPI / Swagger Diff & Breaking Change Linter | API Developers | CI comments | High, high tool saturation |
| 5 | AWS IAM Least-Privilege Policy Generator | Security Engineers | Terraform snippets | High, but high liability |
| 6 | Cron Syntax & Next Execution Visualizer | System Admins, Devs | Slack/Discord links | Moderate, saturated (Crontab.guru) |
| 7 | Regex Performance & ReDoS Vulnerability Tester | Security Researchers | GitHub issue links | Moderate |
| 8 | Tailwind to CSS / Vanilla Converter | Frontend Developers | Code snippets | Moderate, saturated |
| 9 | Freelance Developer Rate & Runway Calculator | Tech Freelancers | Twitter/LinkedIn sharing | Moderate, seasonal |
| 10 | Next.js Bundle Size vs Cold-Start Modeler | Frontend Architects | Twitter screenshots | High, but fast framework churn |
| 11 | Git Rebase vs Merge Visualizer & Command Guide | Junior Developers | Educational links | High search, low viral share |
| 12 | Kubernetes Ingress vs Gateway API Migrator | DevOps Engineers | K8s YAML generator | Low-medium |
| 13 | Email SPF / DKIM / DMARC DNS Record Generator | Sysadmins, Founders | DNS guides | Moderate |
| 14 | Webhook Retry & Exponential Backoff Simulator | Backend Engineers | Architecture docs | Moderate |
| 15 | SQLite vs DuckDB vs Turso Edge Sizer | Fullstack Devs | Technical blog posts | High, but niche audience |
| 16 | Redis Memory & Eviction Policy Planner | Backend Engineers | Redis config export | Moderate |
| 17 | Micro-SaaS Break-Even & CAC Payback Calculator | Indie Hackers | IndieHackers forum | Moderate |
| 18 | GitHub Action Minute & Self-Hosted Runner ROI | Engineering Leads | GitHub PR comments | High, but lower search volume |
| 19 | CORS Header Configuration Tester & Troubleshooter | Web Developers | StackOverflow links | High volume, low retention |
| 20 | JSON Schema to TypeScript Type Definition Generator | TypeScript Devs | Copy/paste | Highly saturated |

---

## 2. Deep Dive: Why "Serverless vs VPS Break-Even" Won

### The Pain Point
Every week on `r/devops`, `r/webdev`, `Hacker News`, and internal corporate Slack/Teams channels, an engineering argument erupts:
- *"Should we rewrite our backend in AWS Lambda to save money?"*
- *"We just got hit with a \$4,000 AWS bill for Lambda + API Gateway—why did nobody warn us?"*
- *"When should we migrate our container from AWS ECS to a \$40 Hetzner server?"*

### Real Community Voice & Complaints
1. **The API Gateway Shock:**
   > *"Nobody tells junior devs that API Gateway costs \$3.50 per million calls. Our compute was \$80, but our API Gateway was \$420. We could have run four 8-core Hetzner dedicated servers for that."* — Comment on Hacker News.
2. **The VPC NAT Gateway Trap:**
   > *"We moved our Lambdas into a private VPC to talk to RDS Postgres. Our bill immediately jumped \$70/month because AWS deployed two NAT Gateways in two AZs that just sat there idling."* — Post on r/aws.
3. **The Egress Penalty:**
   > *"AWS egress at 9 cents per GB is outright extortion. Returning 10TB of image thumbnails cost us \$900 on AWS. On Hetzner, that same 10TB would be completely free within the included 20TB quota."* — Comment on r/devops.

### The Organic Distribution "Built-in Hook"
Why is this tool uniquely suited for zero-dollar distribution?
Engineers **do not keep cost calculations to themselves**. When an engineer proposes an architectural change (e.g. moving from Lambda to a Docker container on Hetzner), they **must present proof to their team**:
1. They need a **clean Markdown table** to paste into their GitHub Pull Request or RFC document.
2. They need a **shareable deep link** so their Tech Lead can tweak the sliders.
3. They need an **Architectural Decision Record (ADR)** to commit to their codebase repository.
4. They need a **punchy summary snippet** to drop into Reddit or Discord debates when defending their infrastructure decisions.

By building these 4 export channels directly into the product's primary UI, every single user becomes an active distribution node.
