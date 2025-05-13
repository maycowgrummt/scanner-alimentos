// Banco de dados de exemplo
const produtos = [
    { codigo: "7891000315507", nome: "Biscoito Recheado", ingredientes: "Corante artificial", alternativas: "Biscoito integral" }
];

// Elementos da página
const video = document.getElementById('scanner-video');
const startBtn = document.getElementById('start-scanner');

// Função principal
startBtn.addEventListener('click', async () => {
    try {
        // 1. Solicita permissão da câmera
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: "environment", // Câmera traseira
                width: { ideal: 1280 }
            },
            audio: false
        });
        
        // 2. Mostra o vídeo na tela
        video.srcObject = stream;
        video.style.display = "block";
        startBtn.textContent = "Escaneando...";
        
        // 3. Configura o leitor de código (simulação)
        video.onclick = () => {
            const produto = produtos[0]; // Simula leitura
            document.getElementById('product-info').innerHTML = `
                <h3>${produto.nome}</h3>
                <p>Ingredientes: ${produto.ingredientes}</p>
                <p>Substitua por: ${produto.alternativas}</p>
            `;
        };
        
    } catch (err) {
        // Tratamento de erros detalhado
        let mensagem;
        if (err.name === "NotAllowedError") {
            mensagem = "Permissão da câmera negada!";
        } else if (err.name === "NotFoundError") {
            mensagem = "Nenhuma câmera encontrada.";
        } else {
            mensagem = `Erro desconhecido: ${err.message}`;
        }
        
        alert(mensagem);
        console.error("Erro completo:", err);
    }
});
