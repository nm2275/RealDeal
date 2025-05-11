(function() {
    // Example: Extract price history from a table with class 'price-table'
    const rows = document.querySelectorAll('.price-table tr');
    const priceData = [];
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        priceData.push({
          date: cells[0].innerText.trim(),
          price: parseFloat(cells[1].innerText.replace(/[^0-9.]/g, ''))
        });
      }
    });
  
    // Save data to chrome.storage so popup can access it
    chrome.storage.local.set({ priceData });
  })();