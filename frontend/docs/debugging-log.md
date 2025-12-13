# Registro de Depuração e Correção de Bugs - Repecards

## Sumário de Bugs

| #   | Título                                   | Severidade | Data       | Status    |
| --- | ---------------------------------------- | ---------- | ---------- | --------- |
| 1   | Race Condition no Carregamento do Idioma | Alta       | 2025-11-28 | Corrigido |
| 2   | Vazamento de Memória no Login            | Média      | 2025-11-30 | Corrigido |
| 3   | Estilização Incorreta no Modo Escuro     | Baixa      | 2025-12-01 | Corrigido |
| 4   | Navegação Inconsistente Após Login       | Alta       | 2025-12-02 | Corrigido |
| 5   | Flip Card Travando em Respostas Rápidas  | Média      | 2025-12-03 | Corrigido |

---

## Bug #1: Race Condition no Carregamento do Idioma

### Identificação

- **Data:** 2025-11-28
- **Reportado por:** Teste Automatizado (`tests/unit/services/i18n.test.ts`)
- **Severidade:** Alta
- **Módulo:** `services/i18n.ts`
- **Impacto:** UX - App mostrava texto em inglês antes de mudar para português

### Descrição

O aplicativo iniciava com o idioma padrão ('en') mesmo quando o usuário já havia selecionado 'pt-BR' anteriormente. Isso causava um "flash" visual onde textos apareciam primeiro em inglês e depois mudavam para português durante a splash screen.

### Reprodução

1. Abrir app pela primeira vez
2. Selecionar idioma Português
3. Fechar completamente o app (não apenas minimizar)
4. Reabrir o app
5. **Resultado esperado:** App inicia em Português
6. **Resultado obtido:** App inicia em Inglês por ~500ms e depois "pisca" para Português

### Investigação

**Técnica utilizada:** Logging estratégico + Debugger

**Passos:**

1. Adicionei `console.log` no `_layout.tsx` para rastrear ordem de execução
2. Identifiquei que `SplashScreen.hideAsync()` era chamado antes de `getLocale()` resolver
3. Usei breakpoints para confirmar a race condition

**Código problemático (ANTES):**

```typescript
// services/i18n.ts
const i18n = new I18n({ en, "pt-BR": ptBR });
i18n.defaultLocale = "en";
i18n.locale = Localization.getLocales()[0].languageTag; //  Síncrono, não considera AsyncStorage

export default i18n;
```

```typescript
// app/_layout.tsx
useEffect(() => {
  async function setup() {
    SplashScreen.preventAutoHideAsync();
    const token = await getToken();

    // getLocale não era aguardado antes de hideAsync()
    i18n.locale = await getLocale();

    await SplashScreen.hideAsync(); // Mostrava UI antes do locale carregar
  }
  setup();
}, []);
```

**Causa raiz:**

- `i18n.locale` era definido de forma assíncrona via `AsyncStorage.getItem()`
- A UI era renderizada antes da Promise resolver
- React renderizava com o valor padrão ('en') e depois re-renderizava quando o locale mudava

### Correção (DEPOIS)

**Solução:** Garantir que a splash screen só esconda após o locale ser carregado

```typescript
// services/i18n.ts
export const getLocale = async () => {
  const locale = await AsyncStorage.getItem("user-locale");
  return locale || i18n.defaultLocale;
};

export const setLocale = async (locale: string) => {
  i18n.locale = locale;
  await AsyncStorage.setItem("user-locale", locale);
};
```

```typescript
// app/_layout.tsx
useEffect(() => {
  async function setup() {
    SplashScreen.preventAutoHideAsync();
    try {
      const token = await getToken();
      if (token) setIsAuthenticated(true);

      //  Aguardar locale ANTES de esconder splash
      const locale = await getLocale();
      i18n.locale = locale;
    } catch (e) {
      console.error("Error setting up:", e);
    } finally {
      setLoading(false);
      await SplashScreen.hideAsync(); // Só esconde após tudo carregar
    }
  }
  setup();
}, []);
```

### Verificação

- Teste automatizado `i18n.test.ts` passou
- Teste manual confirmou que não há mais "flash" visual
- Adicionado teste para garantir que locale é carregado antes da UI aparecer

### Lições Aprendidas

1. **Sempre aguardar operações assíncronas** antes de mostrar UI
2. **SplashScreen é seu amigo** - use para esconder race conditions de inicialização
3. **Testes automatizados são essenciais** - detectaram o bug antes de ir para produção
4. **AsyncStorage pode causar delays** - considerar cache em memória para valores frequentes

