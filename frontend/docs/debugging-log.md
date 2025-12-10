# Registro de Depuração e Correção de Bugs

## Bug #1: Race Condition no Carregamento do Idioma
### Identificação
- **Data:** 2025-11-28
- **Reportado por:** Teste Automatizado (`tests/unit/services/i18n.test.ts`)
- **Severidade:** Alta
- **Módulo:** services/i18n.ts

### Descrição
O aplicativo iniciava com o idioma padrão ('en') mesmo quando o usuário já havia selecionado 'pt-BR' anteriormente, causando uma experiência inconsistente na splash screen.

### Reprodução
1. Abrir app
2. Mudar idioma para Português
3. Fechar e reabrir app
4. Resultado esperado: App em Português
5. Resultado obtido: App inicia em Inglês e depois "pisca" para Português

### Investigação
**Técnica:** Logging estratégico no `_layout.tsx` e `i18n.ts`.
**Causa Raiz:** O `i18n.locale` estava sendo definido de forma assíncrona, mas a renderização inicial não aguardava a leitura do AsyncStorage.

**Código Problemático (Antes):**
```typescript
// i18n.ts
const locale = AsyncStorage.getItem('user-locale').then(l => {
  i18n.locale = l || 'en';
});
```

### Correção (Depois): Transformamos a inicialização em um hook ou função assíncrona aguardada no SplashScreen.
```typescript

export const getLocale = async () => {
  const locale = await AsyncStorage.getItem('user-locale');
  return locale || i18n.defaultLocale;
  // No _layout.tsx, aguardamos essa Promise antes de esconder a Splash
};
```

### Verificação
✓ Teste unitário should return stored locale if available passou. 
✓ Teste manual confirmou persistência correta.

## Bug #2: Vazamento de Memória no Login
### Identificação
- **Data**: 2025-11-30
- **Módulo**: services/auth.ts
- **Severidade**: Média

### Descrição
Ao cancelar o login do Google no android, o app mantinha a sessão do navegador aberta ou em estado inconsistente.

### Investigação
Técnica: Análise de fluxo com debugger. Causa: Falta de tratamento adequado para WebBrowser.maybeCompleteAuthSession() em plataformas nativas vs web.

### Correção: Implementação de verificação de plataforma e tratamento explícito do resultado type !== 'success'.

## Bug #3: Estilização Incorreta no Modo Escuro
### Identificação
- **Data**: 2025-12-01
- **Módulo**: components/ThemedText.tsx
- **Descrição**
Textos do tipo "link" não alteravam a cor corretamente ao trocar o tema do sistema, ficando invisíveis no modo escuro.

### Correção
Uso correto do hook useThemeColor para garantir que a cor seja recalculada quando o contexto de tema mudar.

