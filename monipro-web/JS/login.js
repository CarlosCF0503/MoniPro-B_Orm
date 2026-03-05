// JS/login.js

document.addEventListener('DOMContentLoaded', () => {
    const formularioLogin = document.getElementById('formLogin');
    const textoErro = document.getElementById('erro');

    formularioLogin.addEventListener('submit', async (evento) => {
        // Evita que a página recarregue ao submeter o formulário
        evento.preventDefault();

        // Captura os valores dos campos
        const identificador = document.getElementById('inputIdentificador').value;
        const senha = document.getElementById('inputSenha').value;

        // Limpa mensagens de erro anteriores
        textoErro.textContent = '';
        textoErro.classList.remove('aparecer');

        // Validação básica no cliente
        if (!identificador || !senha) {
            return showToast('Por favor, preencha o e-mail/matrícula e a senha.', 'error');
        }

        const perfilSelecionado = document.querySelector('input[name="tipo_usuario"]:checked');

        if (!perfilSelecionado) {
            return showToast('Por favor, selecione um perfil (Aluno ou Monitor).', 'error');
        }

        const tipoUtilizador = perfilSelecionado.value;

        try {
            // Utilização da nossa API centralizada
            const respostaApi = await chamadaApi('/login', {
                method: 'POST',
                body: JSON.stringify({
                    identificador: identificador,
                    senha: senha,
                    tipo_usuario: tipoUtilizador
                })
            });

            if (respostaApi.success) {
                // Guarda o token de forma segura no navegador
                localStorage.setItem('monipro_token', respostaApi.token);

                showToast(`Login como ${tipoUtilizador} efetuado com sucesso!`, 'success');

                // Redireciona para o painel principal após um breve atraso
                setTimeout(() => {
                    window.location.href = 'base.html';
                }, 1000);

            } else {
                // Exibe a mensagem de erro (ex: 'Credenciais inválidas') vinda do backend
                showToast(respostaApi.message || 'Ocorreu um erro ao fazer login.', 'error');
            }

        } catch (erroDeRede) {
            // Captura o erro lançado pela função chamadaApi
            showToast(erroDeRede.message, 'error');
        }
    });
});