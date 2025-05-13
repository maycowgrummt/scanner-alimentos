const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');

const loadingOverlay = document.getElementById('loading-overlay');

// Ingredientes nocivos conhecidos
const badIngredientList = [
    "açúcar", "xarope de glicose", "corante", "gordura hidrogenada",
    "glutamato monossódico", "aspartame", "benzoato de sódio",
    "nitrato", "nitrito", "ciclamato", "sacarina"
];

// Alternativas saudáveis genéricas
const healthySuggestions = [
    "Alimentos naturais", "Frutas frescas", "Produtos sem aditivos",
    "Água saborizada", "Snacks integrais"
];

// Iniciar câmera
async function startCamera() {
    try {
        loadingOverlay.style.display = 'flex';

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } }
        });

        video.srcObject = stream;
        await new Promise(resolve => video.onloadedmetadata = () => video.play().then(resolve));

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
    Quagga.stop();
}

// Iniciar Quagga
function startBarcodeScanner() {
    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: video,
            constraints: { facingMode: "environment" }
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

    Quagga.offDetected(onBarcodeDetected);
    stopCamera();
    fetchProductFromAPI(code);
}

// Buscar produto na Open Food Facts
async function fetchProductFromAPI(code) {
    loadingOverlay.style.display = 'flex';

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        const data = await response.json();

        scannerContainer.style.display = 'none';

        if (!data.product) {
            productName.innerHTML = `Produto não encontrado na base de dados.`;
            badIngredients.innerHTML = '';
            healthyAlternatives.innerHTML = '';
        } else {
            const name = data.product.product_name || "Produto sem nome";
            const ingredients = (data.product.ingredients_text || "").toLowerCase();

            // Verifica ingredientes nocivos
            const badFound = badIngredientList.filter(item => ingredients.includes(item));

            productName.innerHTML = `<strong>${name}</strong>`;
            badIngredients.innerHTML = badFound.length
                ? `<strong>Ingredientes Nocivos:</strong> ${badFound.join(', ')}`
                : `Nenhum ingrediente nocivo detectado.`;

            healthyAlternatives.innerHTML = badFound.length
                ? `<strong>Alternativas Saudáveis:</strong> ${healthySuggestions.join(', ')}`
                : '';
        }

        productInfo.style.display = 'block';
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar dados do produto: " + err.message);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Reescanear
document.getElementById('scan-again').addEventListener('click', () => {
    productInfo.style.display = 'none';
    scannerContainer.style.display = 'block';
    startCamera();
});

startBtn.addEventListener('click', startCamera);
window.addEventListener('beforeunload', stopCamera);
