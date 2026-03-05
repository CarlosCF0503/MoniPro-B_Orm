const agendamentoRepository = require('../repositories/agendamentoRepository');

class AgendamentoService {
    async criar(dados) {
        return await agendamentoRepository.criar(dados);
    }
    async listarPorAluno(idAluno) {
        return await agendamentoRepository.buscarPorAluno(idAluno);
    }
}
module.exports = new AgendamentoService();