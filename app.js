// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');

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
                facingMode: "environment",  // Usar a câmera traseira
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // 3. Conectar o stream ao elemento de vídeo
        video.srcObject = stream;

        // 4. Esperar o vídeo estar pronto
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.play()
                    .then(resolve)
                    .catch((err) => {
                        console.error('Erro ao iniciar o vídeo:', err);
                        reject('Erro ao iniciar o vídeo');
                    });
            };
        });

        // 5. Mostrar feedback visual
        video.style.display = 'block'; // Mostrar o vídeo
        startBtn.style.display = 'none'; // Ocultar o botão
        scannerContainer.style.display = 'block'; // Exibir o container da câmera
        console.log("Câmera iniciada com sucesso!");
    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        alert(`Erro ao acessar a câmera: ${error.message}`);
    }
}

// Event listener para o botão "Iniciar Scanner"
startBtn.addEventListener('click', startCamera);

// Função para parar a câmera
function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
    startBtn.style.display = 'block';
}

// Event listener para o botão "Escanear Novamente"
document.getElementById('scan-again').addEventListener('click', () => {
    productInfo.style.display = 'none';
    scannerContainer.style.display = 'block';
    startCamera();
});

// Limpar ao sair
window.addEventListener('beforeunload', stopCamera);

// Função para ler o código de barras (com Quagga)
function readBarcode() {
    Quagga.decodeSingle({
        src: video,
        numOfWorkers: 4,
        decoder: {
            readers: ["ean_reader"]
        }
    }, function (result) {
        if (result && result.codeResult) {
            console.log("Código de barras detectado:", result.codeResult.code);
            fetchProductData(result.codeResult.code);
        } else {
            console.log("Código não detectado ou inválido.");
        }
    });
}

// Função para buscar os dados do produto via Open Food Facts
function fetchProductData(barcode) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === 1) {
                const product = data.product;
                document.getElementById('product-name').innerText = product.product_name || "Produto sem nome";
                document.getElementById('bad-ingredients').innerText = product.ingredients_text || "Ingredientes não disponíveis";
                document.getElementById('healthy-alternatives').innerText = product.nutriments || "Informações nutricionais não disponíveis";
                productInfo.style.display = 'block';
                scannerContainer.style.display = 'none';
            } else {
                alert("Produto não encontrado");
            }
        })
        .catch(error => {
            console.error('Erro ao buscar produto:', error);
            alert("Erro ao carregar as informações do produto.");
        });
}
