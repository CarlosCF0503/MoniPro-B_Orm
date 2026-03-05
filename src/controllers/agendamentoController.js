// src/controllers/agendamentoController.js
const agendamentoService = require('../services/agendamentoService');

class AgendamentoController {
    async criar(req, res) {
        try {
            // AJUSTE: Incluímos o campo data_hora que o Prisma está exigindo
            const dadosAgendamento = {
                id_monitoria: parseInt(req.body.id_monitoria),
                id_aluno: req.usuario.id,
                status: req.body.status || 'pendente',
                data_hora: req.body.data_hora // Pega o valor enviado no Postman
            };

            const agendamento = await agendamentoService.criar(dadosAgendamento);
            res.status(201).json(agendamento);
        } catch (error) {
            console.error("❌ Erro real ao criar agendamento:", error);
            res.status(500).json({
                erro: 'Erro ao agendar',
                detalhe: error.message
            });
        }
    }

    async listar(req, res) {
        try {
            const agendamentos = await agendamentoService.listarPorAluno(req.usuario.id);
            res.json(agendamentos);
        } catch (error) {
            console.error("❌ Erro ao buscar agendamentos:", error);
            res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
        }
    }
}

module.exports = new AgendamentoController();