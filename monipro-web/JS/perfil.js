// JS/perfil.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. OBTENÇÃO DO TOKEN E VERIFICAÇÃO DE SESSÃO ---
    const token = localStorage.getItem('monipro_token');
    let userData = null;

    if (!token) {
        if (typeof showToast === 'function') showToast('Precisa de estar logado para aceder a esta página.', 'error');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        return;
    }

    try {
        // Descodifica o payload do token JWT para saber quem está logado
        userData = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        localStorage.removeItem('monipro_token');
        window.location.href = 'index.html';
        return;
    }

    // --- 2. ELEMENTOS DO MODAL DE CONFIRMAÇÃO ---
    const confirmModal = document.getElementById('modal-confirmacao');
    const confirmModalText = document.getElementById('modal-confirmacao-texto');
    const btnConfirmarSim = document.getElementById('btnConfirmarSim');
    const btnConfirmarNao = document.getElementById('btnConfirmarNao');
    const overlay = document.getElementById('overlay');
    let acaoPendente = null; // Guarda a função que será executada se o utilizador clicar em "Sim"

    const showConfirmModal = (text) => {
        if (!confirmModal || !overlay) return;
        confirmModalText.textContent = text;
        overlay.classList.add('active');
        confirmModal.classList.add('aparecer');
    };

    const hideConfirmModal = () => {
        if (!confirmModal || !overlay) return;
        overlay.classList.remove('active');
        confirmModal.classList.remove('aparecer');
        acaoPendente = null;
    };

    if (btnConfirmarSim) {
        btnConfirmarSim.addEventListener('click', () => {
            if (typeof acaoPendente === 'function') acaoPendente();
            hideConfirmModal();
        });
    }
    if (btnConfirmarNao) btnConfirmarNao.addEventListener('click', hideConfirmModal);

    // --- 3. BUSCAR DADOS PRINCIPAIS DO PERFIL ---
    try {
        const response = await fetch('https://monipro-beta.onrender.com/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('nomeUsuario').textContent = data.user.nome_completo || 'Utilizador';
            document.getElementById('emailUsuario').textContent = data.user.email || '';
            document.getElementById('matriculaUsuario').textContent = data.user.matricula || '';

            const tipo = String(data.user.tipo_usuario);
            document.getElementById('tipoUsuario').textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        } else {
            // Tratamento de erro direto sem "throw" local
            if (typeof showToast === 'function') showToast(data.message || 'Erro ao carregar perfil.', 'error');
            return;
        }
    } catch (error) {
        if (typeof showToast === 'function') showToast('Não foi possível carregar os dados do perfil.', 'error');
        return;
    }

    // --- 4. CONTROLO INTELIGENTE DE INTERFACE E LISTAGENS ---
    if (userData.tipo === 'aluno') {
        // --- LÓGICA DO ALUNO ---
        const areaAluno = document.getElementById('area-aluno');
        if (areaAluno) areaAluno.style.display = 'block';

        const container = document.getElementById('lista-agendamentos');
        if (container) {
            await carregarAgendamentos(token, container);

            container.addEventListener('click', (event) => {
                if (event.target.classList.contains('btn-cancelar')) {
                    const agendamentoId = event.target.dataset.agendamentoId;
                    const itemElement = event.target.closest('.lista-item');
                    acaoPendente = () => handleSairMonitoria(agendamentoId, itemElement, token);
                    showConfirmModal('Tem a certeza que deseja cancelar a sua inscrição nesta monitoria?');
                }
            });
        }

    } else if (userData.tipo === 'monitor') {
        // --- LÓGICA DO MONITOR ---
        const areaMonitor = document.getElementById('area-monitor');
        const btnCertificados = document.getElementById('btn-certificados');
        if (areaMonitor) areaMonitor.style.display = 'block';
        if (btnCertificados) btnCertificados.style.display = 'flex';

        const container = document.getElementById('lista-monitorias-criadas');
        if (container) {
            await carregarMonitoriasCriadas(token, container);

            container.addEventListener('click', (event) => {
                if (event.target.classList.contains('btn-cancelar')) {
                    const monitoriaId = event.target.dataset.monitoriaId;
                    const itemElement = event.target.closest('.lista-item');
                    acaoPendente = () => handleCancelarMonitoria(monitoriaId, itemElement, token);
                    showConfirmModal('Tem a certeza que deseja cancelar esta vaga de monitoria?');
                }
            });
        }

        // Lógica de animação para abrir/fechar o painel de certificados
        const verCertificadosBtn = document.getElementById('abrir_c');
        const perfilCard = document.getElementById('perfil_informacao');
        const certificadosArea = document.getElementById('area_certificados');

        if (verCertificadosBtn && certificadosArea && perfilCard) {
            verCertificadosBtn.addEventListener('click', () => {
                certificadosArea.classList.toggle('aparecer');
                perfilCard.classList.toggle('mudar');
                const p = verCertificadosBtn.querySelector('p');
                if (p) p.textContent = certificadosArea.classList.contains('aparecer') ? "voltar" : "ver";
            });
        }
    }
});

