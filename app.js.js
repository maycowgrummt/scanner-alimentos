document.getElementById('start-scanner').addEventListener('click', function() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-video'),
            constraints: {
                facingMode: "environment" // Usa a câmera traseira
            }
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader"] // Tipos de códigos de barras
        }
    }, function(err) {
        if (err) {
            alert("Erro ao iniciar a câmera: " + err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const barcode = result.codeResult.code;
        checkProduct(barcode);
    });
});

function checkProduct(barcode) {
    fetch('database.json')
        .then(response => response.json())
        .then(data => {
            const product = data.find(item => item.codigo === barcode);
            
            if (product) {
                document.getElementById('product-name').textContent = product.nome;
                document.getElementById('bad-ingredients').textContent = product.ingredientes_nocivos;
                document.getElementById('healthy-alternatives').textContent = product.alternativas;
                
                document.getElementById('scanner-container').style.display = 'none';
                document.getElementById('product-info').style.display = 'block';
            } else {
                alert("Produto não cadastrado. Tente outro ou adicione manualmente.");
                Quagga.stop();
            }
        });
}

function resetScanner() {
    document.getElementById('scanner-container').style.display = 'block';
    document.getElementById('product-info').style.display = 'none';
    Quagga.stop();
}