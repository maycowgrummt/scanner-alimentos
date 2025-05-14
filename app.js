const startBtn = document.getElementById('start-scanner');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const scanAgainBtn = document.getElementById('scan-again');

let html5QrCode;

const ingredientesNocivosList = [
  "gordura vegetal hidrogenada", "corante", "acidulante", "aspartame", "glutamato", "conservante"
];

const produtosLocais = [
  {
    codigo: "7891000315507",
    nome: "Biscoito Recheado Chocolate",
    ingredientes: "Açúcar, gordura vegetal hidrogenada, corante artificial",
    alternativas: "Biscoito integral sem recheio, frutas desidratadas"
  },
  {
    codigo: "7896051116011",
    nome: "Refrigerante de Cola",
    ingredientes: "Açúcar, acidulante ácido fosfórico, corante caramelo IV",
    alternativas: "Água com gás e limão, chá gelado natural"
  }
];

startBtn.addEventListener('click', () => {
  startBtn.style.display = "none";
  scannerContainer.style.display = "block";

  html5QrCode = new Html5Qrcode("reader");

  const config = {
    fps: 10,
    qrbox: 250,
    aspectRatio: 1.333,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    },
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.UPC_A
    ]
  };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      html5QrCode.stop();
      buscarProduto(decodedText);
    },
    (err) => {}
  ).catch(err => {
    alert("Erro ao iniciar câmera: " + err);
    console.error(err);
  });
});

async function buscarProduto(codigo) {
  const local = produtosLocais.find(p => p.codigo === codigo);
  if (local) {
    return mostrarProduto(local);
  }

  try {
    const resposta = await fetch(`https://world.openfoodfacts.org/api/v2/product/${codigo}`);
    const dados = await resposta.json();

    if (dados.status === 1) {
      const produto = dados.product;
      const textoIngredientes = produto.ingredients_text || "";

      const nocivos = ingredientesNocivosList.filter(item =>
        textoIngredientes.toLowerCase().includes(item)
      );

      mostrarProduto({
        nome: produto.product_name || "Nome não encontrado",
        ingredientes: nocivos.join(", ") || "Nenhum ingrediente nocivo detectado",
        alternativas: "Busque alternativas mais naturais"
      });
    } else {
      alert("Produto não encontrado.");
      resetar();
    }
  } catch (erro) {
    console.error("Erro ao buscar produto:", erro);
    alert("Erro ao buscar informações do produto.");
    resetar();
  }
}

function mostrarProduto(produto) {
  productName.textContent = produto.nome;
  badIngredients.textContent = produto.ingredientes;
  healthyAlternatives.textContent = produto.alternativas;

  scannerContainer.style.display = "none";
  productInfo.style.display = "block";
}

function resetar() {
  productInfo.style.display = "none";
  startBtn.style.display = "block";
}

scanAgainBtn.addEventListener('click', () => {
  productInfo.style.display = "none";
  scannerContainer.style.display = "block";

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250,
      aspectRatio: 1.333,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A
      ]
    },
    (decodedText) => {
      html5QrCode.stop();
      buscarProduto(decodedText);
    },
    (err) => {}
  );
});

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(() => console.log('✅ Service Worker registrado com sucesso!'))
      .catch(err => console.error('Erro ao registrar Service Worker:', err));
  });
}
