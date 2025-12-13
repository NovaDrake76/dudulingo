# Repecards Backend

API RESTful para aplicação de aprendizado de idiomas com sistema de repetição espaçada (SRS).

## Tecnologias

- Node.js 20+
- Express 5
- TypeScript
- MongoDB + Mongoose
- Passport (Google OAuth, JWT)
- Vitest (testes)

## Requisitos

- Node.js >= 20.17.0
- MongoDB >= 6.0
- npm >= 8.0

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=mongodb://localhost:27017/dudulingo
JWT_SECRET=sua_chave_secreta_aqui
GOOGLE_CLIENT_ID=seu_client_id_google
GOOGLE_CLIENT_SECRET=seu_client_secret_google
API_URL=http://localhost:8000
IS_DEV=true
PORT=8000
```

## Executando

### Desenvolvimento

```bash
npm run dev
```

### Seed do banco de dados

```bash
npm run db:seed
```

## Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes com cobertura

```bash
npm run coverage
```

### Gerar relatório HTML de cobertura

```bash
npm run test:report
```

### Interface de cobertura

```bash
npm run coverage:ui
```

Os relatórios são gerados em `./html/coverage/`

## Estrutura de Testes

```
test/
├── unit/              # Testes unitários
│   ├── db.test.ts
│   ├── schema.test.ts
│   └── srs.test.ts
└── integration/       # Testes de integração
    ├── auth.test.ts
    ├── cards.test.ts
    ├── decks.test.ts
    ├── review.test.ts
    └── users.test.ts
```

## Estrutura do Projeto

```
api/
├── auth/              # Estratégias de autenticação
│   ├── googleStrategy.ts
│   └── jwtStrategy.ts
├── db/                # Banco de dados
│   ├── fixtures.ts
│   ├── index.ts
│   ├── schema.ts
│   └── seed.ts
├── routes/            # Rotas da API
│   ├── auth.ts
│   ├── cards.ts
│   ├── decks.ts
│   ├── review.ts
│   └── users.ts
├── srs.ts            # Algoritmo de repetição espaçada
└── index.ts          # Ponto de entrada
```

## API Endpoints

### Autenticação

- `GET /auth/google` - Inicia autenticação OAuth
- `GET /auth/google/callback` - Callback OAuth

### Cards

- `GET /cards` - Lista todos os cards
- `GET /cards/:id` - Busca card por ID
- `POST /cards` - Cria novo card
- `PUT /cards/:id` - Atualiza card
- `DELETE /cards/:id` - Remove card

### Decks

- `GET /decks` - Lista todos os decks
- `GET /decks/:id` - Busca deck por ID
- `POST /decks` - Cria novo deck
- `PUT /decks/:id` - Atualiza deck
- `DELETE /decks/:id` - Remove deck

### Review

- `GET /review/session/general` - Sessão geral de revisão
- `GET /review/deck/:deckId` - Sessão de revisão por deck
- `POST /review` - Registra resposta do usuário

### Users

- `GET /users/me` - Dados do usuário autenticado
- `POST /users/language` - Atualiza idioma preferido
- `POST /users/decks/:deckId` - Adiciona deck ao usuário
- `GET /users/stats` - Estatísticas de progresso

## Métricas de Qualidade

### Cobertura de Testes

- Linhas: 78%
- Branches: 65%
- Módulos críticos: 85%+

### Padrões de Código

- ESLint configurado
- Prettier para formatação
- TypeScript strict mode

## Scripts Disponíveis

- `npm run dev` - Servidor em modo desenvolvimento
- `npm run lint` - Executa linter
- `npm run format` - Formata código
- `npm test` - Executa testes
- `npm run coverage` - Cobertura de testes
- `npm run db:seed` - Popula banco com dados iniciais

## Documentação Adicional

- [Testing Report](docs/testing-report.md)
- [Coverage Report](docs/coverage-report.md)
- [Debugging Log](docs/debugging-log.md)
- [Performance Analysis](docs/performance-analysis.md)