// Banco de dados de produtos (pode ser substituído pelo seu JSON depois)
const produtos = [
    { codigo: "7891000315507", nome: "Biscoito Recheado", ingredientes: "Corantes, gordura vegetal", alternativas: "Biscoito integral" },
    { codigo: "7896051116011", nome: "Refrigerante", ingredientes: "Açúcar, acidulante", alternativas: "Água com gás" }
];

// Elementos da página
const video = document.getElementById('scanner-video');
const startBtn = document.getElementById('start-scanner');
const productInfo = document.getElementById('product-info');

// Função para iniciar a câmera
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: "environment", // Câmera traseira
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = stream;
        video.play();
        startBtn.textContent = "Escaneando...";
        
        // Simula a leitura (você pode integrar um leitor real depois)
        video.onclick = () => {
            const codigoTeste = "7891000315507"; // Simula um código lido
            mostrarProduto(codigoTeste);
        };
        
    } catch (err) {
        alert("Erro ao acessar a câmera: " + err.message);
        console.error(err);
    }
});

// Função para mostrar o produto (substitua pela sua lógica real)
function mostrarProduto(codigo) {
    const produto = produtos.find(p => p.codigo === codigo);
    if (produto) {
        productInfo.innerHTML = `
            <h3>${produto.nome}</h3>
            <p><strong>Ingredientes nocivos:</strong> ${produto.ingredientes}</p>
            <p><strong>Alternativas:</strong> ${produto.alternativas}</p>
            <button onclick="window.location.reload()">Voltar</button>
        `;
        productInfo.style.display = "block";
    } else {
        alert("Produto não cadastrado!");
    }
}
