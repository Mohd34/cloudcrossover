# ☁️ The Hidden Cloud Infrastructure Taxes Cheat Sheet

> **The architectural line items that drive 60–80% of unexpected AWS/GCP bills.**  
> *Compiled by [CloudCrossover](https://mohd34.github.io/cloudcrossover/).*

---

## 1. The AWS NAT Gateway Idle Tax

### The Architecture:
Placing AWS Lambda inside a private VPC to access internal databases (Amazon RDS, Aurora, ElastiCache) prevents it from reaching public external APIs (Stripe, Twilio, OpenAI, GitHub). AWS mandates provisioning an **AWS NAT Gateway** in a public subnet.

### The Real Cost:
- **Hourly Idle Fee:** $0.045 per hour per Availability Zone = **$32.85 per month** per NAT Gateway.
- **Multi-AZ High Availability (2 AZs):** **$65.70 per month** before a single byte of traffic is transferred!
- **Data Processing Fee:** **$0.045 per Gigabyte** processed through the NAT Gateway.
- **Total Tax on 1TB Egress:** $32.85 (idle) + $45.00 (processing) = **$77.85/month**.

### The Alternative:
A $4 Hetzner server or $6 DigitalOcean droplet comes with a dedicated public IPv4/IPv6 and handles outbound internet with **$0 NAT tax**.

---

## 2. The API Gateway Multiplier

### The Architecture:
Serverless functions (AWS Lambda) do not listen on HTTP ports directly. They require an HTTP front-door router (AWS API Gateway or Application Load Balancer).

### The Real Cost:
- **AWS REST API Gateway:** **$3.50 per million calls**.
- **AWS HTTP API Gateway:** **$1.00 per million calls**.
- **Impact at Scale:**
  - 10M requests: $10.00 – $35.00/month.
  - 50M requests: $50.00 – $175.00/month.
  - 100M requests: $100.00 – $350.00/month.
- *Notice:* In many high-frequency microservices, the API Gateway bill **exceeds the entire Lambda compute bill**!

### The Alternative:
Nginx, Caddy, or Traefik running on a fixed instance routes 100M requests for **$0 routing fees**.

---

## 3. The Data Egress Markups

### The Rates Compared:

| Provider | Included Bandwidth | Public Outbound Egress Rate | Cost for 5 Terabytes Outbound |
| :--- | :--- | :--- | :--- |
| **AWS (Lambda / EC2)** | 100 GB / month free | **$0.09 per GB** | **$441.00** |
| **Google Cloud (Cloud Run)** | 100 GB / month free | **$0.085 per GB** | **$416.50** |
| **DigitalOcean** | 1,000 to 4,000 GB incl | **$0.01 per GB** overage | **$10.00** – **$40.00** |
| **Fly.io** | 100 GB / month free | **$0.02 per GB** overage | **$98.00** |
| **Hetzner Cloud** | **20,000 GB (20TB) incl** | **€1.10 per TB** overage | **$0.00** (Included free!) |

---

*Open source reference by [CloudCrossover](https://mohd34.github.io/cloudcrossover/).*
