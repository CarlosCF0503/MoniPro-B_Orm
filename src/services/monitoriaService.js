// src/services/monitoriaService.js
const monitoriaRepository = require('../repositories/monitoriaRepository');

class MonitoriaService {
    async criar(dados) {
        // Encaminha os dados (incluindo o id_monitor vindo do token) para o banco
        return await monitoriaRepository.criar(dados);
    }

    async listarPorDisciplina(idDisciplina) {
        // Converte o ID para número para garantir compatibilidade com o Prisma
        return await monitoriaRepository.buscarPorDisciplina(Number(idDisciplina));
    }

    // --- NOVO MÉTODO PARA LISTAR AGENDAMENTOS DO MONITOR ---
    async buscarAgendamentosPorMonitor(monitorId) {
        // Esta função vai buscar no repositório todas as monitorias
        // criadas por este monitor que já possuem alunos inscritos
        return await monitoriaRepository.buscarAgendamentos(monitorId);
    }
}

module.exports = new MonitoriaService();