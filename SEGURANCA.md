# Guia de Segurança - Sistema W1nner

## Visão Geral

Este documento descreve as práticas de segurança implementadas no sistema e como configurar corretamente as permissões de administrador.

## Configuração de Administradores

### ⚠️ IMPORTANTE: Não use UIDs hardcoded

O sistema utiliza **Firebase Custom Claims** para gerenciar permissões de administrador. Nunca adicione UIDs diretamente nas regras de segurança.

### Como Tornar um Usuário Administrador

#### Opção 1: Via Firebase Admin SDK (Recomendado)

1. Instale o Firebase Admin SDK no seu ambiente de desenvolvimento:

\`\`\`bash
npm install firebase-admin
\`\`\`

2. Crie um script para adicionar custom claims:

\`\`\`javascript
// scripts/set-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Usuário ${email} agora é administrador`);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Substitua pelo email do administrador
setAdminClaim('admin@exemplo.com');
\`\`\`

3. Execute o script:

\`\`\`bash
node scripts/set-admin.js
\`\`\`

#### Opção 2: Via Firebase Console (Temporário)

Para desenvolvimento, você pode usar a extensão "Set Custom Claims" do Firebase:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Extensions** → **Install Extension**
3. Procure por "Set Custom Claims"
4. Instale e configure a extensão
5. Use a extensão para adicionar `{ "admin": true }` ao usuário desejado

#### Opção 3: Via Cloud Functions

Crie uma Cloud Function protegida para gerenciar admins:

\`\`\`typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Verificar se quem está chamando já é admin
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas administradores podem criar outros administradores'
    );
  }

  const { email } = data;
  
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { success: true, message: `${email} agora é administrador` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Erro ao definir admin');
  }
});
\`\`\`

### Verificar Custom Claims no Frontend

\`\`\`typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const idTokenResult = await user.getIdTokenResult();
  const isAdmin = idTokenResult.claims.admin === true;
  console.log('É admin?', isAdmin);
}
\`\`\`

## Regras de Segurança

### Firestore Rules

As regras do Firestore verificam custom claims:

\`\`\`javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
\`\`\`

### Storage Rules

As regras do Storage também verificam custom claims:

\`\`\`javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
\`\`\`

## Boas Práticas de Segurança

### ✅ Faça

- Use Firebase Custom Claims para roles e permissões
- Mantenha as Service Account Keys em segredo (nunca commite no Git)
- Use variáveis de ambiente para configurações sensíveis
- Implemente rate limiting em endpoints públicos
- Valide todos os inputs no frontend e backend
- Use HTTPS para todas as comunicações
- Mantenha as dependências atualizadas

### ❌ Não Faça

- Nunca hardcode UIDs, emails ou senhas no código
- Nunca commite Service Account Keys no Git
- Nunca confie apenas em validações do frontend
- Nunca exponha API keys públicas sem restrições
- Nunca use `allow read, write: if true` em produção

## Auditoria de Segurança

### Logs de Atividade

O sistema registra todas as ações importantes na coleção `activity_logs`:

\`\`\`typescript
{
  action: string,        // Tipo de ação
  description: string,   // Descrição detalhada
  userId: string,        // UID do usuário
  userEmail: string,     // Email do usuário
  timestamp: string,     // ISO 8601
  metadata: object       // Dados adicionais
}
\`\`\`

### Monitoramento

Configure alertas no Firebase Console para:
- Tentativas de acesso não autorizado
- Mudanças nas regras de segurança
- Picos de uso anormais
- Erros de autenticação

## Recuperação de Incidentes

Se um segredo foi exposto:

1. **Revogue imediatamente** as credenciais comprometidas
2. **Gere novas credenciais** no Firebase Console
3. **Atualize** todas as referências às credenciais
4. **Audite** os logs para identificar acessos não autorizados
5. **Notifique** os usuários se dados foram comprometidos (LGPD)

## Contato de Segurança

Para reportar vulnerabilidades de segurança:
- Email: seguranca@w1nner.com.br
- Não divulgue publicamente até que seja corrigido

## Checklist de Segurança

- [ ] Custom claims configurados para admins
- [ ] Service Account Keys em local seguro
- [ ] Regras do Firestore revisadas e testadas
- [ ] Regras do Storage revisadas e testadas
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado em produção
- [ ] Rate limiting implementado
- [ ] Logs de auditoria funcionando
- [ ] Backup automático configurado
- [ ] Plano de recuperação de desastres documentado
