// Inicia o scanner do Quagga
Quagga.init({
    inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#scanner-video'),
        constraints: {
            facingMode: "environment", // Câmera traseira
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    },
    decoder: {
        readers: [
            "ean_reader",        // EAN-13
            "ean_8_reader",      // EAN-8
            "upc_reader",        // UPC-A
            "upc_e_reader",      // UPC-E
            "code_128_reader",   // Code 128 (usado em alguns produtos)
            "code_39_reader"     // Code 39 (usado em alguns outros produtos)
        ]
    }
}, function(err) {
    if (err) {
        console.error(err);
        alert("Erro na inicialização do scanner.");
        return;
    }

    // Inicia o scanner quando a inicialização for bem-sucedida
    Quagga.start();
    console.log("Scanner iniciado com sucesso.");
});

// Callback quando um código de barras é detectado
Quagga.onDetected(function(result) {
    const code = result.codeResult.code;
    console.log("Código de barras detectado:", code);

    // Aqui você pode fazer a busca do produto na API com o código detectado.
    fetchProductInfo(code);
});

// Função para buscar informações do produto usando a API do Open Food Facts
async function fetchProductInfo(code) {
    // Exemplo de URL para API do Open Food Facts
    const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;

    // Exibe o overlay de carregamento enquanto faz a requisição
    document.getElementById("loading-overlay").style.display = "flex";

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Quando o produto é encontrado, exibe as informações
        if (data.product) {
            const product = data.product;
            document.getElementById('product-name').textContent = product.product_name || "Produto não encontrado";
            document.getElementById('bad-ingredients').textContent = product.ingredients_text || "Ingredientes não disponíveis";
            document.getElementById('healthy-alternatives').textContent = "Alternativas saudáveis ainda não implementadas.";

            // Esconde o scanner e mostra as informações
            document.getElementById("scanner-container").style.display = "none";
            document.getElementById("product-info").style.display = "block";
        } else {
            alert("Produto não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao buscar o produto:", error);
        alert("Erro ao obter informações do produto.");
    } finally {
        // Esconde o overlay de carregamento
        document.getElementById("loading-overlay").style.display = "none";
    }
}