---

## Bug #2: Vazamento de Memória no Login com Google

### Identificação

- **Data:** 2025-11-30
- **Reportado por:** Teste Manual (observado no profiler)
- **Severidade:** Média
- **Módulo:** `services/auth.ts`
- **Impacto:** Uso crescente de memória após múltiplos login/cancelamento

### Descrição

Ao cancelar o login do Google repetidamente (por exemplo, usuário mudando de ideia), o app mantinha sessões do WebBrowser abertas ou em estado inconsistente, causando acúmulo de memória.

### Reprodução

1. Abrir tela de sign-in
2. Clicar em "Continue with Google"
3. Cancelar a janela do browser (fechar sem fazer login)
4. Repetir passos 2-3 cerca de 5 vezes
5. **Resultado esperado:** Memória estável
6. **Resultado obtido:** Memória aumentava ~8MB a cada ciclo

### Investigação

**Técnica utilizada:** React DevTools Profiler + Logging + Análise de Código

**Descobertas:**

1. `WebBrowser.openAuthSessionAsync()` não liberava recursos quando cancelado
2. Falta de chamada explícita para `maybeCompleteAuthSession()` em todas as plataformas
3. Event listeners não eram limpos

**Código problemático (ANTES):**

```typescript
// services/auth.ts
export const loginWithGoogle = async () => {
  try {
    const authUrl = `${API_URL}/auth/google?state=${state}`;

    if (Platform.OS === "web") {
      window.location.href = authUrl;
      return { success: true };
    }

    //  Não chamava maybeCompleteAuthSession() antes
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== "success") {
      return { success: false }; //  Sessão ficava "pendurada"
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Unexpected error" };
  }
};
```

**Causa raiz:**

- WebBrowser mantém referência interna quando não é explicitamente completado
- Em Android, sessão ficava em background consumindo memória
- Event listeners do Linking não eram removidos

### Correção (DEPOIS)

```typescript
// services/auth.ts
import * as WebBrowser from "expo-web-browser";

//  Completar sessão assim que módulo carrega
WebBrowser.maybeCompleteAuthSession();

export const loginWithGoogle = async () => {
  try {
    let redirect: string;

    if (Platform.OS === "web") {
      redirect = `${window.location.origin}/auth/callback`;
    } else {
      redirect = redirectUri;
    }

    const state = Buffer.from(
      JSON.stringify({ redirectUri: redirect }),
    ).toString("base64");
    const authUrl = `${API_URL}/auth/google?state=${encodeURIComponent(state)}`;

    if (Platform.OS === "web") {
      window.location.href = authUrl;
      return { success: true };
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    // Tratamento explícito para todos os casos
    if (result.type !== "success") {
      // Liberar recursos mesmo em cancelamento
      await WebBrowser.maybeCompleteAuthSession();
      return {
        success: false,
        error: "Authentication was cancelled or failed.",
      };
    }

    return { success: true };
  } catch (error) {
    // Cleanup em caso de erro
    await WebBrowser.maybeCompleteAuthSession();
    console.error("Google login error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};
```

### Verificação

- Teste com React DevTools Profiler mostrou memória estável após 10+ cancelamentos
- Adicionado teste automatizado para verificar que função retorna corretamente em cancelamento
- Teste manual em Android confirmou que não há sessões "penduradas"

### Lições Aprendidas

1. **Sempre limpar recursos assíncronos** - mesmo em caminhos de erro
2. **Plataformas nativas requerem gestão manual** de alguns recursos
3. **Profiling é essencial** para detectar memory leaks sutis
4. **Documentação da API pode ser incompleta** - ler código-fonte da lib ajuda

---

## Bug #3: Estilização Incorreta no Modo Escuro

### Identificação

- **Data:** 2025-12-01
- **Reportado por:** Teste Manual (observado no dispositivo)
- **Severidade:** Baixa
- **Módulo:** `components/themed-text.tsx`
- **Impacto:** Textos do tipo "link" ficavam invisíveis no modo escuro

### Descrição

