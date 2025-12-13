# Repecards - Frontend (React Native/Expo)

## Visão Geral

Repecards é um aplicativo móvel de aprendizado de idiomas baseado em repetição espaçada, desenvolvido com React Native e Expo. O app permite aos usuários aprender vocabulário através de flashcards interativos com diferentes tipos de questões.

## Tecnologias Utilizadas

- **React Native** 0.81.4
- **Expo** ~54.0.7
- **TypeScript** ~5.9.2
- **Expo Router** ~6.0.4 (navegação file-based)
- **React Native Reanimated** ~4.1.0 (animações)
- **i18n-js** 4.5.1 (internacionalização)
- **Jest** 29.2.1 + Testing Library (testes)

## Estrutura do Projeto

```
frontend/
├── app/                          # Screens (file-based routing)
│   ├── (tabs)/                  # Tab navigation group
│   │   ├── learn.tsx           # Tela principal de aprendizado
│   │   └── profile.tsx         # Perfil do usuário
│   ├── auth/                   # Autenticação
│   │   ├── sign-in.tsx
│   │   ├── select-language.tsx
│   │   └── callback.tsx
│   ├── review/                 # Sistema de revisão
│   │   ├── [deckId].tsx
│   │   └── components/
│   └── _layout.tsx             # Root layout com contexto de auth
├── components/                  # Componentes reutilizáveis
├── services/                    # Serviços (API, auth, i18n)
├── tests/                       # Testes automatizados
│   └── unit/
├── translations/                # Arquivos de tradução
└── docs/                        # Documentação técnica

```

## Instalação e Execução

### Pré-requisitos

- Node.js 18+ e npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Para iOS: Xcode e simulador iOS
- Para Android: Android Studio e emulador

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env na raiz com:
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### Executando o App

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou diretamente em uma plataforma
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

## Executando os Testes

### Suite Completa de Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage
```

### Estrutura dos Testes

Os testes estão organizados em:

- **`tests/unit/app/`** - Testes de telas e fluxos
- **`tests/unit/components/`** - Testes de componentes UI
- **`tests/unit/services/`** - Testes de lógica de negócio
- **`tests/unit/hooks/`** - Testes de hooks customizados

### Convenções de Teste

- Seguem o padrão AAA (Arrange-Act-Assert)
- Usam React Native Testing Library
- Mocks configurados para Expo e AsyncStorage
- Coverage configurado para ignorar arquivos de configuração

## Cobertura de Código

Para visualizar o relatório de cobertura completo:

```bash
npm run test:coverage
```

Depois abra o arquivo HTML gerado:

```bash
open coverage/lcov-report/index.html
```

**Métricas atuais:**

- Cobertura de linhas: **78%**
- Cobertura de branches: **65%**
- Arquivos críticos com 85%+: serviços de API, autenticação, i18n

Veja `docs/coverage-report.md` para análise detalhada.

## Scripts Disponíveis

| Script                  | Descrição                   |
| ----------------------- | --------------------------- |
| `npm start`             | Inicia o servidor Expo      |
| `npm test`              | Executa suite de testes     |
| `npm run test:watch`    | Testes em modo watch        |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run lint`          | Verifica código com ESLint  |
| `npm run ios`           | Roda no simulador iOS       |
| `npm run android`       | Roda no emulador Android    |

## Funcionalidades Principais

### Autenticação

- Login via Google OAuth
- Gerenciamento de sessão com JWT
- Persistência de token em AsyncStorage

### Aprendizado

- Sistema de repetição espaçada
- Múltiplos tipos de questões (múltipla escolha, texto livre, imagens)
- Progressão e estatísticas do usuário

### Internacionalização

- Suporte para Inglês e Português
- Persistência de preferência de idioma
- Interface completamente traduzida

### Animações

- Flip cards com React Native Reanimated
- Transições suaves entre telas
- Feedback visual nas respostas

## Debugging

O projeto inclui logs detalhados de bugs encontrados e corrigidos. Consulte `docs/debugging-log.md` para:

- Bug #1: Race condition no carregamento do idioma
- Bug #2: Vazamento de memória no login
- Bug #3: Estilização incorreta no modo escuro

## Otimizações de Performance

Implementações para melhorar performance:

- Uso de `React.memo` em componentes de lista
- Lazy loading de traduções
- Debouncing em inputs de busca
- Otimização de re-renderizações

Veja `docs/performance-analysis.md` para análise completa.

## Documentação Adicional

- [Relatório de Testes](docs/testing-report.md)
- [Análise de Cobertura](docs/coverage-report.md)
- [Log de Depuração](docs/debugging-log.md)
- [Análise de Performance](docs/performance-analysis.md)
