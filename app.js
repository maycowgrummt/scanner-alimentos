// Função para buscar informações sobre o produto na Open Food Facts
async function mostrarProduto(codigo) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        if (dados.product) {
            const produto = dados.product;
            productName.textContent = produto.product_name || "Produto desconhecido";
            badIngredients.textContent = produto.ingredients_text || "Sem informações sobre ingredientes.";
            healthyAlternatives.textContent = "Substitua por alimentos naturais e menos processados.";
            
            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        } else {
            console.log("Produto não encontrado com código de barras, tentando buscar por nome...");
            alert("Produto não encontrado diretamente. Tentando buscar por nome...");
            buscarProdutoPorNome(codigo);  // Tenta buscar por nome caso não encontre pelo código
        }
    } catch (erro) {
        console.error("Erro ao buscar produto:", erro);
        alert("Erro ao consultar produto.");
    }
}

// Função para tentar buscar o produto pela API Open Food Facts usando nome
async function buscarProdutoPorNome(codigo) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${codigo}&search_simple=1&action=process&json=1`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.products && dados.products.length > 0) {
            const produto = dados.products[0];  // Pega o primeiro produto da lista
            productName.textContent = produto.product_name || "Produto desconhecido";
            badIngredients.textContent = produto.ingredients_text || "Sem informações sobre ingredientes.";
            healthyAlternatives.textContent = "Substitua por alimentos naturais e menos processados.";

            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        } else {
            alert("Produto não encontrado na base de dados da Open Food Facts.");
            productName.textContent = "Produto não encontrado";
            badIngredients.textContent = "Não foi possível encontrar informações para este produto.";
            healthyAlternatives.textContent = "Tente escanear outro produto ou buscar manualmente.";
            
            scannerContainer.style.display = "none";
            productInfo.style.display = "block";
        }
    } catch (erro) {
        console.error("Erro ao buscar produto pelo nome:", erro);
        alert("Erro ao buscar produto.");
    }
}
