// JS/cadastro.js

document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');
    const olhos = document.querySelectorAll('.olho');
    
    // =========================================================================
    // 1. FUNCIONALIDADE DO OLHO (MOSTRAR/ESCONDER SENHA)
    // =========================================================================
    if (olhos) {
        olhos.forEach(olho => {
            olho.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const img = this.querySelector('img');

                if (input.type === 'password') {
                    input.type = 'text';
                    img.src = 'IMG/Icone_olho.png'; 
                    img.alt = 'Esconder senha';
                } else {
                    input.type = 'password';
                    img.src = 'IMG/Icone_olho_fechado.png';
                    img.alt = 'Mostrar senha';
                }
            });
        });
    }

    // =========================================================================
    // 2. LÓGICA DE ENVIO DO FORMULÁRIO (USANDO A URL DO API.JS)
    // =========================================================================
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const nome = document.getElementById('inputNome').value.trim();
            const email = document.getElementById('inputEmail').value.trim();
            const senha = document.getElementById('inputSenha').value;
            const confirmarSenha = document.getElementById('inputConfirmarSenha').value;

            if (!nome || !email || !senha) {
                if (typeof showToast === 'function') showToast('Por favor, preencha todos os campos.', 'error');
                return;
            }

            if (senha !== confirmarSenha) {
                if (typeof showToast === 'function') showToast('As senhas não coincidem!', 'error');
                return;
            }

            const btnSubmit = document.getElementById('entrar');
            const textoOriginalBtn = btnSubmit.value;
            btnSubmit.value = 'Aguarde...';
            btnSubmit.disabled = true;

            try {
                const payload = {
                    nome_completo: nome,
                    email: email,
                    senha: senha
                };

                // Usa a variável MB_BETA_ORM que vem do arquivo api.js
                const response = await fetch(`${MB_BETA_ORM}/cadastro`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok && data.success !== false) { 
                    if (typeof showToast === 'function') showToast('Conta criada com sucesso! Bem-vindo(a)!', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    const mensagemErro = data.message || data.erro || 'Erro ao realizar o cadastro.';
                    if (typeof showToast === 'function') showToast(mensagemErro, 'error');
                }

            } catch (error) {
                console.error('Falha de comunicação com o backend:', error);
                if (typeof showToast === 'function') {
                    showToast('Sem ligação ao servidor. Verifique sua conexão.', 'error');
                }
            } finally {
                btnSubmit.value = textoOriginalBtn;
                btnSubmit.disabled = false;
            }
        });
    }
});
