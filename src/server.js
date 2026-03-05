// src/server.js
require('dotenv').config(); // Garante que as variáveis de ambiente sejam carregadas
const app = require('./app'); // Importa as rotas e configurações do Express
const prisma = require('./config/bancoDeDados'); // Importa o nosso cliente Prisma

const PORTA = process.env.PORT || 3000;

// =========================================================================
// ROTA TEMPORÁRIA PARA DISCIPLINAS (Para destravar os testes de monitoria)
// =========================================================================
app.post('/disciplinas', async (req, res) => {
    try {
        const novaDisciplina = await prisma.disciplina.create({
            data: {
                nome: req.body.nome
            }
        });
        res.status(201).json(novaDisciplina);
    } catch (error) {
        console.error('❌ Erro ao criar disciplina:', error);
        res.status(500).json({ erro: 'Erro ao criar a disciplina', detalhe: error.message });
    }
});
// =========================================================================

async function iniciarServidor() {
    try {
        // Tenta estabelecer a conexão com o banco de dados via Prisma
        await prisma.$connect();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso via Prisma!');

        // Inicia o servidor Express
        const servidor = app.listen(PORTA, () => {
            console.log(`🚀 Servidor MoniPro rodando na porta ${PORTA}`);
        });

        // Tratamento elegante de desligamento (Graceful Shutdown) - Excelente para o Render!
        process.on('SIGINT', async () => {
            console.log('\n⚠️ Encerrando o servidor...');
            await prisma.$disconnect(); // Desconecta o Prisma com segurança
            servidor.close(() => {
                console.log('🛑 Servidor encerrado.');
                process.exit(0);
            });
        });

    } catch (erro) {
        console.error('❌ Falha crítica ao conectar no banco de dados:', erro);
        // Desconecta o Prisma em caso de erro grave antes de derrubar a aplicação
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Executa a função de inicialização
iniciarServidor();