// Configurações do aplicativo
const config = {
  apiUrl: 'https://world.openfoodfacts.org/api/v0/product',
  badIngredients: [
    'açúcar', 'gordura trans', 'glutamato monossódico', 'adoçantes artificiais',
    'corantes artificiais', 'conservantes artificiais', 'xarope de milho', 'óleo de palma'
  ],
  healthyAlternatives: {
    'açúcar': 'adoçantes naturais como estévia ou xilitol',
    'gordura trans': 'gorduras saudáveis como azeite ou abacate',
    'glutamato monossódico': 'temperos naturais como alho e cebola em pó',
    'adoçantes artificiais': 'mel ou açúcar de coco com moderação',
    'corantes artificiais': 'corantes naturais como açafrão ou beterraba',
    'conservantes artificiais': 'produtos frescos ou com conservantes naturais como vinagre',
    'xarope de milho': 'mel ou xarope de agave',
    'óleo de palma': 'óleo de girassol ou coco'
  }
};

// Elementos da DOM
const elements = {
  video: document.getElementById('scanner-video'),
  cameraStatus: document.getElementById('camera-status'),
  scannerContainer: document.getElementById('scanner-container'),
  productInfo: document.getElementById('product-info'),
  productName: document.getElementById('product-name'),
  ingredientsList: document.getElementById('ingredients-list'),
  badIngredients: document.getElementById('bad-ingredients'),
  healthyAlternatives: document.getElementById('healthy-alternatives'),
  healthIndicator: document.getElementById('health-indicator'),
  scanAgainBtn: document.getElementById('scan-again'),
  saveProductBtn: document.getElementById('save-product'),
  toggleCameraBtn: document.getElementById('toggle-camera'),
  historySection: document.getElementById('history-section'),
  historyList: document.getElementById('history-list')
};

// Estado do aplicativo
let state = {
  currentStream: null,
  facingMode: 'environment',
  scannedProducts: JSON.parse(localStorage.getItem('scannedProducts')) || []
};

// Iniciar a câmera
async function startCamera() {
  try {
    // Parar a câmera atual se estiver ativa
    if (state.currentStream) {
      state.currentStream.getTracks().forEach(track => track.stop());
    }

    // Atualizar status
    updateCameraStatus('Iniciando câmera...', 'info');

    // Solicitar acesso à câmera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: state.facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    state.currentStream = stream;
    elements.video.srcObject = stream;

    // Quando o vídeo estiver pronto
    elements.video.onloadedmetadata = () => {
      elements.video.play()
        .then(() => {
          updateCameraStatus('Câmera ativada - Aponte para um código de barras', 'success');
          initBarcodeScanner();
        })
        .catch(err => {
          updateCameraStatus('Erro ao iniciar a câmera', 'error');
          console.error("Erro ao reproduzir vídeo:", err);
        });
    };

  } catch (error) {
    console.error("Erro ao acessar a câmera:", error);
    
    if (error.name === 'NotAllowedError') {
      updateCameraStatus('Permissão da câmera negada', 'error');
    } else if (error.name === 'NotFoundError') {
      updateCameraStatus('Nenhuma câmera encontrada', 'error');
    } else {
      updateCameraStatus('Erro ao acessar a câmera', 'error');
    }
  }
}

// Atualizar o status da câmera
function updateCameraStatus(message, type) {
  const statusMap = {
    info: { icon: 'fa-info-circle', color: '#2196F3' },
    success: { icon: 'fa-check-circle', color: '#4CAF50' },
    error: { icon: 'fa-times-circle', color: '#F44336' },
    warning: { icon: 'fa-exclamation-triangle', color: '#FF9800' }
  };

  const status = statusMap[type] || statusMap.info;
  
  elements.cameraStatus.innerHTML = `
    <i class="fas ${status.icon}"></i> <span>${message}</span>
  `;
  elements.cameraStatus.style.backgroundColor = `${status.color}20`;
  elements.cameraStatus.style.color = status.color;
}

