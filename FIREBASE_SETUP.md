# Configuração do Firebase

Este guia explica como configurar o Firebase para o projeto W1nner.

## Passo 0: Configurar Variáveis de Ambiente

Antes de iniciar o projeto, você precisa configurar as variáveis de ambiente do Firebase:

1. Copie o arquivo `.env.local.example` para `.env.local`:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Obtenha suas credenciais do Firebase:
   - Acesse o [Console do Firebase](https://console.firebase.google.com/)
   - Selecione seu projeto (ou crie um novo)
   - Clique no ícone de engrenagem ⚙️ → **Configurações do projeto**
   - Role até a seção **Seus aplicativos**
   - Copie os valores de configuração

3. Edite o arquivo `.env.local` e preencha com suas credenciais:
   \`\`\`bash
   NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key-aqui
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu-measurement-id
   \`\`\`

4. **IMPORTANTE**: Nunca commite o arquivo `.env.local` no Git. Ele já está no `.gitignore`.

5. Para produção (Vercel), adicione essas variáveis na seção **Environment Variables** do seu projeto.

## Passo 1: Configurar Regras do Firestore

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. Cole as regras abaixo e clique em **Publicar** (Publish)

\`\`\`firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Função auxiliar para verificar se é admin
