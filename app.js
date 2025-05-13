// Função para iniciar a câmera
async function startCamera() {
  const video = document.getElementById('scanner-video');
  const cameraStatus = document.getElementById('camera-status');

  try {
    // 1. Verificar se o navegador suporta a API de mídia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Seu navegador não suporta acesso à câmera');
    }

    // 2. Solicitar acesso à câmera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',  // Usar câmera traseira
        width: { ideal: 1280 },
        height: { ideal: 720 },
      }
    });

    // 3. Conectar o stream ao elemento de vídeo
    video.srcObject = stream;

    // 4. Esperar o vídeo estar pronto
    video.onloadedmetadata = () => {
      video.play()
        .then(() => {
          cameraStatus.textContent = "Câmera ativada!";
          cameraStatus.style.backgroundColor = "#2ecc71";  // Verde
        })
        .catch(err => {
          cameraStatus.textContent = "Erro ao iniciar a câmera!";
          cameraStatus.style.backgroundColor = "#e74c3c";  // Vermelho
          console.error("Erro ao reproduzir vídeo:", err);
          alert("Erro ao iniciar a câmera.");
        });
    };

    // Exibir a câmera assim que ativada
    video.style.display = 'block';
    cameraStatus.style.display = 'block';

  } catch (error) {
    cameraStatus.textContent = "Erro ao acessar a câmera!";
    cameraStatus.style.backgroundColor = "#e74c3c";  // Vermelho
    console.error("Erro ao acessar a câmera:", error);
    alert(`Erro: ${error.message}`);
  }
}

// Iniciar a câmera assim que a página for carregada
window.onload = () => {
  startCamera();
};