// ========================================================================= //
// FUNÇÕES DE LIGAÇÃO COM A API (FETCH)
// ========================================================================= //

// Função para carregar as inscrições do ALUNO
async function carregarAgendamentos(token, container) {
    try {
        const response = await fetch('https://monipro-beta.onrender.com/perfil/agendamentos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        // Proteção contra JSON sem a propriedade agendamentos
        const listaAgendamentos = data.agendamentos || [];

        if (data.success && listaAgendamentos.length > 0) {
            container.innerHTML = '';
            listaAgendamentos.forEach(ag => {
                const dataFormatada = new Date(ag.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                const div = document.createElement('div');
                div.className = 'lista-item';

                const nomeDisciplina = ag.monitoria?.disciplina?.nome || 'Disciplina Indefinida';
                const nomeMonitor = ag.monitoria?.usuario?.nome_completo || 'Monitor';
                const agendamentoId = String(ag.id);
                const statusStr = String(ag.status);

                div.innerHTML = `
                    <div class="lista-item-info">
                        <p><strong>${nomeDisciplina}</strong> (com ${nomeMonitor})</p>
                        <p>${dataFormatada} - <span class="status-${statusStr.toLowerCase()}">${statusStr.toUpperCase()}</span></p>
                    </div>
                    <button class="btn-cancelar" data-agendamento-id="${agendamentoId}">Sair</button>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p>Ainda não se inscreveu em nenhuma monitoria.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar os seus agendamentos.</p>';
    }
}

// Função para carregar as vagas criadas pelo MONITOR
async function carregarMonitoriasCriadas(token, container) {
    try {
        const response = await fetch('https://monipro-beta.onrender.com/perfil/monitorias', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        // Proteção contra JSON sem a propriedade monitorias
        const listaMonitorias = data.monitorias || [];

        if (data.success && listaMonitorias.length > 0) {
            container.innerHTML = '';
            listaMonitorias.forEach(m => {
                const dataFormatada = new Date(m.horario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                const div = document.createElement('div');
                div.className = 'lista-item';

                const monitoriaId = String(m.id);
                const nomeDisciplina = m.disciplina?.nome || 'Disciplina Indefinida';
                const statusStr = String(m.status);

                let botaoOuStatus = `<span class="status-${statusStr.toLowerCase()}">${statusStr.toUpperCase()}</span>`;
                if (statusStr.toLowerCase() === 'ativa' || statusStr.toLowerCase() === 'pendente') {
                    botaoOuStatus = `<button class="btn-cancelar" data-monitoria-id="${monitoriaId}">Cancelar Vaga</button>`;
                }

                div.innerHTML = `
                    <div class="lista-item-info">
                        <p><strong>${nomeDisciplina}</strong> (${m.local || 'Local Indefinido'})</p>
                        <p>${dataFormatada} - <span class="status-${statusStr.toLowerCase()}">${statusStr.toUpperCase()}</span></p>
                    </div>
                    ${botaoOuStatus} 
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p>Ainda não criou nenhuma vaga de monitoria.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar as suas monitorias.</p>';
    }
}

// Função que apaga a inscrição do ALUNO no backend
async function handleSairMonitoria(agendamentoId, itemElement, token) {
    try {
        const response = await fetch(`https://monipro-beta.onrender.com/agendamento/${agendamentoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            if (typeof showToast === 'function') showToast(data.message, 'success');
            itemElement.remove();
        } else {
            if (typeof showToast === 'function') showToast(data.message, 'error');
        }
    } catch (error) {
        if (typeof showToast === 'function') showToast('Erro ao comunicar com o servidor.', 'error');
    }
}

// Função que cancela a vaga do MONITOR no backend
async function handleCancelarMonitoria(monitoriaId, itemElement, token) {
    try {
        const response = await fetch(`https://monipro-beta.onrender.com/monitoria/${monitoriaId}/cancelar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            if (typeof showToast === 'function') showToast(data.message, 'success');

            const statusInfo = itemElement.querySelector('.lista-item-info p:nth-child(2)');
            if (statusInfo) {
                const textPart = statusInfo.innerHTML.split('-')[0];
                statusInfo.innerHTML = `${textPart}- <span class="status-cancelada" style="color:red;font-weight:bold;">CANCELADA</span>`;
            }

            const btn = itemElement.querySelector('.btn-cancelar');
            if (btn) btn.remove();
        } else {
            if (typeof showToast === 'function') showToast(data.message, 'error');
        }
    } catch (error) {
        if (typeof showToast === 'function') showToast('Erro ao comunicar com o servidor.', 'error');
    }
}