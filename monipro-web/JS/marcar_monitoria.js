// JS/marcar_monitoria.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. CONFIGURAÇÃO INICIAL E SELEÇÃO DE ELEMENTOS ---
    const urlParams = new URLSearchParams(window.location.search);
    const disciplinaID = urlParams.get('disciplinaID');
    const disciplinaNome = urlParams.get('disciplinaNome');
    const token = localStorage.getItem('monipro_token');

    // Elementos da Interface (UI)
    const diasCalendario = document.getElementById('dias-calendario');
    const tituloPagina = document.getElementById('titulo-pagina');

    // Elementos do Aluno
    const viewAluno = document.getElementById('view-aluno');
    const containerMonitores = document.getElementById('lista-monitores');
    const btnAgendar = document.getElementById('marcar-agendamento');

    // Elementos do Monitor
    const viewMonitor = document.getElementById('view-monitor');
    const btnCriarMonitoria = document.getElementById('criar-monitoria');

    // Variáveis de Estado
    let diaSelecionado = null;
    let monitoriaSelecionada = null;
    let userData = null;
    let todasAsMonitorias = [];

    if (!disciplinaID || !token) {
        if (typeof showToast === 'function') showToast('Erro: Informações inválidas.', 'error');
        window.location.href = 'base.html';
        return;
    }

    if(tituloPagina) tituloPagina.textContent = `Monitoria de ${disciplinaNome}`;

    // Descodifica o token para saber quem é o utilizador
    try {
        userData = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        localStorage.removeItem('monipro_token');
        window.location.href = 'index.html';
        return;
    }

    // --- 2. LÓGICA DO CALENDÁRIO ---
    function getNomeMes(mes) {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return meses[mes];
    }

    function renderCalendario(diasComMonitoria = []) {
        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth();
        const anoAtual = dataAtual.getFullYear();
        const diaAtual = dataAtual.getDate();

        const headerElement = document.getElementById('mes-ano');
        if (headerElement) headerElement.textContent = `${getNomeMes(mesAtual)} ${anoAtual}`;

        const primeiroDiaDoMes = new Date(anoAtual, mesAtual, 1).getDay();
        const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

        const tbody = document.getElementById('dias-calendario');
        if (!tbody) return;

        tbody.innerHTML = '';
        let linha = document.createElement('tr');
        let diaContador = 1;

        for (let i = 0; i < primeiroDiaDoMes; i++) {
            linha.appendChild(document.createElement('td'));
        }

        while (diaContador <= ultimoDiaDoMes) {
            if (linha.children.length === 7) {
                tbody.appendChild(linha);
                linha = document.createElement('tr');
            }

            const coluna = document.createElement('td');
            // AJUSTE: Forçar conversão para String para evitar erros no IDE
            coluna.textContent = String(diaContador);
            coluna.dataset.dia = String(diaContador);

            if (diaContador === diaAtual && mesAtual === dataAtual.getMonth()) {
                coluna.classList.add('dia-atual');
            }

            if (diasComMonitoria.includes(diaContador)) {
                coluna.classList.add('dia-com-monitoria');
            }

            linha.appendChild(coluna);
            diaContador++;
        }

        if (linha.children.length > 0) {
            tbody.appendChild(linha);
        }
    }

    // --- 3. LÓGICA DE SELEÇÃO DO CALENDÁRIO E AUTO-SCROLL MOBILE ---
    if (diasCalendario) {
        diasCalendario.addEventListener('click', (event) => {
            const celulaClicada = event.target.closest('td');

            if (!celulaClicada || !celulaClicada.dataset.dia) return;

            if (userData.tipo === 'aluno') {
                if (!celulaClicada.classList.contains('dia-com-monitoria')) {
                    if (typeof showToast === 'function') showToast('Nenhuma monitoria disponível neste dia.', 'error');
                    containerMonitores.innerHTML = '<p>Selecione um dia disponível (marcado a azul).</p>';
                    monitoriaSelecionada = null;
                    if (diaSelecionado) diaSelecionado.classList.remove('dia-selecionado');
                    diaSelecionado = null;
                    return;
                }
            }

            if (diaSelecionado) {
                diaSelecionado.classList.remove('dia-selecionado');
            }

            diaSelecionado = celulaClicada;
            diaSelecionado.classList.add('dia-selecionado');

            // Converte de volta para Number de forma segura para o filtro
            const diaNum = Number(diaSelecionado.dataset.dia);
            filtrarMonitoresPorDia(diaNum);

            // Animação de descida automática para ecrãs de telemóvel
            if (window.innerWidth <= 900 && userData.tipo === 'aluno') {
                const areaMarcar = document.getElementById('view-aluno');
                if (areaMarcar) {
                    setTimeout(() => {
                        areaMarcar.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                }
            }
        });
    }

    // --- 4. VERIFICA O TIPO DE UTILIZADOR E EXECUTA A LÓGICA PRINCIPAL ---
    if (userData.tipo === 'aluno') {
        viewAluno.style.display = 'flex';
        viewMonitor.style.display = 'none';
        await carregarMonitoriasParaAluno();
        if(btnAgendar) btnAgendar.addEventListener('click', salvarAgendamento);

    } else if (userData.tipo === 'monitor') {
        viewAluno.style.display = 'none';
        viewMonitor.style.display = 'flex';
        renderCalendario();
        if(btnCriarMonitoria) btnCriarMonitoria.addEventListener('click', salvarNovaMonitoria);
    }

    // --- 5. FUNÇÕES DE COMUNICAÇÃO COM A API E FILTROS ---

    async function carregarMonitoriasParaAluno() {
        try {
            const response = await fetch(`https://monipro-beta.onrender.com/monitorias/${disciplinaID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.monitorias.length > 0) {
                todasAsMonitorias = data.monitorias;

                // Mapeia os dias exatos em que há vagas
                const datasDisponiveis = todasAsMonitorias.map(m => new Date(m.horario).getDate());
                const diasUnicos = [...new Set(datasDisponiveis)];

                renderCalendario(diasUnicos);
                containerMonitores.innerHTML = '<p>Selecione um dia azul no calendário.</p>';
            } else {
                containerMonitores.innerHTML = '<p>Nenhum monitor disponível para esta disciplina.</p>';
                renderCalendario();
            }
        } catch (error) {
            if (typeof showToast === 'function') showToast('Erro ao carregar monitorias.', 'error');
            renderCalendario();
        }
    }

    function filtrarMonitoresPorDia(diaNum) {
        containerMonitores.innerHTML = '';
        monitoriaSelecionada = null;

        const monitoresDoDia = todasAsMonitorias.filter(m => new Date(m.horario).getDate() === diaNum);

        if (monitoresDoDia.length === 0) {
            containerMonitores.innerHTML = '<p>Erro: Nenhuma monitoria encontrada para este dia.</p>';
            return;
        }

        monitoresDoDia.forEach(monitoria => {
            const div = document.createElement('div');
            div.className = 'monitor-item';

            const horaFormatada = new Date(monitoria.horario).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // AJUSTE: O Prisma devolve monitoria.id. O nome do monitor vem através do join
            const monId = String(monitoria.id);
            const nomeMonitor = monitoria.usuario?.nome_completo || 'Monitor';

            div.innerHTML = `
                <input type="radio" name="monitoriaEscolhida" value="${monId}" id="mon-${monId}" style="display: none;">
                <label for="mon-${monId}" style="cursor:pointer; width: 100%; display: flex; align-items: center; gap: 15px;">
                    <div class="icone"><img src="IMG/Icone_monitor.png" alt="Monitor"></div>
                    <div>
                        <strong>${nomeMonitor}</strong> <br>
                        <small>Local: ${monitoria.local || 'A definir'}</small> <br>
                        <small style="color: #071E3D; font-weight: bold;">Horário: ${horaFormatada}</small>
                    </div>
                </label>
            `;

            // Permite clicar na caixa completa
            div.addEventListener('click', () => {
                document.querySelectorAll('.monitor-item.selecionado').forEach(m => m.classList.remove('selecionado'));
                div.classList.add('selecionado');
                const radio = div.querySelector('input[type="radio"]');
                if(radio) radio.checked = true;
                monitoriaSelecionada = monitoria;
            });

            containerMonitores.appendChild(div);
            containerMonitores.appendChild(document.createElement('hr'));
        });
    }

    async function salvarAgendamento() {
        if (!monitoriaSelecionada) {
            if (typeof showToast === 'function') showToast('Por favor, selecione um monitor da lista.', 'error');
            return;
        }

        try {
            const response = await fetch('https://monipro-beta.onrender.com/agendamento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id_monitoria: Number(monitoriaSelecionada.id), // Envia como Number exigido pelo backend
                    data_agendamento: monitoriaSelecionada.horario
                })
            });

            if (response.status === 409) {
                const errorData = await response.json();
                if (typeof showToast === 'function') showToast(errorData.message, 'error');
                return;
            }

            const data = await response.json();

            if (data.success) {
                btnAgendar.classList.add('marcado');
                btnAgendar.querySelector('p').textContent = 'Agendado!';
                if (typeof showToast === 'function') showToast('Monitoria agendada com sucesso!', 'success');
                setTimeout(() => window.location.href = 'base.html', 2000);
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'Erro ao agendar monitoria.', 'error');
            }
        } catch (error) {
            if (typeof showToast === 'function') showToast('Não foi possível ligar ao servidor.', 'error');
        }
    }

    async function salvarNovaMonitoria() {
        // AJUSTE: Garantir que o valor recuperado é uma String
        const dia = diaSelecionado ? String(diaSelecionado.dataset.dia) : null;
        const horaInput = document.getElementById('monitoria-horario').value;
        const local = document.getElementById('monitoria-local').value;
        const descricao = document.getElementById('monitoria-descricao').value;

        if (!dia || !horaInput || !local) {
            if (typeof showToast === 'function') showToast('Selecione um dia no calendário, defina o horário e o local.', 'error');
            return;
        }

        // AJUSTE: O JavaScript agora tem a certeza de que é uma String antes de usar o split
        const [horas, minutos] = String(horaInput).split(':');
        const dataAtual = new Date();
        const data_monitoria = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), Number(dia), Number(horas), Number(minutos), 0).toISOString();

        try {
            const response = await fetch('https://monipro-beta.onrender.com/monitoria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id_disciplina: Number(disciplinaID),
                    horario: data_monitoria,
                    local: String(local),
                    descricao: String(descricao)
                })
            });

            const data = await response.json();

            if (data.success) {
                btnCriarMonitoria.classList.add('marcado');
                btnCriarMonitoria.querySelector('p').textContent = 'Vaga Criada!';
                if (typeof showToast === 'function') showToast('Vaga de monitoria criada com sucesso!', 'success');
                setTimeout(() => window.location.href = 'base.html', 2000);
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'Erro ao criar vaga.', 'error');
            }
        } catch (error) {
            if (typeof showToast === 'function') showToast('Não foi possível ligar ao servidor.', 'error');
        }
    }
});