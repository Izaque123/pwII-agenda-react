# React + Vite - Projeto O.D

Aplicação React para gerenciamento de agenda e pacientes, integrada com API REST.

## 🚀 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar URL da API

Crie um arquivo `.env` na raiz do projeto (opcional):

```env
VITE_API_URL=http://localhost:3000/api
```

**Nota:** Se não criar o arquivo `.env`, a aplicação usará `http://localhost:3000/api` como padrão.

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

## 📋 Pré-requisitos

Antes de iniciar a aplicação, certifique-se de que a API REST está rodando:

1. Navegue até o diretório `api-rest-node`
2. Execute as migrações: `npm run migrate`
3. Inicie o servidor: `npm start`

A API deve estar disponível em `http://localhost:3000`

## 🔗 Integração com API

A aplicação está integrada com a API REST localizada em `../api-rest-node`. 

### Serviços criados:

- `src/services/api.js` - Cliente HTTP base
- `src/services/agendaService.js` - Serviço para gerenciamento de eventos/agenda
- `src/services/pacientesService.js` - Serviço para gerenciamento de pacientes
- `src/config/api.js` - Configuração da URL da API

### Funcionalidades integradas:

- ✅ **Agenda**: Carregar, criar, atualizar e deletar eventos via API
- ✅ **Pacientes**: Carregar, criar, atualizar e deletar pacientes via API
- ✅ **Drag & Drop**: Atualização automática na API ao mover eventos
- ✅ **Status**: Atualização de status de eventos via API

## 📁 Estrutura

```
src/
├── components/        # Componentes React
├── contexts/          # Contextos (Theme, Auth, etc.)
├── pages/             # Páginas principais
├── services/          # Serviços de API
│   ├── api.js
│   ├── agendaService.js
│   └── pacientesService.js
└── config/            # Configurações
    └── api.js
```

## 🛠️ Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 📌 Notas

- A aplicação substituiu o uso de `localStorage` por chamadas à API REST
- Todos os dados são persistidos no banco SQLite da API
- A integração é assíncrona e inclui tratamento de erros básico
