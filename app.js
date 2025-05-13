// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const loadingOverlay = document.getElementById('loading-overlay');

// Função para iniciar a câmera
async function startCamera() {
    try {
        // 1. Verificar se o navegador suporta a API de mídia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Seu navegador não suporta acesso à câmera');
        }

        // 2. Solicitar acesso à câmera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",  // Usar câmera traseira
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // 3. Conectar o stream ao elemento de vídeo
        video.srcObject = stream;
        
        // 4. Esperar o vídeo estar pronto
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(err => {
                    console.error("Erro ao reproduzir vídeo:", err);
                    // Tentar novamente (necessário para alguns navegadores)
                    video.play().then(resolve).catch(e => {
                        console.error("Falha na segunda tentativa:", e);
                        alert("Toque na tela para ativar a câmera");
                    });
                });
            };
        });

        // 5. Mostrar feedback visual
        video.style.display = 'block';
        startBtn.style.display = 'none';
        console.log("Câmera iniciada com sucesso!");

        // Iniciar o scanner após iniciar a câmera
        startScanner();

    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        alert(`Erro: ${error.message}`);
    }
}

// Função para iniciar o scanner de código de barras
function startScanner() {
    // Exibe o overlay de carregamento enquanto o scanner está em funcionamento
    loadingOverlay.style.display = "flex";

    Quagga.init({
        inputStream: {
            name: "live",
            type: "LiveStream",
            target: video,
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["ean_reader", "upc_reader", "ean_8_reader"]
        }
    }, (err) => {
        if (err) {
            console.error("Erro ao iniciar o scanner:", err);
            loadingOverlay.style.display = "none";
            return;
        }
        Quagga.start();
        console.log("Scanner iniciado!");
    });

    Quagga.onDetected(handleBarcode);
}

// Função para lidar com o código de barras detectado
function handleBarcode(result) {
    const code = result.codeResult.code;
    console.log("Código de barras detectado:", code);

    // Buscar informações do produto com o código de barras
    fetchProductInfo(code);
    Quagga.stop();  // Para o scanner depois de ler um código
}

// Função para buscar informações do produto usando a API do Open Food Facts
async function fetchProductInfo(code) {
    loadingOverlay.style.display = "flex";

    const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.product) {
            const product = data.product;
            document.getElementById('product-name').textContent = product.product_name || "Produto não encontrado";
            document.getElementById('bad-ingredients').textContent = product.ingredients_text || "Ingredientes não disponíveis";
            document.getElementById('healthy-alternatives').textContent = "Alternativas saudáveis ainda não implementadas.";

            // Exibe as informações e esconde o scanner
            scannerContainer.style.display = 'none';
            productInfo.style.display = 'block';
        } else {
            alert("Produto não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao buscar o produto:", error);
        alert("Erro ao obter informações do produto.");
    } finally {
        loadingOverlay.style.display = "none";
    }
}

// Event listener para o botão "Iniciar Scanner"
startBtn.addEventListener('click', startCamera);

// Event listener para o botão "Escanear Novamente"
document.getElementById('scan-again').addEventListener('click', () => {
    productInfo.style.display = 'none';
    scannerContainer.style.display = 'block';
    startCamera();
});

// Limpar ao sair
window.addEventListener('beforeunload', stopCamera);
function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
    startBtn.style.display = 'block';
}
