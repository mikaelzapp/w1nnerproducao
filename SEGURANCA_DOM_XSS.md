# Guia de Segurança: Prevenção de DOM XSS

## Visão Geral

O Cross-Site Scripting baseado em DOM (DOM XSS) é uma vulnerabilidade do lado do cliente na qual dados controlados pelo invasor (por exemplo, de location.search, location.hash, document.referrer, armazenamento do navegador, postMessage, WebSockets) são lidos por JavaScript e gravados em coletores DOM/JS perigosos sem validação ou codificação adequadas, fazendo com que o código seja executado inteiramente no navegador.

O payload pode ser entregue pelo servidor ou por outros canais, mas — ao contrário do XSS refletido ou armazenado — o servidor não realiza a injeção/eco que aciona a execução; o problema crítico é um fluxo de dados contaminado da origem para o coletor dentro da lógica do lado do cliente, o que as defesas tradicionais do lado do servidor e muitos WAFs frequentemente ignoram.

## Impacto

A mitigação eficaz de vulnerabilidades XSS do DOM requer a implementação de estratégias abrangentes de validação de entrada e codificação de saída, projetadas especificamente para contextos de execução do lado do cliente. Isso inclui o estabelecimento de mecanismos rigorosos de lista de permissões para dados controláveis ​​pelo usuário, a implementação de codificação de saída com reconhecimento de contexto com base na operação específica do DOM que está sendo executada e a adoção de práticas de codificação seguras que minimizem a superfície de ataque exposta por APIs DOM/JavaScript perigosas.

Ataques DOM XSS têm sido amplamente documentados em pesquisas de segurança e são frequentemente explorados para atingir diversos objetivos maliciosos, incluindo:

- **Sequestro de sessão** por meio de roubo de cookies
- **Coleta de credenciais** por meio de ataques de phishing
- **Ações não autorizadas** realizadas em nome de usuários autenticados
- **Distribuição de malware** do lado do cliente
- **Exfiltração de dados confidenciais**

A natureza do lado do cliente desses ataques os torna eficazes para contornar os controles tradicionais de segurança de perímetro e atingir usuários diretamente em seu ambiente de navegador.

## Tipos de Ataques

### 1. Injeção de Parâmetros de URL
**Categoria:** Navegação

**Descrição:** Cargas maliciosas incorporadas em parâmetros de consulta de URL que são processadas por código JavaScript vulnerável que acessa `location.search` ou propriedades semelhantes.

**Detalhes Técnicos:** Explorações comuns `URLSearchParams`, análise direta de strings ou mecanismos de roteamento de framework que processam parâmetros de consulta de forma insegura (incluindo atualizações da API de histórico como `pushState`).

### 2. Exploração do Identificador de Fragmentos
**Categoria:** Navegação

**Descrição:** Vetores de ataque que utilizam fragmentos de hash de URL (`#`) que são acessíveis via `location.hash` e processados ​​por meio de roteamento do lado do cliente ou mecanismos de carregamento de conteúdo.

**Detalhes Técnicos:** Particularmente prevalente em aplicativos de página única (SPAs) com estruturas de roteamento do lado do cliente que processam navegação baseada em hash.

### 3. Manipulação de Referenciador HTTP
**Categoria:** Contexto da solicitação

**Descrição:** Exploração de valores `document.referrer` que contêm cargas maliciosas, normalmente originadas de sites controlados pelo invasor com links para o aplicativo vulnerável.

**Detalhes Técnicos:** Requer engenharia social para direcionar usuários de domínios controlados pelo invasor com valores de referência elaborados.

### 4. Ataques de Armazenamento do Navegador
**Categoria:** Armazenamento Persistente

**Descrição:** Injeção de dados maliciosos em `localStorage`, `sessionStorage`, ou `IndexedDB` que são posteriormente lidos e processados ​​de forma insegura pelo JavaScript do aplicativo.

**Detalhes Técnicos:** Pode persistir entre sessões se o invasor conseguir armazenar dados (por meio de outro bug ou engenharia social) e pode ser combinado com outros vetores para exploração em estágios.

### 5. Comunicação entre Quadros
**Categoria:** Mensagens entre quadros

**Descrição:** Exploração de APIs `postMessage` onde dados maliciosos são transmitidos entre quadros ou janelas e processados ​​sem validação de origem adequada e higienização de entrada.

**Detalhes Técnicos:** Comum em aplicativos com iframes incorporados ou janelas pop-up que implementam mecanismos de comunicação de origem cruzada.

### 6. Injeção de Mensagem WebSocket
**Categoria:** Comunicação em tempo real

