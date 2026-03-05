const prisma = require('../config/bancoDeDados');

class AgendamentoRepository {
    async criar(dados) {
        return await prisma.agendamento.create({ data: dados });
    }
    async buscarPorAluno(idAluno) {
        return await prisma.agendamento.findMany({
            where: { id_aluno: parseInt(idAluno) },
            include: { monitoria: { include: { disciplina: true, monitor: { select: { nome_completo: true } } } } }
        });
    }
}
module.exports = new AgendamentoRepository();