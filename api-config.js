// Configure estes valores antes de publicar para todos os visitantes usarem a mesma API.
// Não coloque senhas, chaves privadas ou tokens secretos neste arquivo público.
window.VITRINE_CONFIG = {
  mode: 'functions', // 'functions', 'rest' ou 'easy'
  base: 'https://technoworks.com.br',
  collection: '/api/items', // Functions documentado pela Technoworks
  ra: '',            // Necessário somente nos modos REST e Easy
  create: '',        // Caminho POST opcional; vazio usa collection
  update: '',        // Caminho PUT/PATCH opcional; use {id} para o ID do item
  delete: ''         // Caminho DELETE opcional; use {id} para o ID do item
};
