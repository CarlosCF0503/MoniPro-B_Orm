const perfilRepository = require('../repositories/perfilRepository');

class PerfilService {
    async obter(id) {
        const perfil = await perfilRepository.buscarPerfilCompleto(id);

        if (!perfil) {
            throw new Error('Perfil não encontrado na base de dados.');
        }

        return perfil;
    }
}

module.exports = new PerfilService();