**Descrição:** Cargas maliciosas entregues por meio de conexões WebSocket que são processadas por manipuladores de mensagens do lado do cliente sem validação de entrada adequada.

**Detalhes Técnicos:** Particularmente eficaz contra aplicativos em tempo real, como sistemas de bate-papo, ferramentas colaborativas ou feeds de dados ao vivo.

## Ambientes Afetados

Vulnerabilidades DOM XSS podem impactar diversas categorias de aplicativos web e ambientes do lado do cliente:

- ✅ **Aplicativos de página única (SPAs)** que utilizam estruturas como React, Angular, Vue.js ou implementações personalizadas de JavaScript
- ✅ **Aplicações Web Progressivas (PWAs)** com ampla funcionalidade do lado do cliente e recursos offline
- ✅ **Implementações de roteamento do lado do cliente**, incluindo mecanismos de roteamento baseados em hash e API de histórico HTML5
- ✅ **Extensões e complementos de navegador** com injeção de script de conteúdo e recursos de interação com páginas da web
- ✅ **Aplicações móveis híbridas** utilizando componentes WebView e implementações de ponte JavaScript
- ✅ **Rich Internet Applications (RIAs)** com lógica de negócios complexa do lado do cliente e manipulação de DOM
- ✅ **Sistemas de gerenciamento de conteúdo (CMS)** com interfaces de edição do lado do cliente e renderização dinâmica de conteúdo
- ✅ **Plataformas e widgets de mídia social** que implementam funcionalidade de incorporação e compartilhamento de conteúdo do lado do cliente

## Melhores Práticas para Prevenção

### 1. Validação e Sanitização de Entrada

#### ✅ Validação Rigorosa
Implemente validação de entrada rigorosa para todas as fontes de dados do lado do cliente, incluindo:
- Parâmetros de URL
- Identificadores de fragmentos
- Valores de referência
- Mecanismos de armazenamento
- Comunicações entre quadros

**Use abordagens de lista de permissões (whitelist) em vez de metodologias de lista negra (blacklist).**

#### ✅ Codificação de Saída Contextual
Estabeleça uma codificação de saída apropriada para o contexto DOM específico:
- **Codificação de entidade HTML** para conteúdo HTML
- **Escape de string JavaScript** para contextos JavaScript
- **Codificação de valor CSS** para estilos
- **Codificação de parâmetro de URL** para URLs

#### ✅ Validação de Origem para postMessage
Valide a origem e a integridade dos dados para comunicações entre quadros:

