// Banco de dados de exemplo
const produtos = [
    {
        codigo: "7891000315507",
        nome: "Biscoito Recheado Chocolate",
        ingredientes_nocivos: "Açúcar, gordura vegetal hidrogenada, corante artificial",
        alternativas: "Biscoito integral sem recheio, frutas desidratadas"
    },
    {
        codigo: "7896051116011",
        nome: "Refrigerante de Cola",
        ingredientes_nocivos: "Açúcar, acidulante ácido fosfórico, corante caramelo IV",
        alternativas: "Água com gás e limão, chá gelado natural"
    }
];

// Elementos da página
const startBtn = document.getElementById('start-scanner');
const video = document.getElementById('scanner-video');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const scanAgainBtn = document.getElementById('scan-again');

// Função para iniciar a câmera
startBtn.addEventListener('click', async () => {
    try {
        // Solicita acesso à câmera
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: "environment", // Prioriza câmera traseira
                width: { ideal: 1280 }
            }
        });
        
        // Configura o vídeo
        video.srcObject = stream;
        scannerContainer.style.display = "block";
        startBtn.style.display = "none";
        
        // Simulação de leitura (para teste)
        video.onclick = () => {
            const codigoTeste = "7891000315507"; // Simula um código lido
            mostrarProduto(codigoTeste);
        };
        
    } catch (err) {
        // Tratamento de erros
        let mensagem;
        if (err.name === "NotAllowedError") {
            mensagem = "Permissão da câmera negada. Por favor, permita o acesso nas configurações do navegador.";
        } else if (err.name === "NotFoundError") {
            mensagem = "Nenhuma câmera encontrada.";
        } else {
            mensagem = `Erro: ${err.message}`;
        }
        
        alert(mensagem);
        console.error("Erro detalhado:", err);
    }
});

// Função para mostrar informações do produto
function mostrarProduto(codigo) {
    const produto = produtos.find(p => p.codigo === codigo);
    
    if (produto) {
        productName.textContent = produto.nome;
        badIngredients.textContent = produto.ingredientes_nocivos;
        healthyAlternatives.textContent = produto.alternativas;
        
        scannerContainer.style.display = "none";
        productInfo.style.display = "block";
    } else {
        alert("Produto não cadastrado. Adicione manualmente ou tente outro.");
    }
}

// Botão "Escanear Novamente"
scanAgainBtn.addEventListener('click', () => {
    productInfo.style.display = "none";
    scannerContainer.style.display = "block";
});