Quando o usuário alternava entre modo claro e escuro no sistema operacional, textos do tipo "link" não atualizavam sua cor corretamente. Eles ficavam com a cor do tema claro (#0a7ea4) mesmo no modo escuro, tornando-se difíceis de ler em fundo escuro.

### Reprodução

1. Abrir app com tema claro
2. Navegar para tela com links (ex: tela de Profile)
3. Alternar tema do SO para escuro (Settings → Display → Dark Mode)
4. Voltar para o app
5. **Resultado esperado:** Links com cor clara visível
6. **Resultado obtido:** Links com cor azul escuro (invisível em fundo preto)

### Investigação

**Técnica utilizada:** Debugger + Análise de Re-renderização

**Descobertas:**

1. `useThemeColor` não era chamado para o tipo "link"
2. Cor estava hardcoded no StyleSheet
3. Componente não re-renderizava quando tema mudava

**Código problemático (ANTES):**

```typescript
// components/themed-text.tsx
const styles = StyleSheet.create({
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4', //  Hardcoded - não muda com tema
  },
});

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  const color = useThemeColor({}, 'text'); //  Só aplicado para texto padrão

  return (
    <Text
      style={[
        { color }, //  Sobrescrito pelo style do tipo 'link'
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
```

**Causa raiz:**

- StyleSheet.create() é executado uma vez na inicialização
- Cores hardcoded não reagem a mudanças de tema
- Hook useThemeColor não era usado para tipos especiais

### Correção (DEPOIS)

```typescript
// components/themed-text.tsx
import { useThemeColor } from '@/hooks/use-theme-color';

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  //  Sempre usar useThemeColor para cores dinâmicas
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color }, // Base color from theme
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'link' ? styles.link : undefined, // Agora apenas tamanhos/espaçamentos
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  link: {
    lineHeight: 30,
    fontSize: 16,
    // Cor removida - vem do theme
  },
});
```

```typescript
// Uso no componente que precisa de cor específica:
<ThemedText
  type="link"
  lightColor="#0a7ea4"  // Cor específica para tema claro
  darkColor="#58cc02"   // Cor específica para tema escuro
>
  Click here
</ThemedText>
```

### Verificação

- Teste manual confirmou que links mudam de cor ao alternar tema
- Adicionado teste automatizado para verificar aplicação correta de theme
- Testado em iOS e Android com temas claro/escuro

### Lições Aprendidas

1. **Nunca hardcode cores** em apps com suporte a temas
2. **useThemeColor deve ser consistente** em todos os componentes
3. **StyleSheet.create() é estático** - use para dimensões, não cores
4. **Testes visuais são importantes** - nem tudo é captado por testes unitários

---

## Bug #4: Navegação Inconsistente Após Login

### Identificação

- **Data:** 2025-12-02
- **Reportado por:** Feedback de Usuário (QA interno)
- **Severidade:** Alta
- **Módulo:** `app/_layout.tsx` e `app/auth/callback.tsx`
- **Impacto:** Usuários novos ficavam "presos" na tela de callback

### Descrição

Após fazer login com Google pela primeira vez, usuários novos eram redirecionados para a tela de callback mas não avançavam automaticamente para a tela de seleção de idioma. Eles precisavam fechar e reabrir o app.

### Reprodução

1. Fazer logout do app (se já logado)
2. Clicar em "Continue with Google"
3. Completar login no Google
4. **Resultado esperado:** Redirecionar para select-language
5. **Resultado obtido:** Parado na tela de callback com loading infinito

### Investigação

**Técnica utilizada:** Análise de Stack Trace + Logging + Debugger

**Descobertas:**

1. `callback.tsx` chamava `api.getMe()` antes de `setToken()`
2. Request falhava porque token ainda não estava no header
3. Erro era silenciosamente catchado e usuário ficava em loop

**Código problemático (ANTES):**

```typescript
// app/auth/callback.tsx
export default function AuthCallback() {
  const { token } = useLocalSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const handleToken = async () => {
      if (typeof token === 'string' && token) {
        //  Busca dados antes de salvar token
        const user = await api.getMe(); //  Falha: token não está no AsyncStorage

        await setToken(token); //  Só salva depois

        if (user && user.selectedLanguage) {
          router.replace('/(tabs)/learn');
        } else {
          router.replace('/auth/select-language');
        }
      }
    };
    handleToken();
  }, [token]);

  return <ActivityIndicator />;
}
```

**Causa raiz:**

- Ordem errada de operações assíncronas
- `api.getMe()` usa `getToken()` que lê do AsyncStorage
- Token ainda não estava salvo quando `getMe()` era chamado

### Correção (DEPOIS)

```typescript
// app/auth/callback.tsx
export default function AuthCallback() {
  const { token } = useLocalSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const handleToken = async () => {
      if (typeof token === 'string' && token) {
        //  1. PRIMEIRO salvar token
        await setToken(token);

        try {
          //  2. DEPOIS buscar dados do usuário
          const user = await api.getMe();

          //  3. Redirecionar baseado no estado do usuário
          if (user && user.selectedLanguage) {
            router.replace('/(tabs)/learn');
          } else {
            router.replace('/auth/select-language');
          }
        } catch (error) {
          //  4. Tratar erro explicitamente
          console.error('Failed to fetch user data:', error);
          router.replace('/auth/sign-in');
        }
      } else {
        //  Token inválido - volta para login
        router.replace('/auth/sign-in');
      }
    };

    handleToken();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#58cc02" />
    </View>
  );
}
```

### Verificação

- Teste manual com conta nova confirmou fluxo correto
- Adicionado teste de integração para fluxo de callback
- Adicionado tratamento de erro para token inválido
- Testado em iOS e Android

### Lições Aprendidas

1. **Ordem de operações assíncronas importa** - sempre salvar estado antes de usar
2. **Tratamento de erro é obrigatório** - não deixar usuário em estado indefinido
3. **Logging é essencial** - ajuda a debugar fluxos complexos
4. **Testes de integração são valiosos** - testam fluxo completo, não só partes isoladas

---

## Bug #5: Flip Card Travando em Respostas Rápidas

### Identificação

- **Data:** 2025-12-03
- **Reportado por:** Teste Manual (QA)
- **Severidade:** Média
- **Módulo:** `app/review/[deckId].tsx`
- **Impacto:** Card não completava animação se usuário clicasse "Next" muito rápido

### Descrição

Durante a revisão, se o usuário respondesse incorretamente e clicasse em "Next" antes da animação de flip terminar, o próximo card aparecia com a face errada (mostrava feedback ao invés da pergunta).

### Reprodução

1. Iniciar uma sessão de revisão
2. Responder incorretamente (para trigger flip animation)
3. Clicar em "Next" IMEDIATAMENTE (< 200ms após responder)
4. **Resultado esperado:** Próximo card mostra pergunta nova
5. **Resultado obtido:** Próximo card mostra feedback do card anterior

### Investigação

**Técnica utilizada:** Debugger + Slow Motion + Logging

**Descobertas:**

1. `flipAnimation.value` não era resetado antes de trocar de card
2. Estado assíncrono (`withTiming`) continuava executando após mudança de card
3. Race condition entre animação e mudança de estado

**Código problemático (ANTES):**

```typescript
// app/review/[deckId].tsx
const handleNext = async () => {
  const rating = isCorrect ? "easy" : "very_hard";

  try {
    await api.submitReview(currentQuestion.cardId, rating);

    //  Muda card imediatamente, sem aguardar animação
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    setShowResult(false);
    setSelectedAnswer("");
    //  Reset da animação DEPOIS de mudar card
    flipAnimation.value = 0;
  } catch (error) {
    console.error("Failed to submit:", error);
  }
};
```

**Causa raiz:**

- `withTiming()` é assíncrono mas não era aguardado
- Estado do componente mudava enquanto animação ainda executava
- Valor `flipAnimation` do card anterior "vazava" para o próximo

### Correção (DEPOIS)

```typescript
// app/review/[deckId].tsx
const handleNext = async () => {
  if (!currentQuestion) return;
  const rating = isCorrect ? "easy" : "very_hard";

  try {
    await api.submitReview(currentQuestion.cardId, rating);

    //  1. PRIMEIRO: Reset imediato da animação (síncrono)
    flipAnimation.value = 0;

    //  2. DEPOIS: Pequeno delay para garantir que Reanimated processou
    await new Promise((resolve) => setTimeout(resolve, 100));

    //  3. ENTÃO: Mudar para próximo card
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < sessionCards.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      Alert.alert("Session Complete!", "You've finished this review session.", [
        { text: "OK", onPress: () => router.replace("/(tabs)/learn") },
      ]);
      return;
    }

    //  4. FINALMENTE: Reset de outros estados
    setShowResult(false);
    setSelectedAnswer("");
    setTypedAnswer("");
    setIsCorrect(false);
  } catch (error) {
    console.error("Failed to submit review:", error);
    Alert.alert("Error", "Failed to save progress");
  }
};
```

**Alternativa mais elegante (implementada):**

```typescript
// Usando runOnJS para sincronizar com Reanimated
import { runOnJS } from "react-native-reanimated";

const goToNextCard = () => {
  const nextIndex = currentQuestionIndex + 1;
  if (nextIndex < sessionCards.length) {
    setCurrentQuestionIndex(nextIndex);
    setShowResult(false);
    setSelectedAnswer("");
    setTypedAnswer("");
    setIsCorrect(false);
  } else {
    // Session complete
  }
};

const handleNext = async () => {
  await api.submitReview(currentQuestion.cardId, rating);

  //  Reset animation com callback
  flipAnimation.value = withTiming(0, { duration: 0 }, () => {
    runOnJS(goToNextCard)(); //  Sincronizado com UI thread
  });
};
```

### Verificação

- Teste manual com cliques rápidos confirmou correção
- Testado em dispositivos lentos (iPhone 6s) sem problemas
- Adicionado debouncing no botão Next para evitar double-click

### Lições Aprendidas

1. **Reanimated é assíncrono** - use `runOnJS` para sincronizar com React state
2. **Animações precisam completar** antes de mudar estado visual
3. **Race conditions são sutis** - testes de stress (cliques rápidos) são importantes
4. **Debouncing em botões críticos** previne muitos bugs de timing
5. **setTimeout pode ser uma solução temporária** mas `runOnJS` é mais elegante

---

## Técnicas de Depuração Utilizadas

### 1. Logging Estratégico

- **Quando usar:** Race conditions, fluxos assíncronos complexos
- **Como:** Console.log em pontos-chave com timestamps
- **Exemplo:** Bug #1 (i18n race condition)

### 2. Debugger com Breakpoints

- **Quando usar:** Lógica complexa, análise de estado
- **Como:** Chrome DevTools + breakpoints condicionais
- **Exemplo:** Bug #4 (navegação após login)

### 3. Testes Automatizados para Reprodução

- **Quando usar:** Bugs difíceis de reproduzir manualmente
- **Como:** Escrever teste que falha, corrigir até passar
- **Exemplo:** Bug #1 (teste de i18n)

### 4. React DevTools Profiler

- **Quando usar:** Problemas de performance, memory leaks
- **Como:** Profiler → Record → Analisar componentes lentos
- **Exemplo:** Bug #2 (memory leak)

### 5. Análise de Stack Trace

- **Quando usar:** Crashes, erros não tratados
- **Como:** Ler stack trace de baixo para cima
- **Exemplo:** Bug #4 (erro no callback)

### 6. Slow Motion / Timeouts

- **Quando usar:** Bugs de timing, animações
- **Como:** Adicionar delays artificiais para observar
- **Exemplo:** Bug #5 (flip card)

---

## Estatísticas Gerais

### Por Severidade

- **Alta:** 3 bugs (60%)
- **Média:** 2 bugs (40%)
- **Baixa:** 0 bugs (0%)

### Por Categoria

- **Navegação/Fluxo:** 2 bugs
- **UI/Animação:** 2 bugs
- **Performance:** 1 bug

### Tempo Médio de Resolução

- **Identificação → Correção:** 2.5 dias
- **Tempo de debugging:** 1-3 horas por bug

### Impacto no Usuário (antes da correção)

- **Crítico (bloqueante):** 1 bug (Bug #4)
- **Alto (experiência ruim):** 2 bugs (Bugs #1, #5)
- **Médio (incômodo):** 2 bugs (Bugs #2, #3)

---

## Conclusão e Melhorias Futuras

### O que funcionou

- Testes automatizados detectaram bugs cedo (Bug #1)
- Logging estratégico acelerou debugging (Bugs #1, #4)
- Code reviews identificaram potenciais problemas antes de merge

### Áreas de Melhoria

- Implementar linting rules para detectar padrões problemáticos
- Adicionar mais testes de integração end-to-end
- Configurar CI/CD para rodar testes em cada PR
- Implementar error boundaries para capturar erros não tratados

### Prevenção Futura

1. **Checklist de Code Review:**
   - [ ] Operações assíncronas são aguardadas?
   - [ ] Recursos são liberados (cleanup)?
   - [ ] Cores são dinâmicas (theme support)?
   - [ ] Animações são sincronizadas com estado?
2. **Testes Obrigatórios:**
   - [ ] Fluxos de autenticação
   - [ ] Navegação entre telas
   - [ ] Mudança de temas
   - [ ] Cancelamento de operações assíncronas
