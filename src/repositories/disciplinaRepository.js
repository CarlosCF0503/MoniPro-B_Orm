const prisma = require('../config/bancoDeDados');

class DisciplinaRepository {
    async buscarTodas() {
        return await prisma.disciplina.findMany({ orderBy: { nome: 'asc' } });
    }
}
module.exports = new DisciplinaRepository();