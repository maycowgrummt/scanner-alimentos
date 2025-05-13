// Função para buscar informações do produto utilizando a Open Food Facts API
async function fetchProductInfo(code) {
    // Exibe o overlay de carregamento enquanto faz a requisição
    document.getElementById("loading-overlay").style.display = "flex";

    // Verifique se o código não está vazio
    if (!code) {
        alert("Código de barras inválido.");
        document.getElementById("loading-overlay").style.display = "none";
        return;
    }

    console.log("Buscando informações para o código:", code);

    try {
        // Fazendo a requisição à Open Food Facts API
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);

        // Verificando se o produto foi encontrado
        const data = await response.json();

        if (data.status === 1) {
            const product = data.product;

            // Exibe as informações do produto
            document.getElementById('product-name').textContent = product.product_name || "Produto não encontrado";
            document.getElementById('bad-ingredients').textContent = getBadIngredients(product) || "Ingredientes não disponíveis";
            document.getElementById('healthy-alternatives').textContent = getHealthyAlternatives(product) || "Alternativas saudáveis não disponíveis.";

            // Esconde o campo de escaneamento e mostra as informações
            document.getElementById("scanner-container").style.display = "none";
            document.getElementById("product-info").style.display = "block";
        } else {
            showError("Produto não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao buscar o produto:", error);
        showError("Erro ao obter informações do produto.");
    } finally {
        // Esconde o overlay de carregamento
        document.getElementById("loading-overlay").style.display = "none";
    }
}

// Função para exibir erro
function showError(message) {
    alert(message);
}

// Função para obter ingredientes prejudiciais (exemplo básico)
function getBadIngredients(product) {
    if (product.ingredients_text) {
        const ingredients = product.ingredients_text.split(", ");
        return ingredients.filter(ingredient => {
            // Defina seus critérios de ingredientes nocivos aqui
            return ingredient.toLowerCase().includes("adoçante") || ingredient.toLowerCase().includes("conservante");
        }).join(", ");
    }
    return null;
}

// Função para sugerir alternativas saudáveis (exemplo básico)
function getHealthyAlternatives(product) {
    // Aqui você pode melhorar com base em mais lógica ou até mesmo integrar uma API de alternativas
    if (product.categories) {
        const categories = product.categories.split(", ");
        return categories.includes("bebidas") ? "Água com gás, Chá verde" : "Frutas frescas, Barras de cereal";
    }
    return null;
}

// Função para lidar com o envio manual do código de barras
document.getElementById('manual-input').addEventListener('input', (event) => {
    const code = event.target.value;
    if (code.length >= 12) {
        fetchProductInfo(code);
    }
});
