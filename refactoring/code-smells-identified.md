# Identificação de Code Smells no Projeto

Este documento detalha três code smells identificados no código do projeto, explicando por que são problemáticos e onde se encontram.

### 1. Long Method

-   **Descrição:** O code smell Long Method ocorre quando uma função ou método cresce demais, acumulando muitas responsabilidades. Isso torna o código difícil de ler, entender e manter. Funções longas são mais propensas a bugs, pois é fácil se perder na lógica complexa.
-   **Localização:** O principal exemplo encontrado está no arquivo `backend/api/routes/review.ts`, especificamente dentro da rota `router.get('/session/general', ...)`.
-   **Problema:** A lógica para montar uma sessão de revisão geral está toda contida em um único bloco de `try/catch`. Ela é responsável por:
    1.  Buscar cards já vencidos para revisão.
    2.  Se não houver suficientes, buscar cards em aprendizado.
    3.  Se ainda não houver suficientes, buscar cards completamente novos.
    4.  Gerenciar os IDs dos cards já vistos para evitar duplicatas.
    5.  Mapear os resultados para o formato final da questão.
    Essa concentração de responsabilidades viola o **Princípio da Responsabilidade Única (Single Responsibility Principle)**.

### 2. Large Component

-   **Descrição:** Um "Componente Grande" concentra muitos estados, lógicas de UI, efeitos colaterais e renderização em um único arquivo. Isso o torna frágil, difícil de testar e quase impossível de reutilizar.
-   **Localização:** O arquivo `frontend/app/review/[deckId].tsx` é um exemplo claro deste problema.
-   **Problema:** Este arquivo gerencia:
    1.  O estado de carregamento da sessão (`loading`).
    2.  A lista de cartões da sessão (`sessionCards`).
    3.  O índice do cartão atual (`currentQuestionIndex`).
    4.  O estado da resposta (selecionada ou digitada).
    5.  O estado do resultado (se a resposta foi verificada, se está correta).
    6.  A lógica da animação de virar o cartão (`flipAnimation`).
    7.  A lógica de renderização para múltiplos tipos de questão (múltipla escolha com texto, múltipla escolha com imagem, resposta digitada).
    8.  A lógica de renderização do feedback.
    9.  Toda a estilização do componente.
    Essa complexidade em um único arquivo dificulta a manutenção. Por exemplo, uma mudança no estilo do botão de rodapé exige a rolagem por centenas de linhas de lógica de estado.

### 3. Duplicated Code

-   **Descrição:** Ocorre quando o mesmo bloco de código (ou um muito semelhante) aparece em vários lugares. A duplicação de código é perigosa porque, se for necessário corrigir um bug ou fazer uma alteração, é preciso lembrar de atualizar todos os locais, o que frequentemente não acontece.
-   **Localização:** No arquivo `backend/api/routes/review.ts`, a lógica para criar uma sessão de revisão está duplicada entre a rota `GET /session/general` e a rota `GET /deck/:deckId`.
-   **Problema:** Ambas as rotas realizam os seguintes passos:
    1.  Identificam um conjunto de cartões (seja geral ou de um deck específico).
    2.  Obtêm o progresso do usuário para esses cartões.
    3.  Iteram sobre os cartões selecionados.
    4.  Chamam a função `createQuestionData` para cada cartão.
    5.  Retornam a lista de `sessionQuestions`.
    Embora a lógica para *selecionar* os cartões seja diferente, o processo subsequente de *transformá-los* em questões é idêntico e poderia ser extraído para uma função compartilhada, evitando a repetição do `Promise.all` e da lógica de mapeamento.