\`\`\`typescript
window.addEventListener('message', (event) => {
  // Validar origem
  if (event.origin !== 'https://trusted-domain.com') {
    return;
  }
  
  // Validar formato da mensagem
  if (typeof event.data !== 'object' || !event.data.type) {
    return;
  }
  
  // Processar mensagem de forma segura
  handleMessage(event.data);
});
\`\`\`

#### ✅ Sanitização de Armazenamento Persistente
Limpe os dados de armazenamento persistente validando todos os dados recuperados:

\`\`\`typescript
function getSafeStorageData(key: string): string | null {
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  // Validar formato e conteúdo
  try {
    const parsed = JSON.parse(data);
    // Aplicar validação adicional conforme necessário
    return sanitizeData(parsed);
  } catch {
    return null;
  }
}
\`\`\`

### 2. Práticas Seguras de Manipulação de DOM

#### ❌ Evite Coletores DOM de Alto Risco

**NUNCA use estas APIs com dados controláveis pelo usuário:**
- `innerHTML`
- `outerHTML`
- `insertAdjacentHTML`
- `document.write()`
- `document.writeln()`
- `eval()`
- `Function()`
- `setTimeout()` / `setInterval()` com argumentos de string

#### ✅ Utilize Métodos Seguros

**Use estas alternativas seguras:**

\`\`\`typescript
// ❌ INSEGURO
element.innerHTML = userInput;

// ✅ SEGURO
element.textContent = userInput;

// ❌ INSEGURO
element.innerHTML = `<div>${userInput}</div>`;

// ✅ SEGURO
const div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);

// ❌ INSEGURO
element.setAttribute('href', userInput);

// ✅ SEGURO (validar URL primeiro)
if (isValidURL(userInput)) {
  element.setAttribute('href', sanitizeURL(userInput));
}
\`\`\`

#### ✅ Use Frameworks com Proteção Automática

React, Vue.js e Angular fornecem proteção automática contra XSS quando usados corretamente:

\`\`\`tsx
// React automaticamente escapa conteúdo
function SafeComponent({ userInput }: { userInput: string }) {
  return <div>{userInput}</div>; // Seguro
}

// ❌ INSEGURO - dangerouslySetInnerHTML bypassa proteção
function UnsafeComponent({ userInput }: { userInput: string }) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />; // Perigoso!
}
\`\`\`

#### ✅ Separação de Dados e Código

Evite construir código JavaScript por meio de concatenação de strings:

\`\`\`typescript
// ❌ INSEGURO
const script = `function handleClick() { alert("${userInput}"); }`;
eval(script);

// ✅ SEGURO
function handleClick(message: string) {
  alert(message);
}
handleClick(userInput);
\`\`\`

### 3. Implementação de Recursos de Segurança do Navegador

#### ✅ Content Security Policy (CSP)

Implemente diretivas CSP abrangentes:

\`\`\`html
<!-- Em produção, configure via cabeçalhos HTTP -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'nonce-{random}'; 
               object-src 'none'; 
               base-uri 'self'; 
               frame-ancestors 'none';">
\`\`\`

**Configuração recomendada para Next.js:**

\`\`\`typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://firebasestorage.googleapis.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
\`\`\`

#### ✅ Subresource Integrity (SRI)

Implemente SRI para recursos externos:

\`\`\`html
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
\`\`\`

#### ✅ Trusted Types (quando suportado)

\`\`\`typescript
// Configurar Trusted Types
if (window.trustedTypes && trustedTypes.createPolicy) {
  const policy = trustedTypes.createPolicy('default', {
    createHTML: (input: string) => {
      // Sanitizar input antes de criar HTML
      return DOMPurify.sanitize(input);
    }
  });
}
\`\`\`

### 4. Práticas de Desenvolvimento e Testes

#### ✅ Revisões de Código de Segurança

Realize revisões regulares focadas em:
- Fluxo de dados do lado do cliente
- Uso de APIs perigosas
- Validação de entrada
- Codificação de saída

#### ✅ Análise Estática Automatizada

Use ferramentas como:
- **ESLint** com plugins de segurança
- **SonarQube** para análise de código
- **Snyk** para vulnerabilidades de dependências

\`\`\`json
// .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error"
  }
}
\`\`\`

#### ✅ Testes de Segurança Dinâmicos (DAST)

Implemente testes automatizados:

\`\`\`typescript
// Exemplo de teste de segurança
describe('DOM XSS Prevention', () => {
  it('should sanitize user input in URL parameters', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });
  
  it('should validate postMessage origin', () => {
    const event = new MessageEvent('message', {
      origin: 'https://malicious.com',
      data: { type: 'action' }
    });
    expect(() => handleMessage(event)).toThrow();
  });
});
\`\`\`

#### ✅ Diretrizes de Codificação Segura

Estabeleça e documente diretrizes para a equipe:

1. **Nunca confie em dados do cliente**
2. **Sempre valide e sanitize entradas**
3. **Use frameworks com proteção automática**
4. **Evite APIs perigosas**
5. **Implemente CSP rigoroso**
6. **Teste regularmente para vulnerabilidades**

## Checklist de Segurança

Use este checklist ao desenvolver ou revisar código:

- [ ] Todos os parâmetros de URL são validados antes do uso?
- [ ] Valores de `location.hash` são sanitizados?
- [ ] `document.referrer` é validado se usado?
- [ ] Dados de `localStorage`/`sessionStorage` são validados?
- [ ] `postMessage` valida origem do remetente?
- [ ] Mensagens WebSocket são sanitizadas?
- [ ] Evitamos `innerHTML`, `eval`, `Function()`?
- [ ] Usamos `textContent` em vez de `innerHTML`?
- [ ] CSP está configurado corretamente?
- [ ] SRI está implementado para recursos externos?
- [ ] Testes de segurança estão passando?
- [ ] Revisão de código de segurança foi realizada?

## Recursos Adicionais

- [OWASP DOM XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Google Web Fundamentals - Security](https://developers.google.com/web/fundamentals/security)

## Conclusão

A prevenção de DOM XSS requer uma abordagem em camadas que combina validação rigorosa de entrada, práticas seguras de manipulação de DOM, recursos de segurança do navegador e processos robustos de desenvolvimento. Ao seguir as melhores práticas descritas neste guia, você pode reduzir significativamente a superfície de ataque do seu aplicativo e proteger seus usuários contra ataques baseados em DOM.

**Lembre-se:** A segurança é um processo contínuo, não um estado final. Mantenha-se atualizado sobre novas vulnerabilidades e técnicas de ataque, e revise regularmente seu código para garantir que as proteções permaneçam eficazes.
