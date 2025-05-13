const video = document.getElementById("video");
const startBtn = document.getElementById("start-scan");
const manualInput = document.getElementById("manual-input");
const searchBtn = document.getElementById("search-btn");
const result = document.getElementById("product-result");
const nameEl = document.getElementById("product-name");
const ingredientsEl = document.getElementById("ingredients");
const gradeEl = document.getElementById("grade");
const newScanBtn = document.getElementById("new-scan");

// Iniciar a câmera com Quagga
startBtn.addEventListener("click", () => {
  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: video,
        constraints: {
          facingMode: "environment"
        }
      },
      decoder: {
        readers: ["ean_reader"]
      }
    },
    function (err) {
      if (err) {
        console.error(err);
        alert("Erro ao iniciar a câmera.");
        return;
      }
      Quagga.start();
    }
  );

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    Quagga.stop();
    fetchProduct(code);
  });
});

// Busca via input manual
searchBtn.addEventListener("click", () => {
  const code = manualInput.value.trim();
  if (code) {
    fetchProduct(code);
  }
});

// Buscar da API Open Food Facts
function fetchProduct(code) {
  fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 1) {
        const product = data.product;
        nameEl.textContent = product.product_name || "Sem nome";
        ingredientsEl.textContent = product.ingredients_text || "Sem dados";
        const grade = product.nutrition_grades || "indisponível";

        let cor = "🔴 Ruim";
        if (grade === "b" || grade === "c") cor = "🟡 Médio";
        if (grade === "a") cor = "🟢 Saudável";

        gradeEl.textContent = cor;
        result.style.display = "block";
      } else {
        alert("Produto não encontrado na base do Open Food Facts.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao buscar o produto.");
    });
}

// Escanear outro
newScanBtn.addEventListener("click", () => {
  result.style.display = "none";
});
