chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  const url = tabs[0].url;
  const productId = url.split('/').pop();
  const key = `priceHistory_${productId}`;

  chrome.storage.local.get([key], function(result) {
    const data = result[key] || [];
    if (!data.length) {
      document.getElementById('priceChart').replaceWith('No price history yet.');
      return;
    }
    const labels = data.map(entry => entry.date);
    const prices = data.map(entry => entry.price);

    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Price (₹)',
          data: prices,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          x: { display: true, title: { display: true, text: 'Date' } },
          y: { display: true, title: { display: true, text: 'Price (₹)' } }
        }
      }
    });
  });
});
