// Inject sidebar only if not already present
if (!document.getElementById('realdeal-sidebar')) {
  const sidebar = document.createElement('div');
  sidebar.id = 'realdeal-sidebar';
  sidebar.innerHTML = `
    <button class="sidebar-btn" id="price-history-btn" title="Price History">
      <span class="icon">📈</span>
      <span class="label">Price History</span>
    </button>
    <button class="sidebar-btn" id="reviews-auth-btn" title="Reviews Authenticity">
      <span class="icon">⭐</span>
      <span class="label">Reviews authenticity</span>
    </button>
    <button class="sidebar-btn" id="seller-rep-btn" title="Seller Reputation">
      <span class="icon">📦</span>
      <span class="label">Seller repuation</span>
    </button>
    <button class="sidebar-btn" id="recommend-btn" title="Recommendation">
      <span class="icon">✅</span>
      <span class="label">Suggestion bar</span>
    </button>
  `;
  document.body.appendChild(sidebar);

  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    #realdeal-sidebar {
      position: fixed;
      top: 80px;
      right: 0;
      width: 60px;
      background:rgb(98, 171, 243);
      border-radius: 0 12px 12px 0;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
    }
    .sidebar-btn {
      background: none;
      border: none;
      color: #fff;
      width: 48px;
      height: 48px;
      margin: 6px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: background 0.2s;
      font-size: 18px;
    }
    .sidebar-btn:hover {
      background: #1565c0;
    }
    .icon {
      font-size: 22px;
      margin-bottom: 2px;
    }
    .label {
      font-size: 10px;
      font-weight: 500;
      line-height: 1;
    }
  `;
  document.head.appendChild(style);
}

// Inject price history panel (hidden by default)
const pricePanel = document.createElement('div');
pricePanel.id = 'realdeal-price-panel';
pricePanel.innerHTML = `
  
  <div id="rd-panel-header">
    <span>Price History</span>
    <button id="rd-panel-close" style="float:right;">✖</button>
  </div>
  <canvas id="priceChart" width="308" height="123" style="display: block; box-sizing: border-box; height: 123px; width: 308px;"></canvas>

`;
pricePanel.style.display = 'none';
document.body.appendChild(pricePanel);

// Add panel CSS
const panelStyle = document.createElement('style');
panelStyle.textContent = `
  #realdeal-price-panel {
    position: fixed;
    top: 100px;
    right: 70px;
    width: 350px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.18);
    z-index: 100000;
    padding: 16px;
    border: 1px solid #1976d2;
  }
  #rd-panel-header {
    font-weight: bold;
    color: #1976d2;
    margin-bottom: 8px;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  #rd-panel-close {
    background: none;
    border: none;
    color: #1976d2;
    font-size: 18px;
    cursor: pointer;
  }
`;
document.head.appendChild(panelStyle);

// Add event listeners for sidebar buttons
document.getElementById('price-history-btn').onclick = function() {
  pricePanel.style.display = 'block';
  drawPriceChart();
};
document.getElementById('rd-panel-close').onclick = function() {
  pricePanel.style.display = 'none';
};
document.getElementById('reviews-auth-btn').onclick = function() {
  alert('Show reviews authenticity panel here!');
};
document.getElementById('seller-rep-btn').onclick = function() {
  alert('Show seller reputation panel here!');
};
document.getElementById('recommend-btn').onclick = function() {
  alert('Show recommendation panel here!');
};

console.log("Content script loaded!");

// Draw price chart function
function drawPriceChart() {
  const url = window.location.href;
  const productId = url.split('/').pop();
  const key = `priceHistory_${productId}`;
  chrome.storage.local.get([key], (result) => {
    const history = result[key] || [];
    const labels = history.map(h => h.date);
    const data = history.map(h => h.price);

    // Remove old chart if exists
    if (window.rdChart) {
      window.rdChart.destroy();
    }

    // Load Chart.js if not loaded
    if (typeof Chart === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => renderChart(labels, data);
      document.head.appendChild(script);
    } else {
      renderChart(labels, data);
    }
  });

  function renderChart(labels, data) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    window.rdChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Price',
          data: data,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          x: { display: true, title: { display: false } },
          y: { display: true, title: { display: false } }
        }
      }
    });
  }
}

// Robust price tracking logic with retry for dynamic content
function tryExtractPrice(retries = 10) {
  const priceTag = document.querySelector('.sc-eDvSVe.biMVPh');
  if (!priceTag) {
    if (retries > 0) {
      setTimeout(() => tryExtractPrice(retries - 1), 500);
    } else {
      console.log("Price tag not found after retries!");
    }
    return;
  }

  const price = parseFloat(priceTag.textContent.replace(/[^0-9.]/g, ''));
  console.log("Extracted price:", price);

  const url = window.location.href;
  const productId = url.split('/').pop();
  const date = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const key = `priceHistory_${productId}`;
  chrome.storage.local.get([key], (result) => {
    const history = result[key] || [];
        console.log('Chart history:', history);
    history.push({ date, price });
    chrome.storage.local.set({ [key]: history }, () => {
      console.log("Saved to storage:", key, history);

    });
  });
}

tryExtractPrice();
window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.altKey && e.key === 'L') { // Ctrl+Alt+L
    const url = window.location.href;
    const productId = url.split('/').pop();
    const key = `priceHistory_${productId}`;
    chrome.storage.local.get([key], (result) => {
      console.log('Price history for this product:', result[key]);
    });
  }
});
