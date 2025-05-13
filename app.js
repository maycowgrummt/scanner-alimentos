const video = document.getElementById("video");
const resultContainer = document.getElementById("product-result");
const productName = document.getElementById("product-name");
const ingredients = document.getElementById("ingredients");
const grade = document.getElementById("grade");
const manualInput = document.getElementById("manual-input");
const searchBtn = document.getElementById("search-btn");
const newScanBtn = document.getElementById("new-scan");

function startScanner() {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: video,
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader"]
    }
  }, err => {
    if (err) {
      console.error(err);
      alert("Erro ao iniciar a câmera.");
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
        alert("Produto não encontrado!");
        startScanner(); // tentar novamente
      }
    })
    .catch(() => {
      alert("Erro ao buscar dados do produto.");
      startScanner();
    });
}

searchBtn.addEventListener("click", () => {
  const code = manualInput.value.trim();
  if (code) fetchProduct(code);
});

newScanBtn.addEventListener("click", () => {
  resultContainer.style.display = "none";
  startScanner();
});

// Iniciar scanner automaticamente ao abrir a página
window.addEventListener("load", () => {
  startScanner();
});
