// Banco de dados de produtos (para testes locais)
const produtos = [
    {
        codigo: "7891000315507", // Coca-Cola Zero (Exemplo)
        nome: "Coca-Cola Zero",
        ingredientes_nocivos: "Ácido fosfórico, adoçante (aspartame), corante caramelo IV, cafeína.",
        alternativas: "Água com gás, chá gelado sem açúcar"
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

// Iniciar câmera
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: "environment",
                width: { ideal: 1280 }
            }
        });
        
        video.srcObject = stream;
        scannerContainer.style.display = "block";
        startBtn.style.display = "none";
        
        // Simulação de leitura de código de barras
        video.onclick = () => {
            const codigoTeste = "7891000315507"; // Código de teste (Coca-Cola Zero)
            buscarProdutoNaAPI(codigoTeste);
        };
        
    } catch (err) {
        let mensagem;
        if (err.name === "NotAllowedError") {
            mensagem = "Permissão da câmera negada. Ative nas configurações do navegador.";
        } else if (err.name === "NotFoundError") {
            mensagem = "Nenhuma câmera encontrada.";
        } else {
            mensagem = `Erro: ${err.message}`;
        }
        alert(mensagem);
        console.error(err);
    }
});

// Buscar produto na Open Food Facts API
async function buscarProdutoNaAPI(codigo) {
    const url = `https://world.openfoodfacts.org/api/v2/product/${codigo}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.status === 1) {
            const produto = dados.product;

            if (!produto) {
                alert("Produto não encontrado na base de dados.");
                mostrarProduto(null);
                return;
            }

            mostrarProduto({
                nome: produto.product_name || "Nome não encontrado",
                ingredientes_nocivos: produto.ingredients_text || "Sem informações sobre ingredientes",
                alternativas: "Busque alternativas mais naturais"
            });
        } else {
            alert("Produto não encontrado. Tente escanear outro código.");
            mostrarProduto(null);
        }
    } catch (erro) {
        console.error("Erro ao buscar produto na API:", erro);
        alert("Erro ao buscar informações do produto.");
        mostrarProduto(null);
    }
}

// Mostrar informações do produto
function mostrarProduto(produto) {
    if (produto) {
        productName.textContent = produto.nome;
        badIngredients.textContent = produto.ingredientes_nocivos;
        healthyAlternatives.textContent = produto.alternativas;

        scannerContainer.style.display = "none";
        productInfo.style.display = "block";
    } else {
        alert("Produto não encontrado. Tente escanear outro código.");
        productInfo.style.display = "none";
        startBtn.style.display = "block";
    }
}

// Reiniciar scanner
scanAgainBtn.addEventListener('click', () => {
    productInfo.style.display = "none";
    scannerContainer.style.display = "block";
    startBtn.style.display = "none";
});
