// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const scanAgainBtn = document.getElementById('scan-again');

// Sua chave da API da FoodData Central
const apiKey = 'zs4YT4kukrgO3PuHzad9MLtsz301uYiy95Z4kX0S';  // Substitua com sua chave API

// Função para iniciar a câmera
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: "environment",
                width: { ideal: 1280 }
            }
        });

        video.srcObject = stream;
        scannerContainer.style.display = "block";
        startBtn.style.display = "none";

        // Usando o QuaggaJS para ler o código de barras da câmera
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video
            },
            decoder: {
                readers: ["ean_reader", "upc_reader"]  // Configura para ler códigos EAN e UPC
            }
        }, function(err) {
            if (err) {
                console.log(err);
                return;
            }
            Quagga.start();
        });

        // Quando o Quagga lê o código, chama a função para mostrar o produto
        Quagga.onDetected(function(result) {
            const codigo = result.codeResult.code;
            mostrarProduto(codigo);
        });
        
    } catch (err) {
        let mensagem;
        if (err.name === "NotAllowedError") {
            mensagem = "Permissão da câmera negada. Ative nas configurações do navegador.";
        } else if (err.name === "NotFoundError") {
            mensagem = "Nenhuma câmera encontrada.";
        } else {
            mensagem = `Erro: ${err.message}`;
        }
        alert(mensagem);
        console.error(err);
    }
});

// Função para buscar informações sobre o produto na FoodData Central
async function mostrarProduto(codigo) {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${codigo}?api_key=${apiKey}`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados) {
            const produto = dados;
            productName.textContent = produto.foodName || "Produto desconhecido";
            badIngredients.textContent = produto.ingredients || "Sem informações sobre ingredientes.";
            healthyAlternatives.textContent = "Substitua por alimentos naturais e menos processados.";

            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        } else {
            alert("Produto não encontrado na base de dados da FoodData Central.");
        }
    } catch (erro) {
        console.error("Erro ao buscar produto:", erro);
        alert("Erro ao consultar produto.");
    }
}

// Reiniciar scanner
scanAgainBtn.addEventListener('click', () => {
    productInfo.style.display = "none";
    scannerContainer.style.display = "block";
});
