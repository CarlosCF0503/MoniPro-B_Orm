const disciplinaService = require('../services/disciplinaService');

class DisciplinaController {
    async listar(req, res) {
        try {
            const disciplinas = await disciplinaService.listar();
            res.json(disciplinas);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar disciplinas' });
        }
    }
}
module.exports = new DisciplinaController();