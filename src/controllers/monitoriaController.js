// src/controllers/monitoriaController.js
const monitoriaService = require('../services/monitoriaService');

class MonitoriaController {
    async criar(req, res) {
        try {
            // Pega o ID do token e junta com os dados do Postman
            const dadosDaMonitoria = {
                ...req.body,
                id_monitor: req.usuario.id
            };

            const monitoria = await monitoriaService.criar(dadosDaMonitoria);
            res.status(201).json(monitoria);
        } catch (error) {
            console.error("❌ Erro real do Prisma:", error); // Ajuda no debug do terminal
            res.status(500).json({ erro: 'Erro ao criar monitoria' });
        }
    }

    async listar(req, res) {
        try {
            const { idDisciplina } = req.params;
            const monitorias = await monitoriaService.listarPorDisciplina(idDisciplina);
            res.json(monitorias);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao listar monitorias' });
        }
    }

    // --- NOVO MÉTODO PARA RESOLVER O ERRO NO SERVER ---
    async listarAgendamentosDoMonitor(req, res) {
        try {
            // O ID vem do token JWT decodificado pelo middleware
            const monitorId = req.usuario.id;
            const agendamentos = await monitoriaService.buscarAgendamentosPorMonitor(monitorId);
            res.json(agendamentos);
        } catch (error) {
            console.error("❌ Erro ao buscar agendamentos do monitor:", error);
            res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
        }
    }
}

module.exports = new MonitoriaController();