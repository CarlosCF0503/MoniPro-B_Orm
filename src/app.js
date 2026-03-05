// src/app.js
const express = require('express');
const cors = require('cors');

// 1. PRIMEIRO: Criar a instância do app
const app = express();

// 2. Importar as rotas
const autenticacaoRotas = require('./routes/autenticacaoRotas');
const agendamentoRotas = require('./routes/agendamentoRotas');
const disciplinaRotas = require('./routes/disciplinaRotas');
const monitoriaRotas = require('./routes/monitoriaRotas');
const perfilRotas = require('./routes/perfilRotas');

// 3. Configurar Middlewares Globais
app.use(cors({ origin: ['https://moni-pro-beta.vercel.app', 'http://127.0.0.1:5500', 'http://localhost:5500'] }));
app.use(express.json());

// 4. Registrando todas as rotas com seus respectivos prefixos
app.use('/auth', autenticacaoRotas);
app.use('/agendamentos', agendamentoRotas);
app.use('/disciplinas', disciplinaRotas);
app.use('/monitorias', monitoriaRotas);
app.use('/perfil', perfilRotas);

module.exports = app;