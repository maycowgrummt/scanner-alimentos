// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');

// Função para verificar suporte à câmera
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Função para iniciar a câmera
async function startCamera() {
    if (!hasGetUserMedia()) {
        alert('Seu navegador não suporta acesso à câmera');
        return;
    }

    try {
        // Feedback visual
        startBtn.disabled = true;
        startBtn.textContent = 'Conectando à câmera...';

        // Configurações da câmera
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Obter stream da câmera
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // DEBUG: Verificar se o stream foi obtido
        console.log('Stream obtido:', stream);
        console.log('Tracks ativas:', stream.getVideoTracks());

        // Conectar o stream ao elemento de vídeo
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;

        // DEBUG: Verificar propriedades do vídeo
        video.onloadedmetadata = () => {
            console.log('Metadados do vídeo carregados:', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState
            });
        };

        // Tentar reproduzir o vídeo
        try {
            await video.play();
            console.log('Vídeo está reproduzindo');
        } catch (playError) {
            console.error('Erro ao reproduzir vídeo:', playError);
            // Tentativa alternativa para iOS/Safari
            video.play().catch(e => {
                console.error('Segunda tentativa falhou:', e);
            });
        }

        // Mostrar o vídeo
        video.style.display = 'block';
        startBtn.style.display = 'none';
        
        // DEBUG: Verificar se o vídeo está visível
        console.log('Estilo do vídeo:', {
            display: video.style.display,
            visibility: window.getComputedStyle(video).visibility
        });

    } catch (error) {
        console.error('Erro ao acessar câmera:', error);
        alert(`Erro: ${error.message}`);
        resetScanner();
    }
}

// Função para resetar o scanner
function resetScanner() {
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
document.getElementById('scan-again').addEventListener('click', () => {
    document.getElementById('product-info').style.display = 'none';
    startCamera();
});

// Limpar ao sair
window.addEventListener('beforeunload', resetScanner);
