const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');

class AutenticacaoService {
    async cadastrar(dados) {
        const hashSenha = await bcrypt.hash(dados.senha, 10);
        return await usuarioRepository.criar({ ...dados, senha: hashSenha });
    }
    async login(email, senha) {
        const usuario = await usuarioRepository.buscarPorEmail(email);
        if (!usuario) throw new Error('Usuário não encontrado');

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) throw new Error('Senha incorreta');

        const token = jwt.sign(
            { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
            process.env.JWT_SECRET || 'segredo_padrao',
            { expiresIn: '24h' }
        );
        return { token, usuario: { id: usuario.id, nome: usuario.nome_completo, tipo: usuario.tipo_usuario } };
    }
}
module.exports = new AutenticacaoService();