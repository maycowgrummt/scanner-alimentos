const statusEl = document.getElementById('camera-status');
const resultEl = document.getElementById('result');
const barcodeEl = document.getElementById('barcode');

// Função para iniciar QuaggaJS
function startScanner() {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    alert("Seu navegador não suporta acesso à câmera.");
    return;
  }

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner-video'),
      constraints: {
        facingMode: "environment" // câmera traseira
      }
    },
    decoder: {
      readers: ["ean_reader", "ean_13_reader", "upc_reader", "code_128_reader"]
    }
  }, function (err) {
    if (err) {
      console.error(err);
      alert("Erro ao iniciar o scanner.");
      return;
    }
    Quagga.start();
    statusEl.textContent = "Aponte a câmera para o código de barras.";
  });

  Quagga.onDetected(data => {
    const code = data.codeResult.code;
    if (code) {
      console.log("Código detectado:", code);
      Quagga.stop();
      document.getElementById("scanner-container").style.display = "none";
      resultEl.style.display = "block";
      barcodeEl.textContent = code;
      statusEl.textContent = "";
    }
  });
}

// Iniciar scanner automaticamente
window.addEventListener('load', startScanner);
