const disciplinaRepository = require('../repositories/disciplinaRepository');

class DisciplinaService {
    async listar() {
        return await disciplinaRepository.buscarTodas();
    }
}
module.exports = new DisciplinaService();