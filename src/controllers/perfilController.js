const perfilService = require('../services/perfilService');

class PerfilController {
    async exibir(req, res) {
        try {
            const perfil = await perfilService.obter(req.usuario.id);
            res.json(perfil);
        } catch (error) {
            res.status(404).json({ erro: 'Perfil não encontrado' });
        }
    }
}
module.exports = new PerfilController();