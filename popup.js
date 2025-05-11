window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('priceData', (result) => {
    const priceData = result.priceData;
    if (!priceData || priceData.length === 0) {
      document.getElementById('priceChart').replaceWith('No price data found.');
      return;
    }
    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: priceData.map(d => d.date),
        datasets: [{
          label: 'Price',
          data: priceData.map(d => d.price),
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: true }
        }
      }
    });
  });
});