// Iniciar o scanner de código de barras
function initBarcodeScanner() {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: elements.video,
      constraints: {
        facingMode: state.facingMode
      },
    },
    decoder: {
      readers: ["ean_reader", "ean_8_reader", "code_128_reader", "upc_reader", "upc_e_reader"]
    },
    locate: true
  }, function(err) {
    if (err) {
      console.error("Erro ao iniciar Quagga:", err);
      updateCameraStatus('Erro no scanner de código de barras', 'error');
      return;
    }
    
    Quagga.start();
    updateCameraStatus('Scanner pronto - Aponte para um código de barras', 'success');
  });

  Quagga.onDetected(async (result) => {
    const code = result.codeResult.code;
    Quagga.stop();
    updateCameraStatus(`Código detectado: ${code}`, 'success');
    
    try {
      await fetchProductData(code);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      showError("Erro ao buscar informações do produto");
      Quagga.start();
    }
  });
}

// Buscar dados do produto na API
async function fetchProductData(barcode) {
  updateCameraStatus(`Buscando informações do produto...`, 'info');
  
  try {
    const response = await fetch(`${config.apiUrl}/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1) {
      displayProductInfo(data.product);
    } else {
      throw new Error('Produto não encontrado na base de dados');
    }
  } catch (error) {
    throw error;
  }
}

// Exibir informações do produto
function displayProductInfo(product) {
  // Mostrar seção de informações do produto
  elements.productInfo.classList.remove('hidden');
  elements.scannerContainer.classList.add('hidden');
  
  // Preencher informações básicas
  elements.productName.textContent = product.product_name || 'Nome não disponível';
  
  // Ingredientes
  const ingredients = product.ingredients_text || 'Informação de ingredientes não disponível';
  elements.ingredientsList.textContent = ingredients;
  
  // Verificar ingredientes nocivos
  const lowerIngredients = ingredients.toLowerCase();
  const foundBadIngredients = config.badIngredients.filter(ing => 
    lowerIngredients.includes(ing.toLowerCase())
  );
  
  if (foundBadIngredients.length > 0) {
    elements.badIngredients.textContent = foundBadIngredients.join(', ');
    
    // Sugerir alternativas saudáveis
    const alternatives = foundBadIngredients.map(ing => 
      `${ing}: ${config.healthyAlternatives[ing] || 'busque opções mais naturais'}`
    );
    elements.healthyAlternatives.textContent = alternatives.join('; ');
    
    // Atualizar indicador de saúde
    updateHealthIndicator('bad');
  } else {
    elements.badIngredients.textContent = 'Nenhum ingrediente nocivo detectado.';
    elements.healthyAlternatives.textContent = 'Produto parece ser uma opção saudável!';
    updateHealthIndicator('good');
  }
  
  // Adicionar ao histórico
  addToHistory(product);
}

// Atualizar indicador de saúde do produto
function updateHealthIndicator(status) {
  const statusMap = {
    good: {
      text: 'Boa qualidade',
      icon: 'fa-smile',
      class: 'good'
    },
    moderate: {
      text: 'Qualidade moderada',
      icon: 'fa-meh',
      class: 'moderate'
    },
    bad: {
      text: 'Baixa qualidade',
      icon: 'fa-frown',
      class: 'bad'
    },
    unknown: {
      text: 'Qualidade desconhecida',
      icon: 'fa-question-circle',
      class: 'unknown'
    }
  };
  
  const currentStatus = statusMap[status] || statusMap.unknown;
  
  elements.healthIndicator.className = `health-indicator ${currentStatus.class}`;
  elements.healthIndicator.innerHTML = `
    <i class="fas ${currentStatus.icon}"></i> ${currentStatus.text}
  `;
}

// Adicionar produto ao histórico
function addToHistory(product) {
  // Verificar se o produto já está no histórico
  const existingIndex = state.scannedProducts.findIndex(p => p.code === product.code);
  
  if (existingIndex >= 0) {
    // Atualizar se já existir
    state.scannedProducts[existingIndex] = product;
  } else {
    // Adicionar se for novo
    state.scannedProducts.unshift(product);
  }
  
  // Limitar histórico a 20 itens
