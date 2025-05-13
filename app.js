document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-scanner');
    const video = document.getElementById('scanner-video');
    const productInfo = document.getElementById('product-info');
    const scanAgainBtn = document.getElementById('scan-again');

    // Verificar compatibilidade
    function checkCompatibility() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Seu navegador não suporta acesso à câmera ou você não está em HTTPS');
            return false;
        }
        return true;
    }

    // Iniciar câmera
    async function startCamera() {
        if (!checkCompatibility()) return;

        try {
            startBtn.disabled = true;
            startBtn.textContent = 'Acessando câmera...';

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            video.srcObject = stream;
            video.playsInline = true;
            video.muted = true;

            // Esperar o vídeo estar pronto
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play()
                        .then(resolve)
                        .catch(e => {
                            console.error('Erro ao reproduzir:', e);
                            // Tentativa alternativa para iOS
                            video.play().then(resolve).catch(e2 => {
                                console.error('Falha na segunda tentativa:', e2);
                                alert('Toque na tela para ativar a câmera');
                            });
                        });
                };
            });

            video.style.display = 'block';
            startBtn.style.display = 'none';
            console.log('Câmera iniciada com sucesso!');

        } catch (error) {
            console.error('Erro na câmera:', error);
            handleCameraError(error);
            startBtn.disabled = false;
            startBtn.textContent = 'Iniciar Scanner';
        }
    }

    // Tratar erros
    function handleCameraError(error) {
        let message = 'Erro ao acessar a câmera: ';
        
        switch(error.name) {
            case 'NotAllowedError':
                message += 'Permissão negada. Ative nas configurações do navegador.';
                break;
            case 'NotFoundError':
                message += 'Nenhuma câmera encontrada.';
                break;
            case 'NotReadableError':
                message += 'Câmera já em uso por outro aplicativo.';
                break;
            default:
                message += error.message;
        }
        
        alert(message);
    }

    // Parar câmera
    function stopCamera() {
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        video.style.display = 'none';
        startBtn.style.display = 'block';
        startBtn.disabled = false;
        startBtn.textContent = 'Iniciar Scanner';
    }

    // Event listeners
    startBtn.addEventListener('click', startCamera);
    scanAgainBtn.addEventListener('click', () => {
        productInfo.style.display = 'none';
        startCamera();
    });

    // Limpar ao sair
    window.addEventListener('beforeunload', stopCamera);
});
