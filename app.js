// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const scanAgainBtn = document.getElementById('scan-again');

// Verificar compatibilidade do navegador
function checkBrowserCompatibility() {
    const isChrome = !!window.chrome;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isChrome && isMobile) {
        alert("Para melhor experiência, recomendamos usar o Chrome no mobile");
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Seu navegador não suporta acesso à câmera ou você não está em HTTPS");
        return false;
    }
    return true;
}

// Função para iniciar o scanner
async function startScanner() {
    if (!checkBrowserCompatibility()) return;
    
    try {
        // Feedback visual
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando câmera...';
        startBtn.disabled = true;
        
        // Configurações da câmera
        const constraints = {
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
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
                        video.play().catch(e => {
                            alert("Toque na tela para ativar a câmera");
                            console.error("Falha na segunda tentativa:", e);
                        });
                    });
            };
        });
        
        // Mostrar o vídeo
        video.style.display = "block";
        startBtn.style.display = "none";
        
        // Iniciar Quagga
        initQuagga();
        
    } catch (err) {
        handleCameraError(err);
    }
}

// Função para lidar com erros da câmera
function handleCameraError(err) {
    console.error("Erro na câmera:", err);
    
    let errorMsg = "Erro ao acessar a câmera: ";
    switch(err.name) {
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
            errorMsg += err.message;
    }
    
    alert(errorMsg);
    resetScanner();
}

// Configurar Quagga
function initQuagga() {
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
        await mostrarProduto(result.codeResult.code);
    });
}

// Reiniciar scanner
function resetScanner() {
    // Parar a câmera
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    // Parar Quagga
    if (Quagga) {
        Quagga.stop();
    }
    
    // Resetar UI
    video.style.display = "none";
    startBtn.style.display = "block";
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-camera"></i> Iniciar Scanner';
}

// Event listeners
startBtn.addEventListener('click', startScanner);
scanAgainBtn.addEventListener('click', resetScanner);

// Limpar ao sair
window.addEventListener('beforeunload', resetScanner);
window.addEventListener('pagehide', resetScanner);
