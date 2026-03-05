const express = require('express');
const router = express.Router();
const disciplinaController = require('../controllers/disciplinaController');

router.get('/disciplinas', disciplinaController.listar);

module.exports = router;