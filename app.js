document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('scanner-video');
    const productInfo = document.getElementById('product-info');
    const scanAgainBtn = document.getElementById('scan-again');

    // Verificar compatibilidade
    function checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Seu navegador não suporta acesso à câmera ou você não está em HTTPS');
            return false;
        }
        return true;
    }

    // Iniciar câmera automaticamente
    async function startCamera() {
        if (!checkCameraSupport()) return;

        try {
            // Configurações da câmera
            const constraints = {
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            // Acessar a câmera
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Configurar o elemento de vídeo
            video.srcObject = stream;
            video.playsInline = true;
            video.muted = true;
            
            // Esperar o vídeo estar pronto
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play()
                        .then(resolve)
                        .catch(err => {
                            console.error("Erro ao reproduzir vídeo:", err);
                            // Tentativa alternativa para iOS
                            video.play().then(resolve).catch(e => {
                                console.error("Falha na segunda tentativa:", e);
                                alert("Toque na tela para ativar a câmera");
                            });
                        });
                };
            });

            // Mostrar o vídeo
            video.style.display = 'block';
            console.log("Câmera iniciada automaticamente com sucesso!");

            // Iniciar o scanner de código de barras
            initBarcodeScanner();

        } catch (error) {
            console.error("Erro ao acessar a câmera:", error);
            handleCameraError(error);
        }
    }

    // Função para lidar com erros da câmera
    function handleCameraError(error) {
        let errorMsg = "Erro ao acessar a câmera automaticamente: ";
        
        switch(error.name) {
            case "NotAllowedError":
                errorMsg += "Permissão negada. Por favor, recarregue a página e permita o acesso à câmera.";
                break;
            case "NotFoundError":
                errorMsg += "Nenhuma câmera encontrada.";
                break;
            case "NotSupportedError":
                errorMsg += "Seu navegador não suporta esta funcionalidade.";
                break;
            case "NotReadableError":
                errorMsg += "A câmera está sendo usada por outro aplicativo.";
                break;
            default:
                errorMsg += error.message;
        }
        
        alert(errorMsg);
    }

    // Configurar o scanner de código de barras
    function initBarcodeScanner() {
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
                readers: ["ean_reader", "ean_8_reader", "upc_reader", "code_128_reader"]
            },
            locate: true
        }, function(err) {
            if (err) {
                console.error("Erro no scanner de código de barras:", err);
                alert("Erro no scanner de código de barras");
                return;
            }
            Quagga.start();
        });
        
        Quagga.onDetected(async (result) => {
            if (!result?.codeResult?.code) return;
            Quagga.stop();
            await fetchProductData(result.codeResult.code);
        });
    }

    // Buscar dados do produto
    async function fetchProductData(barcode) {
        try {
            const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Erro na API");
            
            const data = await response.json();
            
            if (data.status === 1) {
                const product = data.product;
                document.getElementById('product-name').textContent = product.product_name || "Produto não identificado";
                document.getElementById('bad-ingredients').textContent = product.ingredients_text || "Informação não disponível";
                document.getElementById('healthy-alternatives').textContent = "Prefira alimentos naturais e minimamente processados";
                
                productInfo.style.display = 'block';
                video.style.display = 'none';
            } else {
                alert("Produto não encontrado na base de dados");
                Quagga.start(); // Reiniciar o scanner
            }
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            alert("Erro ao consultar informações do produto");
            Quagga.start(); // Reiniciar o scanner
        }
    }

    // Função para escanear novamente
    scanAgainBtn.addEventListener('click', () => {
        productInfo.style.display = 'none';
        video.style.display = 'block';
        Quagga.start();
    });

    // Limpar ao sair
    window.addEventListener('beforeunload', () => {
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        if (Quagga) {
            Quagga.stop();
        }
    });

    // Iniciar automaticamente quando a página carrega
    startCamera();
});
