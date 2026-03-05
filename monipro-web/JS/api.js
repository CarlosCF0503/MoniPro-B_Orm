// JS/api.js

// URL base do seu servidor. Se for testar localmente, pode alterar para "http://localhost:3000"
const MB_BETA_ORM = "https://monipro-b-orm.onrender.com";

/**
 * Função centralizada para realizar pedidos ao backend Sequelize.
 * @param {string} endpoint - O caminho da rota (ex: '/login', '/perfil')
 * @param {object} opcoes - Configurações do fetch (method, body, etc.)
 * @returns {Promise<object>} - A resposta JSON do servidor
 */
async function chamadaApi(endpoint, opcoes = {}) {
    // Tenta recuperar o token guardado no navegador
    const token = localStorage.getItem('monipro_token');

    // Configura os cabeçalhos (headers) padrão
    const cabecalhos = {
        'Content-Type': 'application/json',
        ...opcoes.headers
    };

    // Se o utilizador estiver logado, injeta o token de Autorização automaticamente
    if (token) {
        cabecalhos['Authorization'] = `Bearer ${token}`;
    }

    // Junta as opções originais com os novos cabeçalhos
    const configuracao = { ...opcoes, headers: cabecalhos };

    try {
        const resposta = await fetch(`${MB_BETA_ORM}${endpoint}`, configuracao);

        // O Sequelize devolve erros em formato JSON amigável, então processamos sempre a resposta
        const dados = await resposta.json();

        // Adicionamos o status HTTP ao objeto para facilitar validações específicas no frontend
        dados.statusHttp = resposta.status;

        return dados;
    } catch (erro) {
        console.error(`Erro no pedido para ${endpoint}:`, erro);
        // Lança um erro padronizado para o bloco 'catch' dos outros scripts
        throw new Error('Não foi possível conectar ao servidor. Verifique a sua ligação à internet.');
    }

}
