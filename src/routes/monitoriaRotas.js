const express = require('express');
const router = express.Router();
const monitoriaController = require('../controllers/monitoriaController');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

// 1. Rotas de Criação (POST /monitorias)
router.post('/', autenticacaoMiddleware, monitoriaController.criar);

// 2. Rota ESPECÍFICA (Deve vir antes da rota com parâmetro ":")
// Isso garante que o Express não confunda "monitor" com um "idDisciplina"
router.get('/monitor/agendamentos', autenticacaoMiddleware, monitoriaController.listarAgendamentosDoMonitor);

// 3. Rota com PARÂMETRO (Deve vir por último)
router.get('/:idDisciplina', monitoriaController.listar);

module.exports = router;