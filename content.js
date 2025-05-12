console.log("Content script loaded!");
(function() {
  const url = window.location.href;
  const productId = url.split('/').pop();
  console.log("Product ID:", productId);

  const priceTag = document.querySelector('.sc-eDvSVe.biMVPh');
  if (!priceTag) {
    console.log("Price tag not found!");
    return;
  }

  const price = parseFloat(priceTag.textContent.replace(/[^0-9.]/g, ''));
  console.log("Extracted price:", price);

  const date = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const key = `priceHistory_${productId}`;
  chrome.storage.local.get([key], (result) => {
    const history = result[key] || [];
    history.push({ date, price });
    chrome.storage.local.set({ [key]: history }, () => {
      console.log("Saved to storage:", key, history);
    });
  });
})();
