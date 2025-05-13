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
    // Exibe o overlay de carregamento enquanto faz a requisição
    document.getElementById("loading-overlay").style.display = "flex";

    // Verifique se o código não está vazio
    if (!code) {
        alert("Código de barras inválido ou não detectado.");
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

// Função para buscar o produto com base no código digitado
document.getElementById('search-product').addEventListener('click', function() {
    const barcode = document.getElementById('barcode-input').value.trim();

    // Adiciona log para depuração
    console.log("Código de barras digitado:", barcode);

    if (barcode) {
        fetchProductInfo(barcode);  // Busca o produto na API com o código fornecido
    } else {
        alert("Por favor, digite um código de barras.");
    }
});

// Inicia a câmera quando o botão é clicado
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');

async function startCamera() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Seu navegador não suporta acesso à câmera');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        video.srcObject = stream;
        
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(err => {
                    console.error("Erro ao reproduzir vídeo:", err);
                    video.play().then(resolve).catch(e => {
                        console.error("Falha na segunda tentativa:", e);
                        alert("Toque na tela para ativar a câmera");
                    });
                });
            };
        });

        video.style.display = 'block';
        startBtn.style.display = 'none';
        console.log("Câmera iniciada com sucesso!");

    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        alert(`Erro: ${error.message}`);
    }
}

startBtn.addEventListener('click', startCamera);

document.getElementById('scan-again').addEventListener('click', () => {
    document.getElementById("product-info").style.display = 'none';
    document.getElementById("scanner-container").style.display = 'block';
    startCamera();
});
