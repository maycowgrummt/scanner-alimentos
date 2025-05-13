const resultContainer = document.getElementById("product-result");
const productName = document.getElementById("product-name");
const ingredients = document.getElementById("ingredients");
const grade = document.getElementById("grade");
const manualInput = document.getElementById("manual-input");
const searchBtn = document.getElementById("search-btn");
const newScanBtn = document.getElementById("new-scan");

// Iniciar o scanner
function startScanner() {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner'),
      constraints: {
        facingMode: "environment" // câmera traseira
      }
    },
    decoder: {
      readers: ["ean_reader"] // suporta códigos de barras EAN
    }
  }, function (err) {
    if (err) {
      console.error(err);
      alert("Erro ao acessar a câmera.");
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(data => {
    const code = data.codeResult.code;
    Quagga.stop();
    fetchProduct(code);
  });
}

// Buscar produto pela API Open Food Facts
function fetchProduct(code) {
  fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 1) {
        const product = data.product;
        productName.textContent = product.product_name || "Nome indisponível";
        ingredients.textContent = product.ingredients_text || "Sem dados de ingredientes";
        grade.textContent = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : "Não informado";
        resultContainer.style.display = "block";
      } else {
        alert("Produto não encontrado.");
        startScanner();
      }
    })
    .catch(() => {
      alert("Erro ao buscar dados do produto.");
      startScanner();
    });
}

// Busca manual
searchBtn.addEventListener("click", () => {
  const code = manualInput.value.trim();
  if (code) fetchProduct(code);
});

// Novo scan
newScanBtn.addEventListener("click", () => {
  resultContainer.style.display = "none";
  startScanner();
});

// Inicia automaticamente ao carregar a página
window.addEventListener("load", () => {
  setTimeout(startScanner, 300);
});
