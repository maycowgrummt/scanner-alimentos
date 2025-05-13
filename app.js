// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const scanAgainBtn = document.getElementById('scan-again');

// Estado do scanner
let scannerActive = false;
let quaggaInitialized = false;

// Função para iniciar o scanner
startBtn.addEventListener('click', async () => {
    if (scannerActive) return;
    
    try {
        // Mostrar estado de carregamento
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando Câmera...';
        startBtn.disabled = true;
        
        // Acessar a câmera do dispositivo
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1280 }
            },
            audio: false
        });

        video.srcObject = stream;
        video.style.display = "block";
        startBtn.style.display = "none";
        scannerActive = true;
        
        // Configuração do Quagga para escanear o código de barras
        if (!quaggaInitialized) {
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: video,
                    constraints: {
                        facingMode: "environment",
                        width: { ideal: 1280 }
                    }
                },
                decoder: {
                    readers: ["ean_reader", "ean_8_reader", "upc_reader", "code_128_reader"],
                    debug: {
                        drawBoundingBox: true,
                        showFrequency: false,
                        drawScanline: true,
                        showPattern: false
                    }
                },
                locate: true,
                frequency: 10
            }, function(err) {
                if (err) {
                    console.error("Erro ao iniciar Quagga:", err);
                    showError("Não foi possível iniciar o scanner. Tente novamente.");
                    resetScanner();
                    return;
                }
                quaggaInitialized = true;
                Quagga.start();
            });
        } else {
            Quagga.start();
        }

        // Quando o Quagga detectar um código de barras
        Quagga.onDetected(async (result) => {
            if (!result || !result.codeResult) return;
            
            const codigo = result.codeResult.code;
            console.log("Código detectado:", codigo);
            
            // Parar temporariamente o scanner
            Quagga.stop();
            
            // Mostrar feedback visual
            const canvas = Quagga.canvas.dom.overlay;
            canvas.style.display = "block";
            
            // Buscar informações do produto
            await mostrarProduto(codigo);
            
            // Esconder o canvas de overlay
            canvas.style.display = "none";
        });

    } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        let errorMsg = "Erro ao acessar a câmera.";
        
        if (err.name === "NotAllowedError") {
            errorMsg = "Permissão da câmera negada. Por favor, permita o acesso à câmera nas configurações do seu navegador.";
        } else if (err.name === "NotFoundError") {
            errorMsg = "Nenhuma câmera encontrada.";
        } else if (err.name === "NotSupportedError") {
            errorMsg = "Seu navegador não suporta esta funcionalidade.";
        }
        
        showError(errorMsg);
        resetScanner();
    }
});

// Função para mostrar mensagem de erro
function showError(message) {
    productInfo.style.display = "block";
    productName.textContent = "Erro";
    badIngredients.textContent = message;
    healthyAlternatives.textContent = "Por favor, tente novamente ou escaneie manualmente.";
    
    const scanAgainBtn = document.getElementById('scan-again');
    scanAgainBtn.style.display = "block";
}

// Função para buscar o produto na API Open Food Facts
async function mostrarProduto(codigo) {
    try {
        // Mostrar estado de carregamento
        productInfo.style.display = "block";
        productName.textContent = "Buscando informações...";
        badIngredients.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando ingredientes...';
        healthyAlternatives.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando alternativas...';
        
        const url = `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`;
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            throw new Error("Erro ao consultar a API");
        }
        
        const dados = await resposta.json();
        
        if (dados.status === 1) {  // Se o produto foi encontrado
            const produto = dados.product;
            
            // Exibir informações do produto
            productName.textContent = produto.product_name || "Produto não identificado";
            
            // Analisar ingredientes nocivos
            const ingredientesText = produto.ingredients_text || "Informação não disponível";
            badIngredients.textContent = analisarIngredientes(ingredientesText);
            
            // Sugerir alternativas saudáveis
            healthyAlternatives.textContent = sugerirAlternativas(produto.categories);
            
            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        } else {
            showError("Produto não encontrado na nossa base de dados.");
        }
    } catch (erro) {
        console.error("Erro ao consultar a API:", erro);
        showError("Erro ao buscar informações do produto. Tente novamente.");
    }
}

// Função para analisar ingredientes (simplificada)
function analisarIngredientes(texto) {
    if (!texto) return "Informação não disponível";
    
    const ingredientesNocivos = [
        "gordura vegetal hidrogenada", "açúcar", "xarope de milho", "glutamato monossódico",
        "corante artificial", "conservante", "adoçante artificial", "aromatizante artificial"
    ];
    
    const encontrados = ingredientesNocivos.filter(ing => 
        texto.toLowerCase().includes(ing)
        .map(ing => ing.charAt(0).toUpperCase() + ing.slice(1));
    
    if (encontrados.length > 0) {
        return "Contém: " + encontrados.join(", ");
    }
    
    return "Nenhum ingrediente nocivo identificado (análise preliminar)";
}

// Função para sugerir alternativas (simplificada)
function sugerirAlternativas(categorias) {
    if (!categorias) return "Prefira alimentos naturais e minimamente processados.";
    
    const sugestoes = {
        "biscuits": "Experimente biscoitos integrais ou frutas secas",
        "sodas": "Prefira água, água com gás ou sucos naturais",
        "snacks": "Substitua por castanhas ou frutas frescas",
        "instant noodles": "Prefira macarrão integral com vegetais"
    };
    
    for (const [key, value] of Object.entries(sugestoes)) {
        if (categorias.toLowerCase().includes(key)) {
            return value;
        }
    }
    
    return "Prefira versões integrais ou caseiras deste produto.";
}

// Reiniciar scanner
scanAgainBtn.addEventListener('click', () => {
    productInfo.style.display = "none";
    scannerContainer.style.display = "flex";
    startBtn.style.display = "block";
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-camera"></i> Iniciar Scanner';
    
    if (scannerActive) {
        Quagga.stop();
        scannerActive = false;
    }
    
    // Limpar o stream de vídeo
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        video.style.display = "none";
    }
});

// Função para resetar o scanner
function resetScanner() {
    startBtn.innerHTML = '<i class="fas fa-camera"></i> Iniciar Scanner';
    startBtn.disabled = false;
    scannerActive = false;
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        video.style.display = "none";
    }
    
    if (quaggaInitialized) {
        Quagga.stop();
    }
}

// Gerenciar a câmera quando a página for fechada
window.addEventListener('beforeunload', () => {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    if (quaggaInitialized) {
        Quagga.stop();
    }
});
