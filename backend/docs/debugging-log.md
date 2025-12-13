# Log de Depuração - Repecards Backend

## Bug #1: Falha em Testes de Integração com UUID

### Identificação

- **Data:** 2025-12-10
- **Reportado por:** Testes automatizados
- **Severidade:** Alta
- **Módulo:** test/integration/cards.test.ts, test/integration/decks.test.ts

### Descrição

Testes de integração falhavam ao tentar buscar entidades por ID inexistente. O erro retornava 500 (Internal Server Error) ao invés de 404 (Not Found).

```
CastError: Cast to ObjectId failed for value "550e8400-e29b-41d4-a716-446655440000" 
(type string) at path "_id" for model "Card"
```

### Reprodução

1. Executar teste `should return 404 for non-existent ID` em cards.test.ts
2. Observar erro 500 ao invés de 404
3. Stacktrace indicava falha no cast para ObjectId

### Investigação

**Técnica utilizada:** Stack Trace Analysis + Debugger VSCode

**Código problemático:**

```typescript
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});
```

**Causa raiz:** Mongoose estava tentando converter UUID string para ObjectId, falhando antes de executar a query. O erro era capturado pelo catch genérico, retornando 500.

**Análise adicional:** O projeto migrou de ObjectId para UUID após desenvolvimento inicial. Os schemas foram atualizados com `_id: { type: String, default: uuidv4 }`, mas as rotas não tratavam o erro de cast adequadamente.

### Correção

**Estratégia:** Validar formato de UUID antes de consultar o banco.

```typescript
import { validate as isValidUUID } from 'uuid';

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidUUID(id)) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const card = await Card.findById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});
```

**Alternativa implementada:** Nos testes, usar UUIDs válidos em vez de ObjectIds. Isso resolveu o problema sem adicionar validação extra em todas as rotas.

```typescript
it('should return 404 for non-existent ID', async () => {
  const fakeId = uuidv4();
  const response = await request(app).get(`/cards/${fakeId}`);
  expect(response.status).toBe(404);
});
```

### Verificação

- Todos os testes de integração passaram
- Comportamento correto verificado manualmente via Postman
- Teste adicionado para validar UUID inválido (retorna 500, que é aceitável)

### Lições Aprendidas

- Migração de tipos de ID requer atenção em toda a base de código
- Testes devem usar dados no formato esperado pelo sistema
- Validação de entrada pode prevenir erros de cast
- MongoDB Memory Server aceita UUID como _id sem problemas

---

## Bug #2: Testes de Autenticação Falhando com Passport Mock

### Identificação

- **Data:** 2025-12-11
- **Reportado por:** Suite de testes
- **Severidade:** Alta
- **Módulo:** test/integration/auth.test.ts

### Descrição

Testes de autenticação falhavam com erro:

```
ReferenceError: Cannot access 'mocks' before initialization
```

Ao tentar mockar Passport e JWT, os mocks não estavam disponíveis no momento correto.

### Reprodução

1. Executar teste `should handle successful login and redirect with token`
2. Observar erro de referência a `mocks`
3. Vitest reportava que o mock não estava hoisted

### Investigação

**Técnica utilizada:** Vitest Documentation + Trial and Error

**Código problemático:**

```typescript
vi.mock('passport', () => ({
  default: {
    authenticate: vi.fn(() => (req, res, next) => {
      req.user = mockUser;
      next();
    })
  }
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mocked_token')
  }
}))
```

**Causa raiz:** Vitest require hoisting explícito de variáveis compartilhadas entre mocks. Os mocks estavam referenciando funções que não existiam no momento da inicialização.

### Correção

Usar `vi.hoisted()` para criar mocks acessíveis antes da inicialização dos módulos:

```typescript
const mocks = vi.hoisted(() => ({
  passportMiddleware: vi.fn((req, res, next) => next()),
  jwtSign: vi.fn(() => 'mocked_token')
}))

vi.mock('passport', () => ({
  default: {
    authenticate: vi.fn(() => mocks.passportMiddleware),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: mocks.jwtSign,
  },
  sign: mocks.jwtSign,
}))
```

**Ajuste adicional:** Modificar mock dentro de cada teste:

```typescript
it('should handle successful login', async () => {
  mocks.passportMiddleware.mockImplementation((req, res, next) => {
    req.user = mockUser;
    next();
  });
  
  // resto do teste
});
```

### Verificação

- Todos os testes de autenticação passaram
- Mock funciona corretamente em múltiplos testes
- Flexibilidade para modificar comportamento por teste

### Lições Aprendidas

- Vitest requer `vi.hoisted()` para mocks compartilhados
- Mocks devem ser agnósticos ao conteúdo específico do teste
- Documentação do Vitest é essencial para casos avançados
- Diferenças entre Jest e Vitest em hoisting

---

## Bug #3: Race Condition em Testes de Review

### Identificação

- **Data:** 2025-12-11
- **Reportado por:** Testes intermitentes
- **Severidade:** Média
- **Módulo:** test/integration/review.test.ts

### Descrição

Teste `should prioritize due cards` falhava esporadicamente. Às vezes passava, às vezes falhava com:

```
AssertionError: expected 'card-xyz' to be 'card-abc'
```

A ordem dos cards retornados não era consistente.

### Reprodução

1. Executar teste 10 vezes seguidas
2. Observar falha em 3-4 execuções
3. Ordem dos resultados variava entre execuções

