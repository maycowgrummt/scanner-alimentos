// Função para exibir a imagem do produto com verificação de URL
function exibirImagemProduto(urlImagem) {
  if (urlImagem) {
    // Verificar se a URL é válida
    const img = new Image();
    img.onload = function() {
      productPhoto.src = urlImagem;
    };
    img.onerror = function() {
      // Se a imagem não carregar corretamente, exiba uma imagem padrão
      productPhoto.src = 'https://via.placeholder.com/150';
    };
    img.src = urlImagem;
  } else {
    // Se não houver URL de imagem, exiba uma imagem padrão
    productPhoto.src = 'https://via.placeholder.com/150';
  }
}

// Função para buscar informações do produto usando o Open Food Facts
function buscarProdutoNaAPI(codigoDeBarras) {
  const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${codigoDeBarras}.json`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.status === 1) {
        const produto = data.product;

        // Exibir o nome do produto
        productName.textContent = produto.product_name || 'Nome não encontrado';

        // Exibir a imagem do produto (usando a função exibirImagemProduto)
        exibirImagemProduto(produto.image_url);

        // Exibir ingredientes nocivos
        mostrarIngredientesNocivos(produto.ingredients_text || '');

        // Exibir alternativas saudáveis
        const categoria = produto.categories ? produto.categories.split(',')[0].toLowerCase() : 'outros';
        mostrarAlternativasSaudaveis(categoria);

        // Alterar a exibição
        scannerContainer.style.display = "none";
        productInfo.style.display = "block";
      } else {
        // Produto não encontrado ou erro
        errorMessage.style.display = 'block';
        document.getElementById('error-text').textContent = 'Produto não encontrado ou erro ao acessar a API.';
      }
    })
    .catch(error => {
      // Erro de rede ou API
      errorMessage.style.display = 'block';
      document.getElementById('error-text').textContent = 'Erro ao acessar a API.';
    });
}

// Função para mostrar os ingredientes nocivos
function mostrarIngredientesNocivos(ingredientes) {
  const ingredientesArray = ingredientes.split(',').map(ing => ing.trim().toLowerCase());
  const nocivos = ingredientesArray.filter(ing => ingredientesNocivos.some(ingrediente => ing.includes(ingrediente)));

  badIngredients.textContent = nocivos.length ? nocivos.join(', ') : 'Nenhum ingrediente nocivo encontrado';
}

// Função para mostrar alternativas saudáveis
function mostrarAlternativasSaudaveis(categoria) {
  const alternativas = alternativasSaudaveis[categoria];
  healthyAlternatives.textContent = alternativas && alternativas.length ? alternativas.map(alt => alt.nome).join(', ') : 'Nenhuma alternativa encontrada';
}

// Iniciar o scanner
startBtn.addEventListener('click', () => {
  scannerContainer.style.display = 'block';
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      html5QrCode.stop();
      buscarProdutoNaAPI(decodedText);
    },
    (err) => {}
  );
});
