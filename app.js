const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const loadingOverlay = document.getElementById('loading-overlay');
const historyContainer = document.getElementById('history');

const badIngredientList = [
    "açúcar", "xarope de glicose", "corante", "gordura hidrogenada",
    "glutamato monossódico", "aspartame", "benzoato de sódio",
    "nitrato", "nitrito", "ciclamato", "sacarina"
];

const healthySuggestions = [
    "Alimentos naturais", "Frutas frescas", "Produtos sem aditivos",
    "Água saborizada", "Snacks integrais"
];

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

function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
    startBtn.style.display = 'inline-flex';
    Quagga.stop();
}

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

function onBarcodeDetected(result) {
    const code = result.codeResult.code;
    console.log("Código detectado:", code);

    Quagga.offDetected(onBarcodeDetected);
    stopCamera();
    fetchProductFromAPI(code);
}

async function fetchProductFromAPI(code) {
    loadingOverlay.style.display = 'flex';

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        const data = await response.json();

        scannerContainer.style.display = 'none';

        if (!data.product) {
            productName.innerHTML = `Produto não encontrado.`;
            badIngredients.innerHTML = '';
            healthyAlternatives.innerHTML = '';
        } else {
            const name = data.product.product_name || "Produto sem nome";
            const ingredients = (data.product.ingredients_text || "").toLowerCase();
            const badFound = badIngredientList.filter(item => ingredients.includes(item));

            const color = getRiskColor(badFound.length);

            productName.innerHTML = `<strong>${name}</strong>`;
            productInfo.style.borderLeft = `8px solid ${color}`;
            badIngredients.innerHTML = badFound.length
                ? `<strong>Ingredientes Nocivos:</strong> ${badFound.join(', ')}`
                : `Nenhum ingrediente nocivo detectado.`;

            healthyAlternatives.innerHTML = badFound.length
                ? `<strong>Alternativas Saudáveis:</strong> ${healthySuggestions.join(', ')}`
                : '';

            // Salvar no histórico
            saveToHistory({
                name,
                badCount: badFound.length,
                date: new Date().toLocaleString(),
                color
            });
        }

        productInfo.style.display = 'block';
        renderHistory();
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar dados do produto.");
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

function getRiskColor(count) {
    if (count === 0) return "#00c853"; // verde
    if (count <= 2) return "#ffca28";  // amarelo
    return "#e53935";                 // vermelho
}

function saveToHistory(entry) {
    const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
    history.unshift(entry);
    localStorage.setItem('scanHistory', JSON.stringify(history.slice(0, 10)));
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
    historyContainer.innerHTML = '<h3>🕘 Histórico de Escaneamentos</h3>' +
        history.map(item => `
            <div class="history-item" style="border-left: 6px solid ${item.color};">
                <strong>${item.name}</strong><br>
                Risco: ${item.badCount} ingrediente(s) nocivo(s)<br>
                <small>${item.date}</small>
            </div>
        `).join('');
}

document.getElementById('scan-again').addEventListener('click', () => {
    productInfo.style.display = 'none';
    scannerContainer.style.display = 'block';
    startCamera();
});

startBtn.addEventListener('click', startCamera);
window.addEventListener('beforeunload', stopCamera);

renderHistory();
