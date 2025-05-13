const video = document.getElementById('scanner-video');
const statusEl = document.getElementById('camera-status');

async function startCamera() {
  try {
    // Solicitar acesso à câmera traseira
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" } // Traseira
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    statusEl.textContent = 'Câmera ativa. Aponte para o código de barras.';
    console.log('Câmera iniciada com sucesso.');
  } catch (err) {
    console.error('Erro ao acessar a câmera:', err);
    statusEl.textContent = 'Erro ao acessar a câmera. Verifique as permissões.';
    alert('Erro ao acessar a câmera. Permita o acesso no navegador.');
  }
}

// Iniciar câmera automaticamente
window.addEventListener('load', startCamera);
