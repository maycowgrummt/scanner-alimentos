// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const scanAgainBtn = document.getElementById('scan-again');

// Função para iniciar o scanner
startBtn.addEventListener('click', async () => {
    try {
        // Acessar a câmera do dispositivo
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment", // Câmera traseira em dispositivos móveis
                width: { ideal: 1280 }
            }
        });

        video.srcObject = stream;
        scannerContainer.style.display = "block";
        startBtn.style.display = "none";

        // Configuração do Quagga para escanear o código de barras
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video,
                constraints: {
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: ["ean_reader", "upc_reader"]
            }
        }, function(err) {
            if (err) {
                console.log("Erro ao iniciar Quagga:", err);
                return;
            }
            Quagga.start();
        });

        // Quando o Quagga detectar um código de barras
        Quagga.onDetected(function(result) {
            const codigo = result.codeResult.code;
            mostrarProduto(codigo);
        });

    } catch (err) {
        alert("Erro ao acessar a câmera: " + err.message);
        console.error(err);
    }
});

// Função para buscar o produto na API Open Food Facts
async function mostrarProduto(codigo) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.status === 1) {  // Se o produto foi encontrado
            const produto = dados.product;
            productName.textContent = produto.product_name || "Nome não encontrado";
            badIngredients.textContent = "Ingredientes Nocivos: " + (produto.ingredients_text || "Não disponível");
            healthyAlternatives.textContent = "Alternativas Saudáveis: Considere substituir por produtos naturais.";

            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        } else {
            alert("Produto não encontrado na base de dados.");
        }
    } catch (erro) {
        console.error("Erro ao consultar a API:", erro);
        alert("Erro ao consultar produto.");
    }
}

// Reiniciar scanner
scanAgainBtn.addEventListener('click', () => {
    productInfo.style.display = "none";
    scannerContainer.style.display = "block";
});
