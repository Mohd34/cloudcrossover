# Architectural Decision Record: Compute Platform Selection (ADR-001)

**Status:** [Proposed | Accepted | Superseded]  
**Date:** YYYY-MM-DD  
**Deciders:** [Tech Lead, Engineering Manager, Staff Architect]  
**Consulted:** [DevOps / Infrastructure Team]  
**Interactive Scenario:** [Link to CloudCrossover Scenario](https://mohd34.github.io/cloudcrossover/)  

---

## 1. Context and Problem Statement

Our team is designing or evaluating the compute hosting architecture for the following subsystem:
- **Service Name:** `[service-name]`
- **Monthly Invocations:** `[e.g. 15,000,000 requests/month]`
- **Target Latency / Duration:** `[e.g. 150 ms]`
- **Allocated Memory:** `[e.g. 512 MB]`
- **Expected Outbound Egress:** `[e.g. 500 GB/month]`
- **Front-Door Protocol:** `[HTTP API Gateway / Application Load Balancer / Direct Nginx]`

We must select a compute runtime that balances monthly financial burn, operational maintenance overhead, cold start latency, and team velocity.

---

## 2. Decision Drivers

1. **Total Cost of Ownership (TCO):** Minimize recurring compute, API routing, and bandwidth spend.
2. **Maintenance Overhead:** Minimize required OS patching, container orchestration complexity, and operational burden.
3. **Cold Starts & SLA:** Ensure P99 latency remains within acceptable user experience thresholds (<100ms).
4. **Traffic Predictability:** Account for whether traffic is steady baseline vs bursty sporadic spikes.
5. **Egress Risk:** Guard against high public egress fees ($0.09/GB on AWS vs included quotas).

---

## 3. Considered Options

1. **AWS Lambda (ARM Graviton)**
2. **Google Cloud Run**
3. **AWS EC2 (t4g.small + ALB)**
4. **DigitalOcean Basic Droplet**
5. **Hetzner Cloud VPS (CX22)**
6. **Fly.io Shared CPU**

---

## 4. Financial Decision Matrix

*Generated via [CloudCrossover Break-Even Engine](https://mohd34.github.io/cloudcrossover/).*

| Provider / Architecture | Monthly Cost | Cost / 1M Reqs | Data Egress | Architecture Type |
| :--- | :--- | :--- | :--- | :--- |
| **Hetzner CX22 (2 vCPU, 4GB)** | **$4.15/mo** | $0.28 / 1M | 20,000 GB incl | Fixed VPS |
| **DigitalOcean ($6 Droplet)** | **$6.00/mo** | $0.40 / 1M | 1,000 GB incl | Fixed VPS |
| **AWS Lambda (ARM Graviton)** | **$33.00/mo** | $2.20 / 1M | 100 GB free | Serverless Function |
| **AWS EC2 (t4g.small + ALB)** | **$34.69/mo** | $2.31 / 1M | 100 GB free | Instance + ALB |
| **Google Cloud Run** | **$42.80/mo** | $2.85 / 1M | 100 GB free | Serverless Container |

---

## 5. Decision Outcome

**Chosen Option:** `[e.g. Hetzner CX22 or AWS Lambda]`  
**Justification:**
- **If Volume is < Crossover Point ($R^*$):** Serverless is selected because total cost is negligible (<$10/mo) and operational overhead is zero.
- **If Volume is > Crossover Point ($R^*$):** Fixed VPS or container instance is selected because serverless invocations and API Gateway multipliers represent unsustainable financial burn (e.g. 80%+ savings on VPS).

### Operational Tooling:
If VPS is selected, zero-downtime deployment will be managed via **Kamal** or **Coolify**, eliminating traditional server maintenance burden.
