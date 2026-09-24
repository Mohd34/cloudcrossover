/**
 * CloudCrossover Core Mathematical & Pricing Engine
 * Models real-world infrastructure costs across Serverless (AWS Lambda, Cloud Run),
 * Managed Containers (Fly.io), and Virtual Private Servers (Hetzner, DigitalOcean, EC2).
 * Computes exact break-even crossover points and hidden cloud multipliers.
 * Zero external dependencies.
 */

const CloudMath = {
  // 2026 Cloud Pricing Rates & Constants
  RATES: {
    AWS_LAMBDA: {
      FREE_REQUESTS: 1000000,
      FREE_GB_SECONDS: 400000,
      REQUEST_PER_MILLION: 0.20,
      REQUEST_UNIT_RATE: 0.0000002,
      GB_SECOND_X86: 0.0000166667,
      GB_SECOND_ARM: 0.0000133334,
      API_GATEWAY_HTTP_PER_M: 1.00,
      API_GATEWAY_REST_PER_M: 3.50,
      EGRESS_FREE_GB: 100,
      EGRESS_PER_GB: 0.09
    },
    GCP_CLOUD_RUN: {
      FREE_REQUESTS: 2000000,
      FREE_VCPU_SECONDS: 180000,
      FREE_GIB_SECONDS: 360000,
      REQUEST_PER_MILLION: 0.40,
      REQUEST_UNIT_RATE: 0.0000004,
      VCPU_SECOND: 0.00002400,
      GIB_SECOND: 0.00000250,
      EGRESS_FREE_GB: 100,
      EGRESS_PER_GB: 0.085
    },
    AWS_EC2: {
      T4G_NANO: { name: 't4g.nano (2 vCPU, 0.5GB)', monthly: 3.07 },
      T4G_MICRO: { name: 't4g.micro (2 vCPU, 1GB)', monthly: 6.13 },
      T4G_SMALL: { name: 't4g.small (2 vCPU, 2GB)', monthly: 12.26 },
      T4G_MEDIUM: { name: 't4g.medium (2 vCPU, 4GB)', monthly: 24.53 },
      ALB_BASE_MONTHLY: 16.43,
      ALB_LCU_AVG_MONTHLY: 6.00, // Total ALB ~ $22.43
      EGRESS_FREE_GB: 100,
      EGRESS_PER_GB: 0.09
    },
    DIGITALOCEAN: {
      BASIC_1GB: { name: 'Droplet 1 vCPU / 1GB RAM', monthly: 6.00, includedBandwidthGb: 1000 },
      BASIC_2GB: { name: 'Droplet 1 vCPU / 2GB RAM', monthly: 12.00, includedBandwidthGb: 2000 },
      BASIC_4GB: { name: 'Droplet 2 vCPU / 4GB RAM', monthly: 24.00, includedBandwidthGb: 4000 },
      OVERAGE_PER_GB: 0.01
    },
    HETZNER: {
      CX22: { name: 'Hetzner CX22 (2 vCPU, 4GB RAM)', monthlyUsd: 4.15, includedBandwidthGb: 20000 },
      CPX21: { name: 'Hetzner CPX21 (3 vCPU, 4GB RAM)', monthlyUsd: 7.70, includedBandwidthGb: 20000 },
      OVERAGE_PER_TB_USD: 1.10
    },
    FLY_IO: {
      SHARED_1X_512MB: { name: 'Fly.io 1x Shared CPU (512MB)', monthly: 3.19 },
      SHARED_1X_1GB: { name: 'Fly.io 1x Shared CPU (1GB)', monthly: 5.70 },
      EGRESS_FREE_GB: 100,
      EGRESS_PER_GB: 0.02
    }
  },

  /**
   * 1. Calculate AWS Lambda Monthly Bill
   */
  calculateLambda: function(workload) {
    const req = Math.max(0, parseFloat(workload.requests) || 0);
    const durMs = Math.max(1, parseFloat(workload.durationMs) || 150);
    const memMb = Math.max(128, parseFloat(workload.memoryMb) || 512);
    const arch = workload.arch || 'arm'; // 'arm' or 'x86'
    const gateway = workload.apiGateway || 'http'; // 'none', 'http', 'rest'
    const egressGb = Math.max(0, parseFloat(workload.egressGb) || 0);

    const memGb = memMb / 1024;
    const durSec = durMs / 1000;
    const totalGbSeconds = req * durSec * memGb;

    const rateGbSec = arch === 'arm' 
      ? this.RATES.AWS_LAMBDA.GB_SECOND_ARM 
      : this.RATES.AWS_LAMBDA.GB_SECOND_X86;

    const billableGbSeconds = Math.max(0, totalGbSeconds - this.RATES.AWS_LAMBDA.FREE_GB_SECONDS);
    const computeCost = billableGbSeconds * rateGbSec;

    const billableRequests = Math.max(0, req - this.RATES.AWS_LAMBDA.FREE_REQUESTS);
    const requestCost = billableRequests * this.RATES.AWS_LAMBDA.REQUEST_UNIT_RATE;

    let apiGatewayCost = 0;
    if (gateway === 'http') {
      apiGatewayCost = (req / 1000000) * this.RATES.AWS_LAMBDA.API_GATEWAY_HTTP_PER_M;
    } else if (gateway === 'rest') {
      apiGatewayCost = (req / 1000000) * this.RATES.AWS_LAMBDA.API_GATEWAY_REST_PER_M;
    }

    const billableEgress = Math.max(0, egressGb - this.RATES.AWS_LAMBDA.EGRESS_FREE_GB);
    const egressCost = billableEgress * this.RATES.AWS_LAMBDA.EGRESS_PER_GB;

    const totalMonthlyCost = computeCost + requestCost + apiGatewayCost + egressCost;
    const costPerMillion = req > 0 ? (totalMonthlyCost / (req / 1000000)) : 0;

    return {
      provider: 'AWS Lambda (' + arch.toUpperCase() + ')',
      totalGbSeconds: Number(totalGbSeconds.toFixed(1)),
      computeCost: Number(computeCost.toFixed(2)),
      requestCost: Number(requestCost.toFixed(2)),
      apiGatewayCost: Number(apiGatewayCost.toFixed(2)),
      egressCost: Number(egressCost.toFixed(2)),
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      costPerMillion: Number(costPerMillion.toFixed(2))
    };
  },

  /**
   * 2. Calculate Google Cloud Run Monthly Bill
   */
  calculateCloudRun: function(workload) {
    const req = Math.max(0, parseFloat(workload.requests) || 0);
    const durMs = Math.max(1, parseFloat(workload.durationMs) || 150);
    const memMb = Math.max(128, parseFloat(workload.memoryMb) || 512);
    const egressGb = Math.max(0, parseFloat(workload.egressGb) || 0);

    const memGib = memMb / 1024;
    const durSec = durMs / 1000;
    const vCpu = memMb <= 512 ? 0.5 : (memMb <= 1024 ? 1.0 : 2.0);

    const totalVcpuSeconds = req * durSec * vCpu;
    const totalGibSeconds = req * durSec * memGib;

    const billableVcpuSeconds = Math.max(0, totalVcpuSeconds - this.RATES.GCP_CLOUD_RUN.FREE_VCPU_SECONDS);
    const billableGibSeconds = Math.max(0, totalGibSeconds - this.RATES.GCP_CLOUD_RUN.FREE_GIB_SECONDS);
    const billableRequests = Math.max(0, req - this.RATES.GCP_CLOUD_RUN.FREE_REQUESTS);

    const cpuCost = billableVcpuSeconds * this.RATES.GCP_CLOUD_RUN.VCPU_SECOND;
    const memCost = billableGibSeconds * this.RATES.GCP_CLOUD_RUN.GIB_SECOND;
    const computeCost = cpuCost + memCost;
    const requestCost = billableRequests * this.RATES.GCP_CLOUD_RUN.REQUEST_UNIT_RATE;

    const billableEgress = Math.max(0, egressGb - this.RATES.GCP_CLOUD_RUN.EGRESS_FREE_GB);
    const egressCost = billableEgress * this.RATES.GCP_CLOUD_RUN.EGRESS_PER_GB;

    const totalMonthlyCost = computeCost + requestCost + egressCost;
    const costPerMillion = req > 0 ? (totalMonthlyCost / (req / 1000000)) : 0;

    return {
      provider: 'Google Cloud Run',
      cpuCost: Number(cpuCost.toFixed(2)),
      memoryCost: Number(memCost.toFixed(2)),
      computeCost: Number(computeCost.toFixed(2)),
      requestCost: Number(requestCost.toFixed(2)),
      egressCost: Number(egressCost.toFixed(2)),
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      costPerMillion: Number(costPerMillion.toFixed(2))
    };
  },

  /**
   * 3. Calculate AWS EC2 with optional ALB
   */
  calculateEC2: function(workload, planKey = 'T4G_SMALL', useAlb = true) {
    const pKey = (workload.instanceType ? workload.instanceType.replace('.', '_').toUpperCase() : null) || workload.planKey || planKey;
    const plan = this.RATES.AWS_EC2[pKey] || this.RATES.AWS_EC2.T4G_SMALL;
    const isAlb = workload.includeAlb !== undefined ? workload.includeAlb : (workload.useAlb !== undefined ? workload.useAlb : useAlb);
    const egressGb = Math.max(0, parseFloat(workload.egressGb) || 0);
    const req = Math.max(0, parseFloat(workload.requests) || 0);

    const instanceCost = plan.monthly;
    const albCost = isAlb ? (this.RATES.AWS_EC2.ALB_BASE_MONTHLY + this.RATES.AWS_EC2.ALB_LCU_AVG_MONTHLY) : 0;

    const billableEgress = Math.max(0, egressGb - this.RATES.AWS_EC2.EGRESS_FREE_GB);
    const egressCost = billableEgress * this.RATES.AWS_EC2.EGRESS_PER_GB;

    const totalMonthlyCost = instanceCost + albCost + egressCost;
    const costPerMillion = req > 0 ? (totalMonthlyCost / (req / 1000000)) : 0;

    return {
      provider: 'AWS EC2 (' + plan.name + (isAlb ? ' + ALB' : ' Direct') + ')',
      instanceCost: Number(instanceCost.toFixed(2)),
      albCost: Number(albCost.toFixed(2)),
      egressCost: Number(egressCost.toFixed(2)),
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      costPerMillion: Number(costPerMillion.toFixed(2))
    };
  },

  /**
   * 4. Calculate DigitalOcean Droplet
   */
  calculateDigitalOcean: function(workload, planKey = 'BASIC_1GB') {
    const pKey = workload.dropletTier || workload.planKey || planKey;
    const plan = this.RATES.DIGITALOCEAN[pKey] || this.RATES.DIGITALOCEAN.BASIC_1GB;
    const egressGb = Math.max(0, parseFloat(workload.egressGb) || 0);
    const req = Math.max(0, parseFloat(workload.requests) || 0);

    const overageGb = Math.max(0, egressGb - plan.includedBandwidthGb);
    const egressCost = overageGb * this.RATES.DIGITALOCEAN.OVERAGE_PER_GB;

    const totalMonthlyCost = plan.monthly + egressCost;
    const costPerMillion = req > 0 ? (totalMonthlyCost / (req / 1000000)) : 0;

    return {
      provider: 'DigitalOcean ' + plan.name,
      baseCost: Number(plan.monthly.toFixed(2)),
      egressCost: Number(egressCost.toFixed(2)),
      overageCost: Number(egressCost.toFixed(2)),
      includedBandwidthGb: plan.includedBandwidthGb,
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      costPerMillion: Number(costPerMillion.toFixed(2))
    };
  },

  /**
   * 5. Calculate Hetzner Cloud VPS
   */
  calculateHetzner: function(workload, planKey = 'CX22') {
    const pKey = workload.serverTier || workload.planKey || planKey;
    const plan = this.RATES.HETZNER[pKey] || this.RATES.HETZNER.CX22;
    const egressGb = Math.max(0, parseFloat(workload.egressGb) || 0);
    const req = Math.max(0, parseFloat(workload.requests) || 0);

    const overageGb = Math.max(0, egressGb - plan.includedBandwidthGb);
    const egressCost = (overageGb / 1000) * this.RATES.HETZNER.OVERAGE_PER_TB_USD;

    const totalMonthlyCost = plan.monthlyUsd + egressCost;
    const costPerMillion = req > 0 ? (totalMonthlyCost / (req / 1000000)) : 0;

    return {
      provider: plan.name,
      baseCost: Number(plan.monthlyUsd.toFixed(2)),
      egressCost: Number(egressCost.toFixed(2)),
      bandwidthCost: Number(egressCost.toFixed(2)),
      includedBandwidthGb: plan.includedBandwidthGb,
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      costPerMillion: Number(costPerMillion.toFixed(2))
    };
  },

  /**
   * 6. Calculate Fly.io Container VM
   */
  calculateFly: function(workload, planKey = 'SHARED_1X_512MB') {
    const pKey = workload.vmTier || workload.planKey || planKey;
    const plan = this.RATES.FLY_IO[pKey] || this.RATES.FLY_IO.SHARED_1X_512MB;
    const egressGb = Math.max(0, parseFloat(workload.egressGb) || 0);
    const req = Math.max(0, parseFloat(workload.requests) || 0);

    const overageGb = Math.max(0, egressGb - this.RATES.FLY_IO.EGRESS_FREE_GB);
    const egressCost = overageGb * this.RATES.FLY_IO.EGRESS_PER_GB;

    const totalMonthlyCost = plan.monthly + egressCost;
    const costPerMillion = req > 0 ? (totalMonthlyCost / (req / 1000000)) : 0;

    return {
      provider: plan.name,
      baseCost: Number(plan.monthly.toFixed(2)),
      vmCost: Number(plan.monthly.toFixed(2)),
      egressCost: Number(egressCost.toFixed(2)),
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      costPerMillion: Number(costPerMillion.toFixed(2))
    };
  },

  /**
   * 7. Full Benchmark Suite Comparison
   */
  compareAll: function(workload) {
    const lambda = this.calculateLambda(workload);
    const cloudRun = this.calculateCloudRun(workload);
    const ec2SmallAlb = this.calculateEC2(workload, 'T4G_SMALL', true);
    const doDroplet = this.calculateDigitalOcean(workload, 'BASIC_1GB');
    const hetzner = this.calculateHetzner(workload, 'CX22');
    const fly = this.calculateFly(workload, 'SHARED_1X_512MB');

    const options = [lambda, cloudRun, ec2SmallAlb, doDroplet, hetzner, fly];
    options.sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);

    const cheapest = options[0];
    const mostExpensive = options[options.length - 1];
    const savingsVsExpensive = mostExpensive.totalMonthlyCost > 0
      ? ((mostExpensive.totalMonthlyCost - cheapest.totalMonthlyCost) / mostExpensive.totalMonthlyCost) * 100
      : 0;

    // Determine Crossover Points vs Serverless (Lambda)
    const crossoverHetzner = this.findCrossoverRequests(workload, hetzner.totalMonthlyCost);
    const crossoverDO = this.findCrossoverRequests(workload, doDroplet.totalMonthlyCost);
    const crossoverEC2 = this.findCrossoverRequests(workload, ec2SmallAlb.totalMonthlyCost);

    return {
      workload: workload,
      results: {
        lambda: lambda,
        cloudRun: cloudRun,
        ec2: ec2SmallAlb,
        digitalOcean: doDroplet,
        hetzner: hetzner,
        fly: fly
      },
      ranked: options,
      cheapest: cheapest,
      mostExpensive: mostExpensive,
      savingsPct: Number(savingsVsExpensive.toFixed(1)),
      crossoverRequestsHetzner: crossoverHetzner,
      crossoverRequestsDO: crossoverDO,
      crossoverRequestsEC2: crossoverEC2
    };
  },

  /**
   * Calculates the exact request volume R* where Lambda equals a given target cost
   * Uses binary search on invocation and compute rates
   */
  findCrossoverRequests: function(workload, targetCost) {
    const testWorkload = {
      ...workload,
      egressGb: 0 // Isolate compute & invocation crossover from data egress
    };
    let low = 0;
    let high = 500000000; // 500 million upper bound
    let best = 0;

    for (let i = 0; i < 40; i++) {
      const mid = Math.floor((low + high) / 2);
      testWorkload.requests = mid;
      const res = this.calculateLambda(testWorkload);
      
      if (res.totalMonthlyCost < targetCost) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return best;
  },

  /**
   * 8. Encode & Decode Shareable URL State
   */
  encodeState: function(workload) {
    const params = new URLSearchParams({
      r: workload.requests !== undefined ? workload.requests : (workload.r || 2000000),
      d: workload.durationMs !== undefined ? workload.durationMs : (workload.d || 150),
      m: workload.memoryMb !== undefined ? workload.memoryMb : (workload.m || 512),
      a: workload.arch || workload.a || 'arm',
      g: workload.apiGateway || workload.g || 'http',
      e: workload.egressGb !== undefined ? workload.egressGb : (workload.e || 50)
    });
    return params.toString();
  },

  decodeState: function(queryString) {
    const params = new URLSearchParams(queryString);
    if (!params.has('r') && !params.has('requests')) return null;
    const r = parseFloat(params.get('r') || params.get('requests')) || 2000000;
    const d = parseFloat(params.get('d') || params.get('durationMs')) || 150;
    const m = parseFloat(params.get('m') || params.get('memoryMb')) || 512;
    const a = params.get('a') || params.get('arch') || 'arm';
    const g = params.get('g') || params.get('apiGateway') || 'http';
    const e = parseFloat(params.get('e') || params.get('egressGb')) || 50;

    return {
      requests: r,
      durationMs: d,
      memoryMb: m,
      arch: a,
      apiGateway: g,
      egressGb: e,
      r, d, m, a, g, e
    };
  },

  /**
   * 9. Generate GitHub PR / Issue Markdown Comparison Table
   */
  generateMarkdownTable: function(comparison, shareUrl) {
    const w = comparison.workload;
    let md = `### ☁️ Cloud Compute Architecture Cost Benchmark\n\n`;
    md += `**Workload Profile:**\n`;
    md += `- **Monthly Invocations:** ${(w.requests).toLocaleString()} requests\n`;
    md += `- **Avg Execution Duration:** ${w.durationMs} ms\n`;
    md += `- **Allocated Memory:** ${w.memoryMb} MB (${w.arch.toUpperCase()})\n`;
    md += `- **API Gateway:** ${w.apiGateway.toUpperCase()} API\n`;
    md += `- **Monthly Outbound Egress:** ${w.egressGb} GB\n\n`;
    md += `| Provider / Architecture | Total Monthly | Cost / 1M Reqs | Egress Cost | Architecture Type |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    comparison.ranked.forEach(item => {
      const isWinner = item.provider === comparison.cheapest.provider;
      const badge = isWinner ? ' 🏆 **Cheapest**' : '';
      const type = item.provider.includes('Lambda') || item.provider.includes('Cloud Run') ? 'Serverless' : (item.provider.includes('Fly') ? 'Container' : 'VPS / Instance');
      md += `| **${item.provider}**${badge} | **$${item.totalMonthlyCost.toFixed(2)}** | $${item.costPerMillion.toFixed(2)} | $${(item.egressCost || 0).toFixed(2)} | ${type} |\n`;
    });

    md += `\n**Key Finding:** ${comparison.cheapest.provider} is the most cost-effective option, offering **${comparison.savingsPct}% savings** over the highest-cost alternative.\n`;
    if (comparison.crossoverRequestsHetzner > 0) {
      md += `\n*Serverless vs VPS Crossover Point: At ~${(comparison.crossoverRequestsHetzner).toLocaleString()} requests/month, fixed VPS hosting becomes cheaper than AWS Lambda.*\n\n`;
    }
    md += `👉 [Inspect Full Interactive Scenario on CloudCrossover](${shareUrl})\n`;
    return md;
  },

  /**
   * 10. Generate Reddit / Discord Discussion One-Liner
   */
  generateRedditSnippet: function(comparison, shareUrl) {
    const w = comparison.workload;
    const reqStr = (w.requests >= 1000000) ? (w.requests / 1000000).toFixed(1) + 'M' : (w.requests / 1000).toFixed(0) + 'K';
    const lCost = comparison.results.lambda.totalMonthlyCost;
    const hCost = comparison.results.hetzner.totalMonthlyCost;
    const doCost = comparison.results.digitalOcean.totalMonthlyCost;
    const crossover = (comparison.crossoverRequestsHetzner).toLocaleString();

    let txt = `For a workload of ${reqStr} requests/mo (${w.durationMs}ms, ${w.memoryMb}MB RAM, ${w.egressGb}GB egress):\n`;
    txt += `• AWS Lambda: $${lCost.toFixed(2)}/mo ($${comparison.results.lambda.costPerMillion.toFixed(2)}/M reqs)\n`;
    txt += `• DigitalOcean ($6 Droplet): $${doCost.toFixed(2)}/mo (1TB bandwidth incl)\n`;
    txt += `• Hetzner Cloud (CX22): $${hCost.toFixed(2)}/mo (20TB bandwidth incl)\n`;
    txt += `The serverless break-even point is ~${crossover} requests/month. Above that, VPS is drastically cheaper.\n`;
    txt += `Interactive calculator & full breakdown: ${shareUrl}`;
    return txt;
  },

  /**
   * 11. Generate Architectural Decision Record (ADR)
   */
  generateADR: function(comparison, shareUrl) {
    const w = comparison.workload;
    const date = new Date().toISOString().split('T')[0];
    return `# Architectural Decision Record: Compute Platform Selection (ADR-001)

**Status:** Proposed  
**Date:** ${date}  
**Evaluator:** CloudCrossover Mathematical Decision Engine  
**Interactive Scenario:** [${shareUrl}](${shareUrl})  

## Context and Problem Statement
The engineering team requires an infrastructure platform for an API workload characterized by:
- **Monthly Invocations:** ${(w.requests).toLocaleString()}
- **Latency / Execution Duration:** ${w.durationMs} ms
- **Memory Consumption:** ${w.memoryMb} MB
- **Network Egress:** ${w.egressGb} GB/month
- **Gateway Protocol:** ${w.apiGateway.toUpperCase()} API

We must balance operational maintenance overhead, cold-start latency, and monthly financial burn.

## Decision Drivers
1. **Total Cost of Ownership (TCO):** Minimize cost while maintaining SLA.
2. **Maintenance Burden:** Avoid unnecessary Kubernetes or OS patching overhead where possible.
3. **Egress Risk:** Guard against high AWS outbound data fees ($0.09/GB).
4. **Traffic Predictability:** Account for bursty vs steady baseload.

## Considered Options
1. AWS Lambda (${w.arch.toUpperCase()})
2. Google Cloud Run
3. AWS EC2 (t4g instance + ALB)
4. DigitalOcean Basic Droplet
5. Hetzner Cloud VPS (CX22)
6. Fly.io Shared CPU

## Financial Decision Matrix
| Provider | Monthly Cost | Cost / 1M Requests | Egress Subtotal |
| :--- | :--- | :--- | :--- |
${comparison.ranked.map(r => `| ${r.provider} | $${r.totalMonthlyCost.toFixed(2)} | $${r.costPerMillion.toFixed(2)} | $${(r.egressCost || 0).toFixed(2)} |`).join('\n')}

## Decision Outcome
**Recommended Option:** **${comparison.cheapest.provider}**  
**Projected Monthly Spend:** **$${comparison.cheapest.totalMonthlyCost.toFixed(2)}/month** (${comparison.savingsPct}% lower than most expensive alternative).

### Crossover Analysis
The break-even point where Serverless (AWS Lambda) costs exceed fixed VPS hosting is **${(comparison.crossoverRequestsHetzner).toLocaleString()} requests/month**. 
- If monthly volume is **below** this threshold, Serverless is recommended to eliminate maintenance.
- If monthly volume is **above** this threshold, VPS or containerized instances yield significant cost savings.
`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudMath;
}
