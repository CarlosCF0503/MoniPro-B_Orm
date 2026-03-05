// src/repositories/monitoriaRepository.js
const prisma = require('../config/bancoDeDados');

class MonitoriaRepository {
    async criar(dados) {
        return await prisma.monitoria.create({
            data: {
                id_disciplina: Number(dados.id_disciplina),
                id_monitor: dados.id_monitor,
                local: dados.local,
                descricao: dados.descricao,
                status: dados.status || 'ativa',
                horario: dados.horario
            }
        });
    }

    async buscarPorDisciplina(idDisciplina) {
        return await prisma.monitoria.findMany({
            where: {
                id_disciplina: idDisciplina,
                status: 'ativa'
            },
            include: {
                usuario: {
                    // AJUSTE: Trocado 'nome' por 'nome_completo' conforme seu schema
                    select: { nome_completo: true }
                }
            }
        });
    }

    // --- MÉTODO CORRIGIDO PARA LISTAR AGENDAMENTOS ---
    async buscarAgendamentos(monitorId) {
        return await prisma.agendamento.findMany({
            where: {
                monitoria: {
                    id_monitor: monitorId
                }
            },
            include: {
                aluno: {
                    select: {
                        // AJUSTE: Trocado 'nome' por 'nome_completo'
                        nome_completo: true,
                        email: true,
                        matricula: true
                    }
                },
                monitoria: {
                    select: {
                        local: true,
                        horario: true,
                        disciplina: {
                            select: {
                                // Certifique-se que o campo na tabela Disciplina é 'nome'
                                nome: true
                            }
                        }
                    }
                }
            }
        });
    }
}

module.exports = new MonitoriaRepository();