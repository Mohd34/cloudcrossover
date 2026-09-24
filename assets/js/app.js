/**
 * CloudCrossover Interactive Client Application
 * Handles reactive UI updates, URL hash state serialization, presets,
 * one-click clipboard copying, and ADR download generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Workload Inputs
  const elRequestsSlider = document.getElementById('input-requests-slider');
  const elRequestsVal = document.getElementById('val-requests');
  const elDurationSlider = document.getElementById('input-duration-slider');
  const elDurationVal = document.getElementById('val-duration');
  const elMemorySlider = document.getElementById('input-memory-slider');
  const elMemoryVal = document.getElementById('val-memory');
  const elEgressSlider = document.getElementById('input-egress-slider');
  const elEgressVal = document.getElementById('val-egress');
  
  const elArchArm = document.getElementById('btn-arch-arm');
  const elArchX86 = document.getElementById('btn-arch-x86');
  const gatewayBtns = document.querySelectorAll('.btn-gateway');
  
  // Results Elements
  const elCrossoverText = document.getElementById('crossover-text');
  const elCrossoverHetzner = document.getElementById('crossover-hetzner-val');
  const elCrossoverDO = document.getElementById('crossover-do-val');
  const elCrossoverEC2 = document.getElementById('crossover-ec2-val');
  const elProviderCardsContainer = document.getElementById('provider-cards-grid');
  const elChartBarsContainer = document.getElementById('chart-bars-container');
  
  // Share & Export Elements
  const elSharePreview = document.getElementById('share-preview');
  const elBtnCopyUrl = document.getElementById('btn-copy-url');
  const elBtnCopyMd = document.getElementById('btn-copy-md');
  const elBtnCopyReddit = document.getElementById('btn-copy-reddit');
  const elBtnDownloadAdr = document.getElementById('btn-download-adr');
  const elToast = document.getElementById('toast');
  const elToastMsg = document.getElementById('toast-msg');

  // Traps Audit Elements
  const elTrapNatCost = document.getElementById('trap-nat-cost');
  const elTrapRestCost = document.getElementById('trap-rest-cost');
  const elTrapEgressCost = document.getElementById('trap-egress-cost');

  // Presets
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Current State
  const state = {
    requests: 5000000,
    durationMs: 150,
    memoryMb: 512,
    arch: 'arm',
    apiGateway: 'http',
    egressGb: 100
  };

  // Workload Presets Catalog
  const PRESETS = {
    webhook: {
      requests: 50000000,
      durationMs: 80,
      memoryMb: 256,
      arch: 'arm',
      apiGateway: 'http',
      egressGb: 100
    },
    contentApi: {
      requests: 10000000,
      durationMs: 150,
      memoryMb: 512,
      arch: 'arm',
      apiGateway: 'http',
      egressGb: 1200
    },
    microservice: {
      requests: 2000000,
      durationMs: 200,
      memoryMb: 256,
      arch: 'arm',
      apiGateway: 'http',
      egressGb: 50
    },
    heavyCompute: {
      requests: 5000000,
      durationMs: 600,
      memoryMb: 1024,
      arch: 'x86',
      apiGateway: 'http',
      egressGb: 300
    },
    sideProject: {
      requests: 250000,
      durationMs: 120,
      memoryMb: 128,
      arch: 'arm',
      apiGateway: 'rest',
      egressGb: 10
    }
  };

  // Helper to format request counts (e.g. 10.5M, 750K)
  function formatRequests(n) {
    if (n >= 1000000) {
      return (n / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'M reqs/mo';
    }
    return (n / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + 'K reqs/mo';
  }

  // Toast Notification
  function showToast(message) {
    if (!elToast || !elToastMsg) return;
    elToastMsg.textContent = message;
    elToast.classList.add('show');
    setTimeout(() => {
      elToast.classList.remove('show');
    }, 2800);
  }

  // Load from URL Hash if present
  function initFromUrlHash() {
    if (window.location.hash && window.location.hash.includes('r=')) {
      const hashQuery = window.location.hash.substring(1);
      const parsed = CloudMath.decodeState(hashQuery);
      if (parsed) {
        state.requests = parsed.requests;
        state.durationMs = parsed.durationMs;
        state.memoryMb = parsed.memoryMb;
        state.arch = parsed.arch;
        state.apiGateway = parsed.apiGateway;
        state.egressGb = parsed.egressGb;
      }
    }
  }

  // Sync Input Controls to Current State
  function syncControlsToState() {
    if (elRequestsSlider) elRequestsSlider.value = state.requests;
    if (elRequestsVal) elRequestsVal.textContent = formatRequests(state.requests);

    if (elDurationSlider) elDurationSlider.value = state.durationMs;
    if (elDurationVal) elDurationVal.textContent = state.durationMs + ' ms';

    if (elMemorySlider) elMemorySlider.value = state.memoryMb;
    if (elMemoryVal) elMemoryVal.textContent = state.memoryMb + ' MB';

    if (elEgressSlider) elEgressSlider.value = state.egressGb;
    if (elEgressVal) elEgressVal.textContent = state.egressGb + ' GB';

    // Arch buttons
    if (elArchArm && elArchX86) {
      if (state.arch === 'arm') {
        elArchArm.classList.add('active');
        elArchX86.classList.remove('active');
      } else {
        elArchArm.classList.remove('active');
        elArchX86.classList.add('active');
      }
    }

    // Gateway buttons
    gatewayBtns.forEach(btn => {
      if (btn.dataset.gateway === state.apiGateway) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Update URL Hash without triggering full reload or jump
  function updateUrlHash() {
    const encoded = CloudMath.encodeState(state);
    if (history.replaceState) {
      history.replaceState(null, '', '#' + encoded);
    } else {
      window.location.hash = encoded;
    }
  }

  // Main Calculation and UI Render
  function recalculateAndRender() {
    const comparison = CloudMath.compareAll(state);
    const shareUrl = window.location.origin + window.location.pathname + '#' + CloudMath.encodeState(state);

    // 1. Crossover Banner
    const hetznerCrossover = comparison.crossoverRequestsHetzner;
    const isOverCrossover = state.requests >= hetznerCrossover;
    
    if (elCrossoverText) {
      if (isOverCrossover) {
        elCrossoverText.innerHTML = `⚠️ Your workload has crossed the serverless economic threshold. <strong>${comparison.cheapest.provider}</strong> is currently <strong>${comparison.savingsPct}% cheaper</strong> than the most expensive alternative.`;
      } else {
        elCrossoverText.innerHTML = `💡 For low-frequency traffic, Serverless remains cost-effective. At <strong>${hetznerCrossover.toLocaleString()} requests/month</strong>, Hetzner VPS flips to being cheaper.`;
      }
    }

    if (elCrossoverHetzner) elCrossoverHetzner.textContent = hetznerCrossover.toLocaleString() + ' reqs';
    if (elCrossoverDO) elCrossoverDO.textContent = comparison.crossoverRequestsDO.toLocaleString() + ' reqs';
    if (elCrossoverEC2) elCrossoverEC2.textContent = comparison.crossoverRequestsEC2.toLocaleString() + ' reqs';

    // 2. Provider Cards
    if (elProviderCardsContainer) {
      elProviderCardsContainer.innerHTML = '';
      
      comparison.ranked.forEach(item => {
        const isWinner = item.provider === comparison.cheapest.provider;
        const card = document.createElement('div');
        card.className = `provider-card ${isWinner ? 'cheapest-winner' : ''}`;

        let breakdownHtml = '';
        if (item.computeCost !== undefined) {
          breakdownHtml += `<div class="breakdown-row"><span>Compute GB-s:</span><span class="mono">$${item.computeCost.toFixed(2)}</span></div>`;
        }
        if (item.requestCost !== undefined) {
          breakdownHtml += `<div class="breakdown-row"><span>Invocations:</span><span class="mono">$${item.requestCost.toFixed(2)}</span></div>`;
        }
        if (item.apiGatewayCost !== undefined) {
          breakdownHtml += `<div class="breakdown-row"><span>API Gateway:</span><span class="mono">$${item.apiGatewayCost.toFixed(2)}</span></div>`;
        }
        if (item.baseCost !== undefined) {
          breakdownHtml += `<div class="breakdown-row"><span>Base Instance:</span><span class="mono">$${item.baseCost.toFixed(2)}</span></div>`;
        }
        if (item.instanceCost !== undefined) {
          breakdownHtml += `<div class="breakdown-row"><span>EC2 Instance:</span><span class="mono">$${item.instanceCost.toFixed(2)}</span></div>`;
        }
        if (item.albCost !== undefined && item.albCost > 0) {
          breakdownHtml += `<div class="breakdown-row"><span>ALB + LCU:</span><span class="mono">$${item.albCost.toFixed(2)}</span></div>`;
        }
        if (item.egressCost !== undefined) {
          breakdownHtml += `<div class="breakdown-row"><span>Data Egress:</span><span class="mono">$${item.egressCost.toFixed(2)}</span></div>`;
        }
        breakdownHtml += `<div class="breakdown-row total"><span>Total Monthly:</span><span class="mono">$${item.totalMonthlyCost.toFixed(2)}</span></div>`;

        card.innerHTML = `
          ${isWinner ? '<span class="winner-ribbon">Cheapest</span>' : ''}
          <div class="provider-header">
            <h3 class="provider-name">${item.provider}</h3>
            <span class="provider-type">${item.provider.includes('Lambda') || item.provider.includes('Cloud Run') ? 'Serverless Function' : (item.provider.includes('Fly') ? 'Managed Container' : 'VPS Virtual Server')}</span>
          </div>
          <div class="provider-pricing">
            <div class="price-main">$${item.totalMonthlyCost.toFixed(2)}<span class="price-period">/mo</span></div>
            <div class="price-per-m">$${item.costPerMillion.toFixed(2)} per 1M requests</div>
          </div>
          <div class="provider-breakdown">
            ${breakdownHtml}
          </div>
        `;
        elProviderCardsContainer.appendChild(card);
      });
    }

    // 3. Comparison Bar Chart Visualizer
    if (elChartBarsContainer) {
      elChartBarsContainer.innerHTML = '';
      const maxCost = Math.max(...comparison.ranked.map(r => r.totalMonthlyCost), 1);

      comparison.ranked.forEach(item => {
        const pct = Math.max(3, Math.min(100, (item.totalMonthlyCost / maxCost) * 100));
        const isWinner = item.provider === comparison.cheapest.provider;
        const color = isWinner ? 'var(--accent-emerald)' : (item.totalMonthlyCost === maxCost ? 'var(--accent-rose)' : 'var(--accent-blue)');

        const row = document.createElement('div');
        row.className = 'chart-row';
        row.innerHTML = `
          <div class="chart-label-bar">
            <span>${item.provider}</span>
            <span class="mono">$${item.totalMonthlyCost.toFixed(2)} / mo</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        `;
        elChartBarsContainer.appendChild(row);
      });
    }

    // 4. Hidden Cost Traps Dynamic Audit
    if (elTrapNatCost) {
      // NAT Gateway $32.85 base + $0.045/GB
      const natTotal = 32.85 + (state.egressGb * 0.045);
      elTrapNatCost.textContent = `$${natTotal.toFixed(2)}/mo`;
    }
    if (elTrapRestCost) {
      const restCost = (state.requests / 1000000) * 3.50;
      const httpCost = (state.requests / 1000000) * 1.00;
      const diff = Math.max(0, restCost - httpCost);
      elTrapRestCost.textContent = `+$${diff.toFixed(2)}/mo excess`;
    }
    if (elTrapEgressCost) {
      const billableGb = Math.max(0, state.egressGb - 100);
      const awsEgress = billableGb * 0.09;
      elTrapEgressCost.textContent = `$${awsEgress.toFixed(2)}/mo`;
    }

    // 5. Update Share Preview Box (defaults to Markdown table for immediate PR copy)
    if (elSharePreview) {
      elSharePreview.textContent = CloudMath.generateMarkdownTable(comparison, shareUrl);
    }

    // Update URL hash
    updateUrlHash();
  }

  // Event Listeners for Sliders and Inputs
  if (elRequestsSlider) {
    elRequestsSlider.addEventListener('input', (e) => {
      state.requests = parseFloat(e.target.value);
      if (elRequestsVal) elRequestsVal.textContent = formatRequests(state.requests);
      recalculateAndRender();
    });
  }

  if (elDurationSlider) {
    elDurationSlider.addEventListener('input', (e) => {
      state.durationMs = parseFloat(e.target.value);
      if (elDurationVal) elDurationVal.textContent = state.durationMs + ' ms';
      recalculateAndRender();
    });
  }

  if (elMemorySlider) {
    elMemorySlider.addEventListener('input', (e) => {
      state.memoryMb = parseFloat(e.target.value);
      if (elMemoryVal) elMemoryVal.textContent = state.memoryMb + ' MB';
      recalculateAndRender();
    });
  }

  if (elEgressSlider) {
    elEgressSlider.addEventListener('input', (e) => {
      state.egressGb = parseFloat(e.target.value);
      if (elEgressVal) elEgressVal.textContent = state.egressGb + ' GB';
      recalculateAndRender();
    });
  }

  // Architecture toggle
  if (elArchArm && elArchX86) {
    elArchArm.addEventListener('click', () => {
      state.arch = 'arm';
      elArchArm.classList.add('active');
      elArchX86.classList.remove('active');
      recalculateAndRender();
    });

    elArchX86.addEventListener('click', () => {
      state.arch = 'x86';
      elArchX86.classList.add('active');
      elArchArm.classList.remove('active');
      recalculateAndRender();
    });
  }

  // API Gateway toggle
  gatewayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gatewayBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.apiGateway = btn.dataset.gateway;
      recalculateAndRender();
    });
  });

  // Presets click handling
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const preset = PRESETS[presetKey];
      if (preset) {
        Object.assign(state, preset);
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        syncControlsToState();
        recalculateAndRender();
        showToast(`Loaded ${btn.textContent.trim()} scenario`);
      }
    });
  });

  // Copy URL action
  if (elBtnCopyUrl) {
    elBtnCopyUrl.addEventListener('click', () => {
      const shareUrl = window.location.origin + window.location.pathname + '#' + CloudMath.encodeState(state);
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('📋 Shareable benchmark URL copied to clipboard!');
      });
    });
  }

  // Copy Markdown Table (GitHub PR format)
  if (elBtnCopyMd) {
    elBtnCopyMd.addEventListener('click', () => {
      const comparison = CloudMath.compareAll(state);
      const shareUrl = window.location.origin + window.location.pathname + '#' + CloudMath.encodeState(state);
      const md = CloudMath.generateMarkdownTable(comparison, shareUrl);
      navigator.clipboard.writeText(md).then(() => {
        showToast('📋 Markdown PR Comparison Table copied!');
      });
    });
  }

  // Copy Reddit/Discord Argument Snippet
  if (elBtnCopyReddit) {
    elBtnCopyReddit.addEventListener('click', () => {
      const comparison = CloudMath.compareAll(state);
      const shareUrl = window.location.origin + window.location.pathname + '#' + CloudMath.encodeState(state);
      const snippet = CloudMath.generateRedditSnippet(comparison, shareUrl);
      navigator.clipboard.writeText(snippet).then(() => {
        showToast('💬 Discussion snippet copied to clipboard!');
      });
    });
  }

  // Download ADR Document (.md)
  if (elBtnDownloadAdr) {
    elBtnDownloadAdr.addEventListener('click', () => {
      const comparison = CloudMath.compareAll(state);
      const shareUrl = window.location.origin + window.location.pathname + '#' + CloudMath.encodeState(state);
      const adrContent = CloudMath.generateADR(comparison, shareUrl);

      const blob = new Blob([adrContent], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ADR-001-compute-platform-selection.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 Downloaded ADR-001-compute-platform-selection.md');
    });
  }

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('cc-theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cc-theme', next);
    });
  }

  // Initial Boot
  initFromUrlHash();
  syncControlsToState();
  recalculateAndRender();
});
