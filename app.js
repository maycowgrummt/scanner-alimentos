const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const loadingOverlay = document.getElementById('loading-overlay');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');

// Simulação de banco de dados
const productDatabase = {
    "7891000055123": {
        name: "Refrigerante Cola",
        badIngredients: ["Açúcar", "Corante Caramelo IV", "Cafeína"],
        healthyAlternatives: ["Água com gás e limão", "Chá natural", "Suco sem açúcar"]
    },
    "7891910000197": {
        name: "Biscoito Recheado",
        badIngredients: ["Gordura hidrogenada", "Aromatizantes artificiais"],
        healthyAlternatives: ["Biscoito integral", "Frutas secas"]
    }
};

// Iniciar câmera
async function startCamera() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Seu navegador não suporta acesso à câmera');
        }

        loadingOverlay.style.display = 'flex';

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' }
            }
        });

        video.srcObject = stream;
        await new Promise(resolve => {
            video.onloadedmetadata = () => video.play().then(resolve);
        });

        video.style.display = 'block';
        startBtn.style.display = 'none';
        loadingOverlay.style.display = 'none';

        startBarcodeScanner();

    } catch (err) {
        console.error(err);
        alert("Erro ao acessar a câmera: " + err.message);
        loadingOverlay.style.display = 'none';
    }
}

// Parar câmera
function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
    startBtn.style.display = 'inline-flex';
    loadingOverlay.style.display = 'none';
    Quagga.stop();
}

// Função de escaneamento com Quagga
function startBarcodeScanner() {
    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: video,
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["ean_reader", "ean_13_reader", "upc_reader"]
        }
    }, (err) => {
        if (err) {
            console.error(err);
            alert("Erro ao iniciar scanner: " + err.message);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(onBarcodeDetected);
}

// Quando código for detectado
function onBarcodeDetected(result) {
    const code = result.codeResult.code;
    console.log("Código detectado:", code);

    Quagga.offDetected(onBarcodeDetected); // evitar múltiplas detecções
    stopCamera();

    showProductInfo(code);
}

// Exibir dados do produto
function showProductInfo(code) {
    const product = productDatabase[code];
    scannerContainer.style.display = 'none';

    if (product) {
        productName.innerHTML = `<strong>Nome do Produto:</strong> ${product.name}`;
        badIngredients.innerHTML = `<strong>Ingredientes Nocivos:</strong> ${product.badIngredients.join(", ")}`;
        healthyAlternatives.innerHTML = `<strong>Alternativas Saudáveis:</strong> ${product.healthyAlternatives.join(", ")}`;
    } else {
        productName.innerHTML = `Produto não encontrado.`;
        badIngredients.innerHTML = ``;
        healthyAlternatives.innerHTML = ``;
    }

    productInfo.style.display = 'block';
}

// Reescanear
document.getElementById('scan-again').addEventListener('click', () => {
    productInfo.style.display = 'none';
    scannerContainer.style.display = 'block';
    startCamera();
});

startBtn.addEventListener('click', startCamera);
window.addEventListener('beforeunload', stopCamera);
