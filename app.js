// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');

// Função para verificar compatibilidade
function checkCameraSupport() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Função para iniciar a câmera
async function startCamera() {
    if (!checkCameraSupport()) {
        alert('Seu navegador não suporta acesso à câmera ou você não está em HTTPS');
        return;
    }

    try {
        // Feedback visual
        startBtn.disabled = true;
        startBtn.textContent = 'Iniciando câmera...';
        
        // Configurações da câmera
        const constraints = {
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Acessar a câmera
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Configurar o elemento de vídeo
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        
        // Esperar o vídeo estar pronto
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play()
                    .then(resolve)
                    .catch(err => {
                        console.error("Erro ao reproduzir vídeo:", err);
                        // Tentativa alternativa para iOS
                        video.play().then(resolve).catch(e => {
                            console.error("Falha na segunda tentativa:", e);
                            alert("Toque na tela para ativar a câmera");
                        });
                    });
            };
        });

        // Mostrar o vídeo
        video.style.display = 'block';
        startBtn.style.display = 'none';
        console.log("Câmera iniciada com sucesso!");

        // Iniciar a leitura do código de barras
        startBarcodeScanner();

    } catch (error) {
        console.error("Erro na câmera:", error);
        handleCameraError(error);
        resetScannerUI();
    }
}

// Função para lidar com erros da câmera
function handleCameraError(error) {
    let errorMsg = "Erro ao acessar a câmera: ";
    
    switch(error.name) {
        case "NotAllowedError":
            errorMsg += "Permissão negada. Por favor, permita o acesso à câmera.";
            break;
        case "NotFoundError":
            errorMsg += "Nenhuma câmera encontrada.";
            break;
        case "NotSupportedError":
            errorMsg += "Seu navegador não suporta esta funcionalidade.";
            break;
        case "NotReadableError":
            errorMsg += "A câmera está sendo usada por outro aplicativo.";
            break;
        default:
            errorMsg += error.message;
    }
    
    alert(errorMsg);
}

// Função para iniciar o scanner de código de barras
function startBarcodeScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: video,
            constraints: {
                facingMode: "environment",
                width: { ideal: 1280 }
            }
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "upc_reader", "code_128_reader"]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error("Erro no Quagga:", err);
            alert("Erro no scanner de código de barras");
            return;
        }
        Quagga.start();
    });
    
    Quagga.onDetected(async (result) => {
        if (!result?.codeResult?.code) return;
        Quagga.stop();
        await fetchProductData(result.codeResult.code);
    });
}

// Função para buscar dados do produto
async function fetchProductData(barcode) {
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Erro na API");
        
        const data = await response.json();
        
        if (data.status === 1) {
            const product = data.product;
            document.getElementById('product-name').textContent = product.product_name || "Produto não identificado";
            document.getElementById('bad-ingredients').textContent = product.ingredients_text || "Informação não disponível";
            document.getElementById('healthy-alternatives').textContent = "Prefira alimentos naturais e minimamente processados";
            
            productInfo.style.display = 'block';
            scannerContainer.style.display = 'none';
        } else {
            alert("Produto não encontrado na base de dados");
        }
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        alert("Erro ao consultar informações do produto");
    }
}

// Função para resetar a UI do scanner
function resetScannerUI() {
    startBtn.disabled = false;
    startBtn.textContent = 'Iniciar Scanner';
}

// Função para parar a câmera
function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    if (Quagga) {
        Quagga.stop();
    }
    video.style.display = 'none';
    startBtn.style.display = 'block';
}

// Event listeners
startBtn.addEventListener('click', startCamera);
document.getElementById('scan-again').addEventListener('click', () => {
    productInfo.style.display = 'none';
    scannerContainer.style.display = 'block';
    startCamera();
});

// Limpar ao sair
window.addEventListener('beforeunload', stopCamera);
window.addEventListener('pagehide', stopCamera);
