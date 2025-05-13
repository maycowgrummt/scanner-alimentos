document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('scanner-video');
    const productInfo = document.getElementById('product-info');
    const scanAgainBtn = document.getElementById('scan-again');
    const statusMessage = document.querySelector('.status-message');

    // Iniciar câmera automaticamente
    async function initCamera() {
        try {
            statusMessage.textContent = "Iniciando câmera...";
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 640 },  // Resolução menor para melhor performance
                    height: { ideal: 480 }
                }
            });

            video.srcObject = stream;
            
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play().then(resolve).catch(e => {
                        console.error("Erro ao reproduzir:", e);
                        video.play().then(resolve); // Tentativa alternativa
                    });
                };
            });

            statusMessage.textContent = "Posicione o código de barras na área destacada";
            initBarcodeScanner();

        } catch (error) {
            console.error("Erro na câmera:", error);
            statusMessage.textContent = "Erro ao acessar a câmera. Recarregue a página e permita o acesso.";
        }
    }

    // Iniciar scanner de código de barras
    function initBarcodeScanner() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video,
                constraints: {
                    facingMode: "environment",
                    width: 300,  // Largura reduzida para o scanner
                    height: 225
                }
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader"]
            },
            locate: true,
            frequency: 10
        }, function(err) {
            if (err) {
                console.error("Erro no scanner:", err);
                statusMessage.textContent = "Erro no scanner. Recarregue a página.";
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected(async (result) => {
            if (!result?.codeResult?.code) return;
            
            Quagga.stop();
            statusMessage.textContent = "Produto detectado! Analisando...";
            
            await fetchProductData(result.codeResult.code);
        });
    }

    // Buscar dados do produto
    async function fetchProductData(barcode) {
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await response.json();
            
            if (data.status === 1) {
                displayProductInfo(data.product);
            } else {
                statusMessage.textContent = "Produto não encontrado. Tente outro código.";
                Quagga.start();
            }
        } catch (error) {
            console.error("Erro na API:", error);
            statusMessage.textContent = "Erro ao buscar informações. Tente novamente.";
            Quagga.start();
        }
    }

    // Exibir informações do produto
    function displayProductInfo(product) {
        document.getElementById('product-name').textContent = 
            product.product_name || "Produto não identificado";
        
        document.getElementById('bad-ingredients').textContent = 
            product.ingredients_text || "Informação não disponível";
        
        document.getElementById('healthy-alternatives').textContent = 
            "Prefira versões integrais ou naturais deste produto";
        
        productInfo.style.display = 'block';
        statusMessage.textContent = "Produto analisado com sucesso!";
    }

    // Reescaneamento
    scanAgainBtn.addEventListener('click', () => {
        productInfo.style.display = 'none';
        statusMessage.textContent = "Posicione o código de barras na área destacada";
        Quagga.start();
    });

    // Limpeza ao sair
    window.addEventListener('beforeunload', () => {
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        if (Quagga) {
            Quagga.stop();
        }
    });

    // Iniciar automaticamente
    initCamera();
});
