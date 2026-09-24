const assert = require('assert');
const CloudMath = require('../assets/js/calculators.js');

console.log('🧪 Starting CloudCrossover Mathematical Formula & Decision Engine Tests...\n');

let passed = 0;
let total = 0;

function it(description, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. AWS Lambda Tests
it('AWS Lambda within free tier should cost $0', () => {
  const result = CloudMath.calculateLambda({
    requests: 500000,
    durationMs: 100,
    memoryMb: 128,
    arch: 'arm',
    apiGateway: 'none',
    egressGb: 50
  });
  assert.strictEqual(result.totalMonthlyCost, 0);
  assert.strictEqual(result.requestCost, 0);
  assert.strictEqual(result.computeCost, 0);
  assert.strictEqual(result.egressCost, 0);
});

it('AWS Lambda ARM compute is cheaper than x86', () => {
  const workload = {
    requests: 10000000,
    durationMs: 200,
    memoryMb: 512,
    apiGateway: 'none',
    egressGb: 0
  };
  const arm = CloudMath.calculateLambda({ ...workload, arch: 'arm' });
  const x86 = CloudMath.calculateLambda({ ...workload, arch: 'x86' });
  assert(arm.computeCost < x86.computeCost, 'ARM compute should be less than x86');
  assert(arm.totalMonthlyCost < x86.totalMonthlyCost, 'ARM total should be less than x86 total');
});

it('AWS Lambda with HTTP vs REST API Gateway calculates correctly', () => {
  const workload = {
    requests: 10000000,
    durationMs: 150,
    memoryMb: 256,
    arch: 'arm',
    egressGb: 0
  };
  const none = CloudMath.calculateLambda({ ...workload, apiGateway: 'none' });
  const http = CloudMath.calculateLambda({ ...workload, apiGateway: 'http' });
  const rest = CloudMath.calculateLambda({ ...workload, apiGateway: 'rest' });

  // HTTP API Gateway is $1.00 per million (10M = $10)
  assert.strictEqual(Math.round(http.apiGatewayCost), 10);
  // REST API Gateway is $3.50 per million (10M = $35)
  assert.strictEqual(Math.round(rest.apiGatewayCost), 35);
  assert(rest.totalMonthlyCost > http.totalMonthlyCost);
  assert(http.totalMonthlyCost > none.totalMonthlyCost);
});

it('AWS Lambda egress charges apply after 100 GB free tier', () => {
  const result = CloudMath.calculateLambda({
    requests: 1000000,
    durationMs: 100,
    memoryMb: 128,
    arch: 'arm',
    apiGateway: 'none',
    egressGb: 200 // 100 GB overage * $0.09 = $9.00
  });
  assert.strictEqual(Math.round(result.egressCost * 100) / 100, 9.00);
});

// 2. Google Cloud Run Tests
it('Cloud Run within free tier should cost $0', () => {
  const result = CloudMath.calculateCloudRun({
    requests: 1000000,
    durationMs: 100,
    memoryMb: 256,
    vcpu: 0.25,
    egressGb: 50
  });
  assert.strictEqual(result.totalMonthlyCost, 0);
});

it('Cloud Run calculates billable CPU and memory beyond free tier', () => {
  const result = CloudMath.calculateCloudRun({
    requests: 15000000,
    durationMs: 250,
    memoryMb: 512,
    vcpu: 0.5,
    egressGb: 300
  });
  assert(result.totalMonthlyCost > 0);
  assert(result.computeCost > 0);
  assert(result.requestCost > 0);
  assert(result.egressCost > 0);
});

// 3. AWS EC2 Tests
it('AWS EC2 calculates instance cost + ALB + egress', () => {
  const withAlb = CloudMath.calculateEC2({
    instanceType: 't4g.small',
    includeAlb: true,
    instanceCount: 1,
    egressGb: 500
  });
  const withoutAlb = CloudMath.calculateEC2({
    instanceType: 't4g.small',
    includeAlb: false,
    instanceCount: 1,
    egressGb: 500
  });
  assert(withAlb.albCost > 0);
  assert.strictEqual(withoutAlb.albCost, 0);
  assert(withAlb.totalMonthlyCost > withoutAlb.totalMonthlyCost);
  assert.strictEqual(withAlb.instanceCost, 12.26);
});

// 4. DigitalOcean Droplet Tests
it('DigitalOcean calculates Droplet flat rate with included bandwidth', () => {
  const withinBandwidth = CloudMath.calculateDigitalOcean({
    dropletTier: 'BASIC_1GB',
    dropletCount: 1,
    egressGb: 800
  });
  assert.strictEqual(withinBandwidth.totalMonthlyCost, 6.00);
  assert.strictEqual(withinBandwidth.overageCost, 0);

  const overBandwidth = CloudMath.calculateDigitalOcean({
    dropletTier: 'BASIC_1GB',
    dropletCount: 1,
    egressGb: 1500 // 500 GB overage @ $0.01 = $5.00
  });
  assert.strictEqual(overBandwidth.totalMonthlyCost, 11.00);
  assert.strictEqual(overBandwidth.overageCost, 5.00);
});

// 5. Hetzner Cloud Tests
it('Hetzner calculates ultra-low flat rate with 20TB included traffic', () => {
  const result = CloudMath.calculateHetzner({
    serverTier: 'CX22',
    serverCount: 1,
    egressGb: 5000 // well within 20,000 GB
  });
  assert.strictEqual(result.totalMonthlyCost, 4.15);
  assert.strictEqual(result.bandwidthCost, 0);
});

// 6. Fly.io Tests
it('Fly.io computes shared CPU and egress', () => {
  const result = CloudMath.calculateFly({
    vmTier: 'SHARED_1X_512MB',
    vmCount: 1,
    egressGb: 200 // 100GB overage @ $0.02 = $2.00
  });
  assert.strictEqual(result.vmCost, 3.19);
  assert.strictEqual(result.egressCost, 2.00);
  assert.strictEqual(Math.round(result.totalMonthlyCost * 100) / 100, 5.19);
});

// 7. Full Comparison and Crossover Engine
it('compareAll ranks providers correctly and discovers crossover points', () => {
  const comparison = CloudMath.compareAll({
    requests: 25000000, // 25 Million requests
    durationMs: 200,
    memoryMb: 512,
    arch: 'arm',
    apiGateway: 'http',
    egressGb: 500
  });

  assert(comparison.ranked.length >= 6);
  assert(comparison.cheapest);
  assert(comparison.mostExpensive);
  assert(comparison.crossoverRequestsHetzner > 0);
  assert(comparison.crossoverRequestsDO > 0);
  assert(comparison.crossoverRequestsEC2 > 0);
  assert(comparison.savingsPct > 0);

  // At 25M requests, Hetzner should be dramatically cheaper than Lambda + HTTP API Gateway
  const lambda = comparison.ranked.find(r => r.provider.includes('AWS Lambda'));
  const hetzner = comparison.ranked.find(r => r.provider.includes('Hetzner'));
  assert(lambda.totalMonthlyCost > hetzner.totalMonthlyCost);
});

// 8. Crossover Function Accuracy
it('findCrossoverRequests mathematically finds the exact break-even point', () => {
  const workload = {
    durationMs: 150,
    memoryMb: 256,
    arch: 'arm',
    apiGateway: 'http',
    egressGb: 100
  };
  const crossover = CloudMath.findCrossoverRequests(workload, 4.15); // Target: Hetzner $4.15
  assert(crossover > 0);

  // Calculate Lambda at crossover - should roughly equal $4.15
  const lambdaAtCrossover = CloudMath.calculateLambda({ ...workload, requests: crossover });
  assert(Math.abs(lambdaAtCrossover.totalMonthlyCost - 4.15) < 0.5, 
    `Cost at crossover was $${lambdaAtCrossover.totalMonthlyCost}, expected close to $4.15`);
});

// 9. State URL Encoding & Decoding
it('encodeState and decodeState preserve all workload parameters', () => {
  const state = {
    r: 12500000,
    d: 180,
    m: 512,
    g: 'http',
    a: 'arm',
    e: 350
  };
  const encoded = CloudMath.encodeState(state);
  assert(typeof encoded === 'string' && encoded.length > 0);
  const decoded = CloudMath.decodeState(encoded);
  assert.strictEqual(decoded.r, 12500000);
  assert.strictEqual(decoded.d, 180);
  assert.strictEqual(decoded.m, 512);
  assert.strictEqual(decoded.g, 'http');
  assert.strictEqual(decoded.a, 'arm');
  assert.strictEqual(decoded.e, 350);
});

// 10. Distribution Sharing Generators
it('generateMarkdownTable produces a clean, non-empty table for PRs', () => {
  const comparison = CloudMath.compareAll({
    requests: 5000000,
    durationMs: 120,
    memoryMb: 256,
    arch: 'arm',
    apiGateway: 'http',
    egressGb: 100
  });
  const table = CloudMath.generateMarkdownTable(comparison, 'https://mohd34.github.io/cloudcrossover/#test');
  assert(table.includes('### ☁️ Cloud Compute Architecture Cost Benchmark'));
  assert(table.includes('| Provider / Architecture | Total Monthly | Cost / 1M Reqs | Egress Cost | Architecture Type |'));
  assert(table.includes('AWS Lambda'));
  assert(table.includes('Hetzner'));
});

it('generateRedditSnippet produces an authentic developer discussion argument', () => {
  const comparison = CloudMath.compareAll({
    requests: 10000000,
    durationMs: 200,
    memoryMb: 512,
    arch: 'arm',
    apiGateway: 'http',
    egressGb: 200
  });
  const snippet = CloudMath.generateRedditSnippet(comparison, 'https://mohd34.github.io/cloudcrossover/#test');
  assert(snippet.includes('For a workload of 10.0M requests/mo'));
  assert(snippet.includes('The serverless break-even point is'));
  assert(snippet.includes('https://mohd34.github.io/cloudcrossover/#test'));
});

it('generateADR produces a complete Architectural Decision Record markdown document', () => {
  const comparison = CloudMath.compareAll({
    requests: 20000000,
    durationMs: 150,
    memoryMb: 256,
    arch: 'arm',
    apiGateway: 'http',
    egressGb: 300
  });
  const adr = CloudMath.generateADR(comparison, 'https://mohd34.github.io/cloudcrossover/#test');
  assert(adr.includes('# Architectural Decision Record: Compute Platform Selection (ADR-001)'));
  assert(adr.includes('## Context and Problem Statement'));
  assert(adr.includes('## Financial Decision Matrix'));
  assert(adr.includes('## Decision Outcome'));
  assert(adr.includes('### Crossover Analysis'));
});

console.log(`\n======================================================`);
console.log(`🎉 All ${passed}/${total} CloudCrossover formula tests passed!`);
console.log(`======================================================\n`);
