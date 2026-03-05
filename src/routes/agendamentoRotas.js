const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

router.post('/agendamentos', autenticacaoMiddleware, agendamentoController.criar);
router.get('/agendamentos', autenticacaoMiddleware, agendamentoController.listar);

module.exports = router;