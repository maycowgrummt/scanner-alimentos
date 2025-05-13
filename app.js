const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const loadingOverlay = document.getElementById('loading-overlay');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');

async function startCamera() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Seu navegador não suporta acesso à câmera');
        }

        loadingOverlay.style.display = 'flex';

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(err => {
                    console.error("Erro ao reproduzir vídeo:", err);
                    alert("Toque na tela para ativar a câmera.");
                });
            };
        });

        video.style.display = 'block';
        startBtn.style.display = 'none';
        loadingOverlay.style.display = 'none';

        console.log("Câmera iniciada com sucesso!");

        // Aqui você pode iniciar o Quagga, se quiser
        // initQuagga();

    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        alert(`Erro: ${error.message}`);
        loadingOverlay.style.display = 'none';
    }
}

function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
    startBtn.style.display = 'inline-flex';
    loadingOverlay.style.display = 'none';
}

startBtn.addEventListener('click', startCamera);

document.getElementById('scan-again').addEventListener('click', () => {
    productInfo.style.display = 'none';
    scannerContainer.style.display = 'block';
    startCamera();
});

window.addEventListener('beforeunload', stopCamera);

// Debug opcional
setInterval(() => {
    console.log("Status do vídeo:", {
        readyState: video.readyState,
        paused: video.paused,
        srcObject: !!video.srcObject
    });
}, 3000);
