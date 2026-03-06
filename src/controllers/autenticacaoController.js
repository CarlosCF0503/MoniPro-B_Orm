// src/controllers/autenticacaoController.js
const autenticacaoService = require('../services/autenticacaoService');

class AutenticacaoController {
    async cadastrar(req, res) {
        try {
            const usuario = await autenticacaoService.cadastrar(req.body);
            res.status(201).json({ mensagem: 'Usuário criado com sucesso', id: usuario.id });
        } catch (error) {
            res.status(400).json({ erro: 'Erro ao cadastrar', detalhe: error.message });
        }
    }
    
    async login(req, res) {
        try {
            // AQUI ESTÁ A CORREÇÃO:
            // Extrai as variáveis corretas enviadas pelo frontend
            const { identificador, senha, tipo_usuario } = req.body;
            
            // Passa o identificador em vez do email para o Service
            const resultado = await autenticacaoService.login(identificador, senha, tipo_usuario);
            
            res.json(resultado);
        } catch (error) {
            res.status(401).json({ erro: 'Falha na autenticação', detalhe: error.message });
        }
    }
}
module.exports = new AutenticacaoController();
