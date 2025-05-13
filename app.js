const statusEl = document.getElementById('camera-status');
const resultEl = document.getElementById('result');
const barcodeEl = document.getElementById('barcode');
const historyEl = document.getElementById('history');
const productInfoEl = document.createElement('div');
resultEl.appendChild(productInfoEl);

// Cores de alerta
function getColorRating(product) {
  const hasPalmOil = product.ingredients_tags?.includes('en:palm-oil') || false;
  const additives = product.additives_tags?.length || 0;
  const allergens = product.allergens_tags?.length || 0;

  if (allergens > 0 || hasPalmOil || additives > 5) return 'red';
  if (additives > 0) return 'orange';
  return 'green';
}

function getColorLabel(color) {
  if (color === 'red') return '⚠️ Evite';
  if (color === 'orange') return '⚠️ Consuma com moderação';
  return '✅ Saudável';
}

function showProductData(product, barcode) {
  const name = product.product_name || "Nome indisponível";
  const ingredients = product.ingredients_text || "Ingredientes não encontrados.";
  const allergens = product.allergens_tags || [];
  const color = getColorRating(product);
  const label = getColorLabel(color);

  productInfoEl.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Ingredientes:</strong> ${ingredients}</p>
    ${
      allergens.length > 0
        ? `<p style="color: red;"><strong>Alergênicos:</strong> ${allergens.join(', ')}</p>`
        : `<p style="color: green;">Sem alergênicos detectados.</p>`
    }
    <p><strong>Classificação:</strong> <span style="color: ${color}; font-weight: bold;">${label}</span></p>
    <button onclick="startScanner()">Escanear Novamente</button>
  `;

  saveToHistory({ name, barcode, color });
  renderHistory();
}

function showError(message) {
  productInfoEl.innerHTML = `
    <p style="color: red;"><strong>${message}</strong></p>
    <button onclick="startScanner()">Tentar Novamente</button>
  `;
}

function fetchProduct(barcode) {
  statusEl.textContent = "Buscando informações...";
  barcodeEl.textContent = barcode;

  fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 1) {
        showProductData(data.product, barcode);
      } else {
        showError("Produto não encontrado.");
      }
    })
    .catch(err => {
      console.error("Erro na API:", err);
      showError("Erro ao buscar informações do produto.");
    });
}

// Histórico local
function saveToHistory(entry) {
  const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
  history.unshift(entry);
  localStorage.setItem('scanHistory', JSON.stringify(history.slice(0, 5)));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
  historyEl.innerHTML = "<h3>Histórico</h3>" + history.map(item => `
    <div class="history-item" style="border-left: 5px solid ${item.color}; padding-left: 8px;">
      <strong>${item.name}</strong><br>
      <small>Código: ${item.barcode}</small>
    </div>
  `).join('');
}

// Scanner
function startScanner() {
  document.getElementById("scanner-container").style.display = "block";
  resultEl.style.display = "none";
  productInfoEl.innerHTML = '';
  statusEl.textContent = "Iniciando câmera...";

  Quagga.stop();
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner-video'),
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader", "ean_13_reader", "upc_reader"]
    }
  }, function (err) {
    if (err) {
      console.error(err);
      alert("Erro ao iniciar a câmera.");
      return;
    }
    Quagga.start();
    statusEl.textContent = "Aponte a câmera para o código de barras.";
  });

  Quagga.onDetected(data => {
    const code = data.codeResult.code;
    if (code) {
      Quagga.offDetected();
      Quagga.stop();
      document.getElementById("scanner-container").style.display = "none";
      resultEl.style.display = "block";
      fetchProduct(code);
    }
  });
}

// Iniciar na carga
window.addEventListener('load', () => {
  renderHistory();
  startScanner();
});
