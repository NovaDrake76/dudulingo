# Log de Refatoração do Projeto Dudulingo

Este documento registra as refatorações aplicadas para corrigir os code smells identificados.

### Refatoração 1: Extract Function

-   **Data:** 2025-08-29
-   **Code Smell Alvo:** Duplicated Code
-   **Localização:** Rotas `GET /session/general` e `GET /deck/:deckId` em `backend/api/routes/review.ts`.
-   **Técnica Aplicada:** "Extrair Função" para unificar a lógica repetida.
-   **Passos:**
    1.  A lógica de mapear uma lista de cartões (com seu progresso) para uma lista de questões (`Promise.all(...)`) foi extraída para uma nova função `buildSessionQuestions(cards, progressMap)`.
    2.  Ambas as rotas, após determinarem a lista de cartões para a sessão, agora chamam essa única função para gerar a resposta final.
-   **Resultado:** Eliminou-se a duplicação de código. Qualquer futura alteração na forma como as questões são montadas a partir dos cartões precisará ser feita em apenas um lugar, reduzindo a chance de inconsistências e bugs.

### Refatoração 2: Extract Method

-   **Data:** 2025-09-12
-   **Code Smell Alvo:** Long Method
-   **Localização:** Rota `GET /session/general` em `backend/api/routes/review.ts`.
-   **Técnica Aplicada:** A técnica "Extrair Método" foi usada para quebrar a função monolítica em partes menores e com nomes descritivos.
-   **Passos:**
    1.  A lógica de buscar cards vencidos foi movida para uma nova função assíncrona chamada `getDueCards(userId, limit)`.
    2.  A lógica de buscar cards em aprendizado foi movida para `getLearningCards(userId, limit, excludedIds)`.
    3.  A lógica de buscar cards novos foi movida para `getNewCards(userId, limit, excludedIds)`.
    4.  A rota principal agora orquestra as chamadas a essas funções, tornando seu fluxo de execução muito mais claro e legível. Cada função tem uma única responsabilidade.
-   **Resultado:** O código da rota principal ficou drasticamente menor e mais fácil de entender. Cada nova função pode ser testada de forma independente, e a lógica de negócio está melhor organizada. 

### Refatoração 3: Extract Component

-   **Data:** 2025-09-14
-   **Code Smell Alvo:** Large Component
-   **Localização:** `frontend/app/review/[deckId].tsx`.
-   **Técnica Aplicada:** A técnica "Extrair Componente" foi aplicada para dividir a tela de revisão em componentes menores e mais focados.
-   **Passos:**
    1.  Toda a estilização foi movida para um arquivo separado `styles.ts`, limpando o arquivo principal.
    2.  A lógica de renderização do "verso" do cartão foi extraída para um componente `FeedbackDisplay.tsx`.
    3.  A lógica de renderização da "frente" do cartão foi extraída para `QuestionDisplay.tsx`.
    4.  A renderização das opções de múltipla escolha foi movida para `AnswerOptions.tsx`.
    5.  O campo de texto para respostas digitadas foi movido para `AnswerInput.tsx`.
    6.  O rodapé com os botões "Verificar" e "Próximo" foi extraído para `ReviewFooter.tsx`.
-   **Resultado:** O componente principal `Review` agora é responsável principalmente pelo gerenciamento do estado e pela orquestração dos subcomponentes. Cada componente filho é responsável apenas por sua própria renderização, tornando o código mais modular, reutilizável e fácil de navegar.

