const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

router.get('/perfil', autenticacaoMiddleware, perfilController.exibir);

module.exports = router;