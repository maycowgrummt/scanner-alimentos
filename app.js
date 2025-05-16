// Seletores principais (mantidos iguais)
const startBtn = document.getElementById('start-scanner');
const scannerContainer = document.getElementById('scanner-container');
const productInfo = document.getElementById('product-info');
const productName = document.getElementById('product-name');
const badIngredients = document.getElementById('bad-ingredients');
const healthyAlternatives = document.getElementById('healthy-alternatives');
const productPhoto = document.getElementById('product-photo');
const scanAgainBtn = document.getElementById('scan-again');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error');

let html5QrCode;

// Sua lista original de ingredientes nocivos
const ingredientesNocivos = [
  'açúcar', 'glutamato monossódico', 'corante',
  'gordura trans', 'benzoato de sódio',
  'acidulante', 'corante caramelo', 'glicose', 'sódio'
];

// --- AQUI: Agora com a nova categoria "massas" ---
const alternativasSaudaveis = {
  bebidas: [
    { nome: 'Suco Natural de Laranja' },
    { nome: 'Água de Coco' },
    { nome: 'Chá Verde Natural' }
  ],
  snacks: [
    { nome: 'Mix de Nozes e Castanhas' },
    { nome: 'Barras de Cereal Integral' },
    { nome: 'Chips de Abobrinha Assada' }
  ],
  biscoitos: [
    { nome: 'Biscoito Integral de Aveia' },
    { nome: 'Biscoito Sem Glúten de Cacau' },
    { nome: 'Biscoito de Amêndoas' }
  ],
  refrigerantes: [
    { nome: 'Água com Gás com Limão' },
    { nome: 'Chá Natural de Ervas' },
    { nome: 'Kombucha' }
  ],
  laticínios: [
    { nome: 'Iogurte Natural Integral' },
    { nome: 'Queijo Minas Frescal' },
    { nome: 'Kefir' }
  ],
  massas: [  // <<< NOVO
    { nome: 'Macarrão Integral com Legumes' },
    { nome: 'Espaguete de Abobrinha (Zoodles)' },
    { nome: 'Macarrão de Arroz Integral' }
  ]
};

// --- Substitua/estenda sua antiga função aqui ---
function mapearCategoria(categoria) {
  categoria = categoria.toLowerCase();
  if (categoria.includes('bebida')      || categoria.includes('drink')   || categoria.includes('suco') || categoria.includes('água') || categoria.includes('chá'))
    return 'bebidas';
  if (categoria.includes('snack')       || categoria.includes('barra')   || categoria.includes('castanha'))
    return 'snacks';
  if (categoria.includes('biscoito')    || categoria.includes('cookie')  || categoria.includes('bolacha'))
    return 'biscoitos';
  if (categoria.includes('refrigerante')|| categoria.includes('soda')    || categoria.includes('refri'))
    return 'refrigerantes';
  if (categoria.includes('laticínio')   || categoria.includes('leite')   || categoria.includes('queijo') || categoria.includes('iogurte') || categoria.includes('kefir'))
    return 'laticínios';
  // <<< NOVO: reconhece massas/macarrão/noodle >>>
  if (categoria.includes('massa')       || categoria.includes('macarrão')|| categoria.includes('noodle'))
    return 'massas';
  return 'outros';
}

// Demais funções (exibição de imagem, fetch da API, UI updates) seguem igual
function exibirImagemProduto(urlImagem) {
  if (urlImagem) {
    const img = new Image();
    img.onload  = () => productPhoto.src = urlImagem;
    img.onerror = () => productPhoto.src = 'https://via.placeholder.com/150';
    img.src = urlImagem;
  } else {
    productPhoto.src = 'https://via.placeholder.com/150';
  }
}

function mostrarIngredientesNocivos(ingredientes) {
  const arr = ingredientes.split(',').map(i=>i.trim().toLowerCase());
  const nocivos = arr.filter(i=> ingredientesNocivos.some(n=>i.includes(n)));
  badIngredients.textContent = nocivos.length ? nocivos.join(', ') : 'Nenhum ingrediente nocivo encontrado';
}

function mostrarAlternativasSaudaveis(categoria) {
  const alt = alternativasSaudaveis[categoria];
  healthyAlternatives.textContent = alt?.length
    ? alt.map(a=>a.nome).join(', ')
    : 'Nenhuma alternativa encontrada';
}

function buscarProdutoNaAPI(codigoDeBarras) {
  fetch(`https://world.openfoodfacts.org/api/v0/product/${codigoDeBarras}.json`)
    .then(r=>r.json())
    .then(data=>{
      if(data.status===1){
        const p = data.product;
        productName.textContent = p.product_name||'Nome não encontrado';
        exibirImagemProduto(p.image_url);
        mostrarIngredientesNocivos(p.ingredients_text||'');
        const catRaw = p.categories?.split(',')[0]||'';
        mostrarAlternativasSaudaveis(mapearCategoria(catRaw));
        scannerContainer.style.display = 'none';
        productInfo.style.display = 'block';
      } else {
        errorMessage.style.display = 'block';
        document.getElementById('error-text').textContent = 'Produto não encontrado ou erro ao acessar a API.';
      }
    })
    .catch(()=>{
      errorMessage.style.display = 'block';
      document.getElementById('error-text').textContent = 'Erro ao acessar a API.';
    });
}

function iniciarScanner() {
  if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode:"environment" },
    { fps:10, qrbox:250 },
    decoded=>{ html5QrCode.stop(); buscarProdutoNaAPI(decoded); },
    err=>console.warn(err)
  ).catch(e=>{
    errorMessage.style.display='block';
    document.getElementById('error-text').textContent='Erro ao iniciar o scanner.';
  });
}

startBtn.addEventListener('click', ()=>{
  scannerContainer.style.display='block';
  productInfo.style.display='none';
  errorMessage.style.display='none';
  iniciarScanner();
});

scanAgainBtn.addEventListener('click', ()=>{
  productInfo.style.display='none';
  scannerContainer.style.display='block';
  errorMessage.style.display='none';
  iniciarScanner();
});

closeErrorBtn.addEventListener('click', ()=> errorMessage.style.display='none' );
