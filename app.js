// Função para buscar informações do produto usando a API do Open Food Facts
async function fetchProductInfo(code) {
    // Exibe o overlay de carregamento enquanto faz a requisição
    document.getElementById("loading-overlay").style.display = "flex";

    // Verifique se o código não está vazio
    if (!code) {
        alert("Código de barras inválido.");
        document.getElementById("loading-overlay").style.display = "none";
        return;
    }

    console.log("Buscando informações para o código:", code);
    
    // Exemplo de URL para API do Open Food Facts
    const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Quando o produto é encontrado, exibe as informações
        if (data.product) {
            const product = data.product;
            document.getElementById('product-name').textContent = product.product_name || "Produto não encontrado";
            document.getElementById('bad-ingredients').textContent = product.ingredients_text || "Ingredientes não disponíveis";
            document.getElementById('healthy-alternatives').textContent = "Alternativas saudáveis ainda não implementadas.";

            // Esconde o campo de digitação e mostra as informações
            document.getElementById("scanner-container").style.display = "none";
            document.getElementById("product-info").style.display = "block";
        } else {
            showError("Produto não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao buscar o produto:", error);
        showError("Erro ao obter informações do produto.");
    } finally {
        // Esconde o overlay de carregamento
        document.getElementById("loading-overlay").style.display = "none";
    }
}

// Exibe a mensagem de erro de forma controlada
function showError(message) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

// Esconde a mensagem de erro
document.getElementById('close-error').addEventListener('click', function() {
    document.getElementById("error-message").style.display = "none";
});

// Função para iniciar a câmera e o scanner
function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                const video = document.getElementById('scanner-video');
                video.srcObject = stream;

                Quagga.init({
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: video
                    },
                    decoder: {
                        readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"]
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    Quagga.start();
                });

                // Quando o código de barras é detectado
                Quagga.onDetected(function(result) {
                    const barcode = result.codeResult.code;
                    console.log("Código de barras detectado:", barcode);
                    fetchProductInfo(barcode); // Busca o produto
                });
            })
            .catch(function(err) {
                console.log("Erro ao acessar a câmera:", err);
            });
    }
}

// Event listener para o botão de iniciar scanner
document.getElementById("start-scanner").addEventListener('click', function() {
    startCamera();
    document.getElementById('scanner-container').style.display = 'none';
});

// Função para limpar e voltar ao início
document.getElementById('scan-again').addEventListener('click', function() {
    document.getElementById('product-info').style.display = 'none';
    document.getElementById('scanner-container').style.display = 'block';
    startCamera();
});

// Iniciar scanner automaticamente quando a página carregar
window.addEventListener('load', function() {
    startCamera();
});
