// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const scanAgainBtn = document.getElementById('scan-again');

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

// Função para buscar informações sobre o produto na Open Food Facts
async function mostrarProduto(codigo) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        if (dados.product) {
            const produto = dados.product;
            productName.textContent = produto.product_name || "Produto desconhecido";
            badIngredients.textContent = produto.ingredients_text || "Sem informações sobre ingredientes.";
            healthyAlternatives.textContent = "Substitua por alimentos naturais e menos processados.";
            
            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        } else {
            alert("Produto não encontrado com esse código de barras. Tentando buscar pelo nome...");
            buscarProdutoPorNome(codigo);  // Tenta buscar por nome caso não encontre pelo código
        }
    } catch (erro) {
        console.error("Erro ao buscar produto:", erro);
        alert("Erro ao consultar produto.");
    }
}

// Função para tentar buscar o produto pela API Open Food Facts usando nome
async function buscarProdutoPorNome(codigo) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${codigo}&search_simple=1&action=process&json=1`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.products && dados.products.length > 0) {
            const produto = dados.products[0];  // Pega o primeiro produto da lista
            productName.textContent = produto.product_name || "Produto desconhecido";
            badIngredients.textContent = produto.ingredients_text || "Sem informações sobre ingredientes.";
            healthyAlternatives.textContent = "Substitua por alimentos naturais e menos processados.";

            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        } else {
            alert("Produto não encontrado na base de dados da Open Food Facts.");
        }
    } catch (erro) {
        console.error("Erro ao buscar produto pelo nome:", erro);
        alert("Erro ao buscar produto.");
    }
}

// Reiniciar scanner
scanAgainBtn.addEventListener('click', () => {
    productInfo.style.display = "none";
    scannerContainer.style.display = "block";
});
