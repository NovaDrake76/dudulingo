# Análise de Métricas de Qualidade

Este documento fornece uma análise qualitativa do impacto das refatorações nas métricas de qualidade do código do projeto Dudulingo. Como não foram utilizadas ferramentas de análise estática automatizada, a avaliação se baseia em princípios de engenharia de software.

### 1. Complexidade Ciclomática

-   **Antes:** A função da rota `GET /session/general` e o componente `Review` possuíam alta complexidade ciclomática. Eles continham múltiplos `if/else`, `switch cases` e loops aninhados, resultando em muitos caminhos de execução possíveis dentro de um único bloco de código. Isso torna os testes e a depuração extremamente difíceis.
-   **Depois:** Após a aplicação das técnicas "Extrair Método" e "Extrair Componente", a complexidade ciclomática de cada unidade individual foi drasticamente reduzida. Funções menores e componentes focados têm menos caminhos de execução, são mais fáceis de entender e possuem uma carga cognitiva menor para o desenvolvedor.

### 2. Coesão

-   **Antes:** A coesão era baixa, especialmente no arquivo `review.ts` e na tela `[deckId].tsx`. A rota de revisão geral, por exemplo, misturava lógicas de busca de diferentes tipos de dados (vencidos, em aprendizado, novos). O componente de UI misturava gerenciamento de estado, animação, lógica de API e renderização de múltiplos tipos de UI.
-   **Depois:** A refatoração aumentou significativamente a coesão. Cada nova função extraída no backend (`getDueCards`, `getLearningCards`) tem um propósito único e coeso. Da mesma forma, cada novo componente no frontend (`AnswerOptions`, `ReviewFooter`) tem uma única responsabilidade bem definida, resultando em alta coesão.

### 3. Acoplamento

-   **Antes:** Havia um forte acoplamento dentro dos arquivos. No frontend, a lógica de estilização estava fortemente acoplada à lógica de renderização e estado. Qualquer mudança em um aspecto poderia quebrar outro de forma inesperada.
-   **Depois:** O acoplamento foi reduzido. Ao extrair componentes e passar dados via `props`, a comunicação entre eles se torna explícita. Por exemplo, o componente `ReviewFooter` não precisa saber nada sobre o estado da sessão de revisão; ele apenas recebe `props` como `isCorrect` e `showResult` e renderiza a UI apropriada. Isso torna os componentes mais independentes e reutilizáveis.

### 4. Legibilidade e Manutenibilidade

-   **Antes:** O tamanho dos métodos e componentes tornava a leitura um desafio. Encontrar uma parte específica do código para corrigir um bug exigia rolagem excessiva e um esforço mental para entender todo o contexto.
-   **Depois:** A legibilidade melhorou drasticamente. Nomes de funções e componentes descritivos (`getDueCards`, `AnswerOptions`) servem como documentação. Arquivos menores são mais fáceis de carregar mentalmente. A manutenção se torna mais simples e segura, pois as alterações são localizadas em unidades de código pequenas e focadas.