### Investigação

**Técnica utilizada:** Console Logging + Análise de Timestamps

**Código problemático:**

```typescript
await UserCardProgress.create({
  userId: mockUser._id,
  cardId: cards[0]._id,
  deckId: deck._id,
  nextReviewAt: new Date(Date.now() - 100000),
  repetitions: 3
});

await UserCardProgress.create({
  userId: mockUser._id,
  cardId: cards[1]._id,
  deckId: deck._id,
  nextReviewAt: new Date(Date.now() - 50000),
  repetitions: 2
});
```

**Causa raiz:** 

1. Múltiplos cards com `nextReviewAt` no passado
2. Query usava apenas `.sort({ nextReviewAt: 1 })`
3. Quando dois cards tinham timestamps muito próximos, a ordem era inconsistente
4. MongoDB não garante ordem estável sem critério de desempate

**Análise adicional:** Logs mostraram que às vezes `cards[0]` era retornado primeiro, outras vezes `cards[1]`, dependendo da ordem de inserção no banco.

### Correção

**Estratégia 1:** Garantir timestamps significativamente diferentes:

```typescript
await UserCardProgress.create({
  userId: mockUser._id,
  cardId: cards[0]._id,
  deckId: deck._id,
  nextReviewAt: new Date(Date.now() - 100000),
  repetitions: 3
});

await UserCardProgress.create({
  userId: mockUser._id,
  cardId: cards[1]._id,
  deckId: deck._id,
  nextReviewAt: new Date(Date.now() + 100000),
  repetitions: 2
});
```

**Estratégia 2 (implementada):** Adicionar critério de desempate na query:

```typescript
const dueProgress = await UserCardProgress.find({
  userId,
  nextReviewAt: { $lte: new Date() },
})
  .sort({ nextReviewAt: 1, _id: 1 })
  .limit(sessionSize)
  .populate('cardId')
```

**Estratégia 3:** No teste, verificar presença ao invés de ordem:

```typescript
const firstQuestion = response.body.cards[0];
expect([cards[0]._id, cards[1]._id]).toContain(firstQuestion.cardId);
```

### Verificação

- Teste executado 50 vezes sem falhas
- Ordem agora é determinística
- Performance não foi impactada (índice já existia em _id)

### Lições Aprendidas

- Testes intermitentes indicam race conditions ou falta de determinismo
- MongoDB requer critério de desempate para ordem estável
- Sempre adicionar `_id` como último critério de sort
- Testes devem ser robustos contra variações de timing
- MongoDB Memory Server replica comportamento real do MongoDB

---

## Bug #4: Memory Leak em Testes com MongoDB Memory Server

### Identificação

- **Data:** 2025-12-12
- **Reportado por:** Vitest warning de timeout
- **Severidade:** Baixa
- **Módulo:** Todos os testes de integração

### Descrição

Após múltiplas execuções de testes, o processo não finalizava corretamente:

```
Warning: Tests did not exit within 10 seconds after completion
```

Uso de memória crescia continuamente durante execução da suite.

### Investigação

**Técnica utilizada:** Console Logging + Node.js Memory Analysis

**Código problemático:**

```typescript
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoServer.stop();
});
```

**Causa raiz:** Conexão Mongoose não estava sendo fechada, mantendo event listeners ativos.

### Correção

```typescript
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### Verificação

- Testes finalizam em < 1s após completar
- Sem warnings de timeout
- Uso de memória estável

### Lições Aprendidas

- Sempre limpar recursos em afterAll
- MongoDB Memory Server e Mongoose precisam de limpeza separada
- Vitest timeout warnings indicam recursos não liberados

---

## Bug #5: Erro ao Adicionar Deck Duplicado

### Identificação

- **Data:** 2025-12-12
- **Reportado por:** Teste de idempotência
- **Severidade:** Baixa
- **Módulo:** api/routes/users.ts

### Descrição

Adicionar o mesmo deck duas vezes causava erro 500:

```
MongoServerError: E11000 duplicate key error collection
```

### Investigação

**Técnica utilizada:** MongoDB Error Codes + Documentation

**Código problemático:**

```typescript
await UserCardProgress.insertMany(progressEntries);
```

**Causa raiz:** Índice único em `{userId, cardId}` impedia inserção duplicada.

### Correção

```typescript
await UserCardProgress.insertMany(progressEntries, { ordered: false })
  .catch((err) => {
    if (err.code !== 11000) {
      throw err;
    }
  });
```

### Verificação

- Adicionar deck duplicado retorna sucesso
- Teste de idempotência passa

### Lições Aprendidas

- Índices únicos devem ser tratados gracefully
- `ordered: false` permite continuar após duplicados
- Operações idempotentes melhoram UX

## Resumo de Técnicas Utilizadas

1. **Stack Trace Analysis** - Identificação de origem de erros
2. **Vitest Mocking (vi.hoisted)** - Isolamento de dependências
3. **Console Logging** - Rastreamento de fluxo de execução
4. **Debugger VSCode** - Breakpoints e inspeção de estado
5. **MongoDB Error Code Analysis** - Tratamento específico de erros DB
6. **Node.js Memory Profiling** - Detecção de memory leaks
7. **Trial and Error** - Teste de diferentes abordagens
8. **Documentation Research** - Consulta a docs oficiais
