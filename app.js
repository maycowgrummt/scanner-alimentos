// Função para iniciar a câmera
async function startCamera() {
  const video = document.getElementById('scanner-video');
  const cameraStatus = document.getElementById('camera-status');
  const noCameraMessage = document.getElementById('no-camera-message');
  
  try {
    // 1. Verificar se o navegador suporta a API de mídia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Seu navegador não suporta acesso à câmera');
    }

    // 2. Solicitar acesso à câmera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });

    // 3. Conectar o stream ao elemento de vídeo
    video.srcObject = stream;

    // 4. Esperar o vídeo estar pronto
    video.onloadedmetadata = () => {
      video.play().then(() => {
        cameraStatus.textContent = "Câmera ativada!";
        cameraStatus.style.backgroundColor = "#2ecc71";  // Verde
      }).catch(err => {
        cameraStatus.textContent = "Erro ao iniciar a câmera!";
        cameraStatus.style.backgroundColor = "#e74c3c";  // Vermelho
        console.error("Erro ao reproduzir vídeo:", err);
        alert("Erro ao iniciar a câmera.");
      });
    };

    // Exibir a câmera assim que ativada
    video.style.display = 'block';
    cameraStatus.style.display = 'block';

  } catch (error) {
    cameraStatus.textContent = "Erro ao acessar a câmera!";
    cameraStatus.style.backgroundColor = "#e74c3c";  // Vermelho
    console.error("Erro ao acessar a câmera:", error);
    alert(`Erro: ${error.message}`);
    noCameraMessage.style.display = 'block';
  }
}

// Função para buscar o produto usando o código de barras via API do Open Food Facts
async function fetchProductData(barcode) {
  const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 1) {
      const product = data.product;
      document.getElementById('product-name').textContent = product.product_name || 'Nome não disponível';
      document.getElementById('bad-ingredients-list').textContent = product.ingredients_text || 'Não disponível';
      document.getElementById('healthy-alternatives-list').textContent = 'Alternativas saudáveis: ' + (product.nutriments ? 'Sim' : 'Não');
      document.getElementById('product-info').style.display = 'block';
    } else {
      alert('Produto não encontrado');
    }
  } catch (error) {
    alert('Erro ao buscar dados do produto');
    console.error('Erro na API:', error);
  }
}

// Iniciar a câmera ao carregar a página
window.onload = () => {
  startCamera();
};
