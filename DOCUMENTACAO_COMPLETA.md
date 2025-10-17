# 📚 Documentação Completa - W1nner Engenharia e Topografia

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Funcionalidades Principais](#funcionalidades-principais)
3. [Estrutura do Código](#estrutura-do-código)
4. [Banco de Dados](#banco-de-dados)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Páginas e Rotas](#páginas-e-rotas)
7. [Componentes](#componentes)
8. [APIs e Integrações](#apis-e-integrações)
9. [Sistema de Prazos](#sistema-de-prazos)
10. [Fluxo de Trabalho](#fluxo-de-trabalho)

---

## 🎯 Visão Geral do Sistema

O sistema W1nner é uma plataforma completa de gestão de processos de engenharia e topografia que conecta clientes e administradores através de um portal web moderno e responsivo.

### Objetivos do Sistema

- **Gestão de Processos**: Acompanhamento completo de projetos de regularização, topografia e engenharia
- **Portal do Cliente**: Interface intuitiva para clientes acompanharem seus processos
- **Painel Administrativo**: Ferramentas completas para gestão de processos, usuários e documentos
- **Automação**: Sistema automatizado de prazos e notificações
- **Transparência**: Comunicação clara entre cliente e empresa

### Tecnologias Utilizadas

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Estilização**: Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Banco de Dados**: Firebase Firestore
- **Armazenamento**: Firebase Storage
- **Autenticação**: Firebase Authentication
- **Hospedagem**: Vercel
- **Automação**: Vercel Cron Jobs

---

## ⚡ Funcionalidades Principais

### 1. Sistema de Autenticação

#### Cadastro de Usuários
- Formulário completo com validação de CPF, email e telefone
- Aceitação obrigatória de Termos de Uso e Política de Privacidade
- Armazenamento de data de aceitação dos termos (LGPD)
- Criação automática de perfil no Firestore
- Envio de email de verificação

#### Login
- Autenticação via email e senha
- Recuperação de senha
- Proteção de rotas privadas
- Sessão persistente

#### Perfis de Usuário
- **Cliente**: Acesso ao portal do cliente
- **Admin**: Acesso total ao sistema

### 2. Portal do Cliente

#### Dashboard
- Visão geral de todos os processos
- Indicadores de status (pendente, em andamento, concluído, cancelado)
- Alertas de prazos próximos ao vencimento
- Acesso rápido a funcionalidades

#### Meus Processos
- Listagem de todos os processos do usuário
- Filtros por status
- Visualização de prazos gerais
- Acesso aos detalhes de cada processo

#### Detalhes do Processo
- Informações completas do processo
- **Prazo Geral**: Exibição destacada com indicadores visuais de urgência
- **Timeline**: Histórico completo de ações
- **Documentos Solicitados**: Lista de documentos que precisam ser enviados com prazos individuais
- **Tarefas**: Lista de tarefas administrativas com prazos
- **Status Visual**: Cores indicando urgência (verde, amarelo, laranja, vermelho)
- **Comentários**: Feedback do admin sobre documentos

#### Enviar Documentos
- Central unificada de todos os documentos pendentes
- Exibição de documentos de todos os processos
- Ordenação por urgência de prazo
- Upload de múltiplos arquivos
- Suporte a PDF e imagens
- Indicadores visuais de prazo
- Comentários do admin quando aplicável

#### Perfil
- Edição de dados pessoais
- Alteração de senha
- Visualização de informações da conta

### 3. Painel Administrativo

#### Dashboard Admin
- Estatísticas gerais do sistema
- Processos recentes
- Atividades recentes
- Métricas de desempenho

#### Gestão de Processos

##### Criar Processo
- Formulário completo com:
  - Título e descrição
  - Seleção de cliente
  - **Prazo Geral**: Data limite para conclusão do processo
  - Status inicial
  - Observações
- Aviso sobre encerramento automático por prazo vencido

##### Listar Processos
- Visualização de todos os processos
- Filtros por status, cliente, prazo
- Busca por título
- Indicadores visuais de urgência

##### Detalhes do Processo
- Informações completas
- Timeline de atividades
- Gestão de documentos solicitados
- Gestão de tarefas administrativas
- Atualização de status
- Adicionar observações

##### Solicitar Documentos
- Adicionar requisitos de documentos
- Definir prazo individual para cada documento
- Adicionar descrição e instruções
- Marcar como obrigatório/opcional
- Aprovar/rejeitar documentos enviados
- Adicionar comentários de feedback

##### Gerenciar Tarefas
- Criar tarefas administrativas
- Definir prazo para cada tarefa
- Atribuir responsáveis
- Marcar como concluída
- Adicionar observações

#### Gestão de Usuários
- Listar todos os usuários
- Visualizar detalhes
- Editar informações
- Promover a admin
- Desativar contas

#### Blog
- Criar posts
- Editar posts existentes
- Deletar posts
- Upload de imagens
- Editor de conteúdo rico
- Publicação/despublicação

#### Mensagens de Contato
- Visualizar mensagens do formulário de contato
- Marcar como lida
- Responder
- Deletar

### 4. Sistema de Prazos Automatizado

#### Tipos de Prazos

1. **Prazo Geral do Processo**
   - Definido na criação do processo
   - Prazo máximo para conclusão de todo o processo
   - Encerramento automático se vencido

2. **Prazo de Documento**
   - Definido ao solicitar documento
   - Prazo para o cliente enviar o documento
   - Contribui para o encerramento do processo se vencido

3. **Prazo de Tarefa**
   - Definido ao criar tarefa administrativa
   - Prazo para conclusão da tarefa
   - Contribui para o encerramento do processo se vencido

#### Indicadores Visuais

- **Verde**: Mais de 7 dias restantes
- **Amarelo**: 4-7 dias restantes
- **Laranja**: 1-3 dias restantes
- **Vermelho**: Prazo vencido ou menos de 1 dia

#### Automação (Cron Job)

- **Frequência**: Diário às 00:00 UTC
- **Verificações**:
  - Prazo geral do processo vencido
  - Documentos obrigatórios não enviados no prazo
  - Tarefas críticas não concluídas no prazo
- **Ação**: Encerramento automático do processo com status "cancelado"
- **Registro**: Entrada na timeline explicando o motivo

### 5. Páginas Públicas

#### Home
- Hero section com call-to-action
- Apresentação da empresa
- Serviços oferecidos
- Estatísticas
- Depoimentos

#### Serviços
- Detalhamento de todos os serviços
- Topografia
- Projetos de Engenharia
- Regularização de Imóveis
- Laudos Técnicos
- Consultoria
- Gestão de Obras

#### Orçamento
- Simulador de custos interativo
- Formulário de solicitação
- Cálculo baseado em:
  - Tipo de regularização
  - Área do terreno
  - Características do terreno
  - Localização
- Geração de PDF com orçamento
- Envio via WhatsApp
- Chat com assistente IA

#### Contato
- Formulário de contato
- Informações da empresa
- Mapa de localização
- Links para redes sociais

#### Blog
- Listagem de posts
- Visualização de post individual
- Categorias
- Busca

#### Termos de Uso
- Termos completos de uso do site
- Direitos e deveres
- Política de uso

#### Política de Privacidade
- Conformidade com LGPD
- Dados coletados
- Uso dos dados
- Direitos do usuário
- Segurança

---

## 🏗️ Estrutura do Código

### Organização de Diretórios

\`\`\`
w1nner-main/
├── app/                          # Páginas e rotas (App Router)
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/
│   │   └── cadastro/
│   ├── admin/                    # Painel administrativo
│   │   ├── page.tsx             # Dashboard admin
│   │   ├── processos/           # Gestão de processos
│   │   ├── usuarios/            # Gestão de usuários
│   │   └── blog/                # Gestão de blog
│   ├── portal/                   # Portal do cliente
│   │   ├── page.tsx             # Dashboard cliente
│   │   ├── processos/           # Meus processos
│   │   ├── upload/              # Enviar documentos
│   │   └── perfil/              # Perfil do usuário
│   ├── api/                      # API Routes
│   │   ├── check-deadlines/     # Cron job de prazos
│   │   └── assistant/           # Chat IA
│   ├── blog/                     # Blog público
│   ├── servicos/                 # Página de serviços
│   ├── orcamento/                # Simulador de orçamento
│   ├── contato/                  # Formulário de contato
│   ├── termos-de-uso/           # Termos de uso
│   ├── politica-de-privacidade/ # Política de privacidade
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Home page
│   └── globals.css              # Estilos globais
├── components/                   # Componentes React
│   ├── ui/                      # Componentes shadcn/ui
│   ├── navigation.tsx           # Menu de navegação
│   ├── footer.tsx               # Rodapé
│   ├── admin-route.tsx          # Proteção de rotas admin
│   └── ...
├── lib/                         # Bibliotecas e utilitários
│   ├── firebase/                # Configuração Firebase
│   │   ├── config.ts           # Configuração
│   │   ├── auth-context.tsx    # Context de autenticação
│   │   └── activity-logger.ts  # Logger de atividades
│   ├── utils.ts                # Funções utilitárias
│   └── pdf-generator.ts        # Gerador de PDF
├── hooks/                       # Custom hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── public/                      # Arquivos estáticos
│   └── images/
├── firestore.rules             # Regras de segurança Firestore
├── storage.rules               # Regras de segurança Storage
├── vercel.json                 # Configuração Vercel (cron)
└── package.json                # Dependências
\`\`\`

### Principais Arquivos

#### Configuração Firebase (`lib/firebase/config.ts`)
\`\`\`typescript
// Inicialização do Firebase
// Configuração de Firestore, Auth e Storage
// Exportação de instâncias para uso global
\`\`\`

#### Context de Autenticação (`lib/firebase/auth-context.tsx`)
\`\`\`typescript
// Provider de autenticação
// Estado global do usuário
// Funções de login, logout, registro
// Proteção de rotas
\`\`\`

#### Logger de Atividades (`lib/firebase/activity-logger.ts`)
\`\`\`typescript
// Registro de ações no sistema
// Auditoria de atividades
// Histórico de mudanças
\`\`\`

#### Gerador de PDF (`lib/pdf-generator.ts`)
\`\`\`typescript
// Geração de orçamentos em PDF
// Formatação de documentos
// Exportação de relatórios
\`\`\`

---

## 💾 Banco de Dados

### Coleções Firestore

#### 1. `users`
Armazena informações dos usuários do sistema.

**Campos:**
- `uid` (string): ID único do usuário (Firebase Auth)
- `name` (string): Nome completo
- `email` (string): Email
- `cpf` (string): CPF formatado (XXX.XXX.XXX-XX)
- `phone` (string): Telefone (+55XXXXXXXXXXX)
- `role` (string): Papel do usuário ("user" | "admin")
- `createdAt` (timestamp): Data de criação
- `updatedAt` (timestamp): Data de atualização
- `termsAcceptedAt` (string): Data de aceitação dos termos (ISO 8601)
- `privacyAcceptedAt` (string): Data de aceitação da política (ISO 8601)

**Índices:**
- `email` (ASC)
- `cpf` (ASC)
- `role` (ASC)

**Regras de Segurança:**
- Admin: leitura e escrita total
- Usuário: leitura apenas dos próprios dados
- Criação: apenas usuários autenticados, com validação de campos

#### 2. `processes`
Armazena os processos de regularização e projetos.

**Campos:**
- `id` (string): ID único do processo
- `title` (string): Título do processo
- `description` (string): Descrição detalhada
- `userId` (string): ID do cliente proprietário
- `userName` (string): Nome do cliente
- `userEmail` (string): Email do cliente
- `status` (string): Status atual ("pending" | "in_progress" | "completed" | "cancelled")
- `deadline` (string, opcional): Prazo geral do processo (ISO 8601)
- `createdAt` (timestamp): Data de criação
- `updatedAt` (timestamp): Data de atualização
- `timeline` (array): Histórico de ações
  - `action` (string): Tipo de ação
  - `description` (string): Descrição
  - `timestamp` (string): Data/hora (ISO 8601)
  - `userId` (string): Quem executou
- `requirements` (array): Documentos solicitados
  - `id` (string): ID único do requisito
  - `title` (string): Nome do documento
  - `description` (string): Descrição/instruções
  - `status` (string): Status ("pending" | "submitted" | "approved" | "rejected")
  - `deadline` (string, opcional): Prazo para envio (ISO 8601)
  - `fileUrl` (string, opcional): URL do arquivo enviado
  - `fileName` (string, opcional): Nome do arquivo
  - `uploadedAt` (string, opcional): Data de upload
  - `reviewedAt` (string, opcional): Data de revisão
  - `comments` (string, opcional): Comentários do admin
- `adminTasks` (array): Tarefas administrativas
  - `id` (string): ID único da tarefa
  - `title` (string): Nome da tarefa
  - `description` (string): Descrição
  - `status` (string): Status ("pending" | "completed")
  - `deadline` (string, opcional): Prazo para conclusão (ISO 8601)
  - `completedAt` (string, opcional): Data de conclusão
  - `assignedTo` (string, opcional): Responsável

**Índices:**
- `userId` (ASC)
- `status` (ASC)
- `createdAt` (DESC)
- `deadline` (ASC)

**Regras de Segurança:**
- Admin: leitura e escrita total
- Usuário: leitura apenas dos próprios processos

#### 3. `blog_posts`
Armazena posts do blog.

**Campos:**
- `id` (string): ID único do post
- `title` (string): Título
- `excerpt` (string): Resumo
- `content` (string): Conteúdo completo (Markdown/HTML)
- `author` (string): Nome do autor
- `authorEmail` (string): Email do autor
- `category` (string, opcional): Categoria
- `imageUrl` (string, opcional): URL da imagem de capa
- `images` (array, opcional): URLs de imagens adicionais
- `publishedAt` (string, opcional): Data de publicação (ISO 8601)
- `createdAt` (string): Data de criação (ISO 8601)
- `updatedAt` (string, opcional): Data de atualização (ISO 8601)

**Índices:**
- `publishedAt` (DESC)
- `category` (ASC)

**Regras de Segurança:**
- Leitura: pública
- Escrita: apenas usuários autenticados

#### 4. `contact_messages`
Armazena mensagens do formulário de contato.

**Campos:**
- `id` (string): ID único da mensagem
- `name` (string): Nome do remetente
- `email` (string): Email do remetente
- `phone` (string, opcional): Telefone
- `subject` (string, opcional): Assunto
- `message` (string): Mensagem
- `status` (string): Status ("novo" | "lido" | "respondido")
- `createdAt` (string): Data de envio (ISO 8601)

**Regras de Segurança:**
- Criação: pública (qualquer pessoa pode enviar)
- Leitura/Exclusão: apenas admin

#### 5. `contact_requests`
Armazena solicitações de orçamento.

**Campos:**
- `id` (string): ID único da solicitação
- `name` (string): Nome
- `email` (string): Email
- `phone` (string): Telefone
- `propertyType` (string): Tipo de regularização
- `area` (number): Área total (m²)
- `location` (string): Localização
- `totalCost` (number): Custo total calculado
- `breakdown` (object): Detalhamento de custos
- `createdAt` (string): Data de criação (ISO 8601)

**Regras de Segurança:**
- Criação: pública
- Leitura/Exclusão: apenas admin

#### 6. `activity_logs`
Armazena logs de atividades do sistema.

**Campos:**
- `id` (string): ID único do log
- `action` (string): Tipo de ação
- `description` (string): Descrição detalhada
- `userId` (string): ID do usuário que executou
- `userName` (string, opcional): Nome do usuário
- `processId` (string, opcional): ID do processo relacionado
- `timestamp` (string): Data/hora (ISO 8601)
- `metadata` (object, opcional): Dados adicionais

**Índices:**
- `userId` (ASC)
- `timestamp` (DESC)
- `action` (ASC)

**Regras de Segurança:**
- Leitura: apenas admin
- Criação: usuários autenticados

### Firebase Storage

#### Estrutura de Pastas

\`\`\`
storage/
├── blog/                        # Imagens do blog
│   └── {postId}/
│       └── {imageId}.{ext}
├── processes/                   # Documentos de processos
│   └── {userId}/
│       └── {processId}/
│           ├── requirements/    # Documentos solicitados
│           │   └── {reqId}/
│           │       └── {timestamp}_{filename}
│           └── tasks/          # Arquivos de tarefas
│               └── {taskId}/
│                   └── {timestamp}_{filename}
└── tasks/                      # Arquivos gerais de tarefas
    └── {processId}/
        └── {taskId}/
            └── {timestamp}_{filename}
\`\`\`

#### Regras de Segurança Storage

\`\`\`
// Blog: usuários autenticados podem fazer upload
match /blog/{postId}/{imageId} {
  allow read: if true;
  allow write: if request.auth != null;
}

// Processos: usuário pode acessar seus próprios arquivos
match /processes/{userId}/{processId}/{allPaths=**} {
  allow read: if request.auth != null && 
                 (request.auth.uid == userId || isAdmin());
  allow write: if request.auth != null && 
                  (request.auth.uid == userId || isAdmin());
  allow delete: if request.auth != null && 
                   (request.auth.uid == userId || isAdmin());
}

// Tasks: usuários autenticados podem fazer upload
match /tasks/{processId}/{taskId}/{fileName} {
  allow read, write: if request.auth != null;
}
\`\`\`

---

## 🔐 Autenticação e Autorização

### Firebase Authentication

#### Métodos Suportados
- Email/Senha
- Recuperação de senha via email
- Verificação de email

#### Fluxo de Autenticação

1. **Registro**
   - Usuário preenche formulário com dados pessoais
   - Aceita termos de uso e política de privacidade
   - Sistema cria conta no Firebase Auth
   - Sistema cria documento no Firestore (`users`)
   - Envia email de verificação

2. **Login**
   - Usuário fornece email e senha
   - Firebase Auth valida credenciais
   - Sistema carrega dados do usuário do Firestore
   - Redireciona para dashboard apropriado (admin ou cliente)

3. **Recuperação de Senha**
   - Usuário solicita reset de senha
   - Firebase envia email com link
   - Usuário define nova senha

### Proteção de Rotas

#### AdminRoute Component
\`\`\`typescript
// Verifica se usuário é admin
// Redireciona não-admins para home
// Usado em todas as rotas /admin/*
\`\`\`

#### AuthContext
\`\`\`typescript
// Gerencia estado de autenticação global
// Fornece funções de login/logout
// Carrega dados do usuário
// Persiste sessão
\`\`\`

### Níveis de Acesso

#### Público
- Home
- Serviços
- Blog (leitura)
- Orçamento
- Contato
- Termos de Uso
- Política de Privacidade

#### Cliente Autenticado
- Portal do Cliente
- Meus Processos
- Enviar Documentos
- Perfil

#### Administrador
- Tudo do cliente +
- Dashboard Admin
- Gestão de Processos
- Gestão de Usuários
- Gestão de Blog
- Mensagens de Contato
- Logs de Atividade

---

## 🌐 Páginas e Rotas

### Rotas Públicas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `app/page.tsx` | Home page |
| `/servicos` | `app/servicos/page.tsx` | Página de serviços |
| `/orcamento` | `app/orcamento/page.tsx` | Simulador de orçamento |
| `/contato` | `app/contato/page.tsx` | Formulário de contato |
| `/blog` | `app/blog/page.tsx` | Listagem de posts |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Post individual |
| `/termos-de-uso` | `app/termos-de-uso/page.tsx` | Termos de uso |
| `/politica-de-privacidade` | `app/politica-de-privacidade/page.tsx` | Política de privacidade |

### Rotas de Autenticação

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/login` | `app/login/page.tsx` | Login |
| `/cadastro` | `app/cadastro/page.tsx` | Registro |

### Rotas do Portal (Cliente)

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/portal` | `app/portal/page.tsx` | Dashboard cliente |
| `/portal/processos` | `app/portal/processos/page.tsx` | Lista de processos |
| `/portal/processos/[id]` | `app/portal/processos/[id]/page.tsx` | Detalhes do processo |
| `/portal/upload` | `app/portal/upload/page.tsx` | Enviar documentos |
| `/portal/perfil` | `app/portal/perfil/page.tsx` | Perfil do usuário |

### Rotas Admin

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/admin` | `app/admin/page.tsx` | Dashboard admin |
| `/admin/processos` | `app/admin/processos/page.tsx` | Lista de processos |
| `/admin/processos/[id]` | `app/admin/processos/[id]/page.tsx` | Detalhes do processo |
| `/admin/usuarios` | `app/admin/usuarios/page.tsx` | Gestão de usuários |
| `/admin/blog` | `app/admin/blog/page.tsx` | Gestão de blog |

### API Routes

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/api/check-deadlines` | `app/api/check-deadlines/route.ts` | Cron job de prazos |
| `/api/assistant` | `app/api/assistant/route.ts` | Chat IA |

---

## 🧩 Componentes

### Componentes de UI (shadcn/ui)

Todos os componentes base do shadcn/ui estão disponíveis em `components/ui/`:

- `accordion` - Acordeões expansíveis
- `alert` - Alertas e notificações
- `avatar` - Avatares de usuário
- `badge` - Badges e tags
- `button` - Botões
- `card` - Cards de conteúdo
- `checkbox` - Checkboxes
- `dialog` - Modais e diálogos
- `dropdown-menu` - Menus dropdown
- `input` - Campos de entrada
- `label` - Labels de formulário
- `select` - Seletores
- `table` - Tabelas
- `tabs` - Abas
- `textarea` - Áreas de texto
- `toast` - Notificações toast
- E muitos outros...

### Componentes Customizados

#### Navigation (`components/navigation.tsx`)
Menu de navegação principal com:
- Logo
- Links de navegação
- Menu mobile responsivo
- Botões de login/cadastro
- Menu de usuário autenticado

#### Footer (`components/footer.tsx`)
Rodapé com:
- Informações da empresa
- Links rápidos
- Redes sociais
- Copyright

#### AdminRoute (`components/admin-route.tsx`)
HOC para proteção de rotas administrativas:
- Verifica autenticação
- Verifica papel de admin
- Redireciona não autorizados

---

## 🔌 APIs e Integrações

### API Routes

#### 1. Check Deadlines (`/api/check-deadlines`)

**Método:** POST  
**Autenticação:** Bearer token (CRON_SECRET)  
**Frequência:** Diário às 00:00 UTC (Vercel Cron)

**Função:**
- Busca todos os processos ativos
- Verifica prazo geral do processo
- Verifica prazos de documentos obrigatórios
- Verifica prazos de tarefas críticas
- Encerra processos com prazos vencidos
- Registra ações na timeline

**Resposta:**
\`\`\`json
{
  "success": true,
  "processedCount": 10,
  "closedCount": 2,
  "closedProcesses": ["id1", "id2"]
}
\`\`\`

#### 2. Assistant (`/api/assistant`)

**Método:** POST  
**Autenticação:** Não requerida  
**Corpo:**
\`\`\`json
{
  "message": "Como funciona a regularização?"
}
\`\`\`

**Função:**
- Recebe pergunta do usuário
- Processa com IA
- Retorna resposta contextualizada sobre regularização

**Resposta:**
\`\`\`json
{
  "response": "A regularização de imóveis é..."
}
\`\`\`

### Integrações Externas

#### WhatsApp Business
- Envio de orçamentos via WhatsApp
- Link direto com mensagem pré-formatada
- Número: +55 47 99638-4548

#### Geração de PDF
- Biblioteca: jsPDF + autoTable
- Geração de orçamentos
- Formatação profissional
- Download automático

---

## ⏰ Sistema de Prazos

### Arquitetura

O sistema de prazos é composto por três camadas:

1. **Camada de Dados**: Armazenamento de prazos no Firestore
2. **Camada de Apresentação**: Exibição visual de prazos com indicadores
3. **Camada de Automação**: Verificação e ação automática via cron job

### Fluxo de Funcionamento

\`\`\`
1. Admin define prazo ao criar/editar processo/documento/tarefa
   ↓
2. Prazo é armazenado no Firestore (formato ISO 8601)
   ↓
3. Interface calcula dias restantes e exibe indicador visual
   ↓
4. Cron job verifica diariamente prazos vencidos
   ↓
5. Se vencido: processo é encerrado automaticamente
   ↓
6. Ação é registrada na timeline do processo
\`\`\`

### Cálculo de Urgência

\`\`\`typescript
function getUrgencyLevel(deadline: string) {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
  
  if (daysRemaining < 0) return 'expired'      // Vermelho
  if (daysRemaining <= 1) return 'critical'    // Vermelho
  if (daysRemaining <= 3) return 'urgent'      // Laranja
  if (daysRemaining <= 7) return 'warning'     // Amarelo
  return 'normal'                               // Verde
}
\`\`\`

### Configuração do Cron Job

**Arquivo:** `vercel.json`

\`\`\`json
{
  "crons": [{
    "path": "/api/check-deadlines",
    "schedule": "0 0 * * *"
  }]
}
\`\`\`

**Formato do Schedule:** Cron expression (0 0 * * * = todo dia à meia-noite UTC)

---

## 🔄 Fluxo de Trabalho

### Fluxo Completo de um Processo

\`\`\`
1. CLIENTE SE CADASTRA
   - Preenche formulário
   - Aceita termos
   - Recebe email de verificação
   ↓
2. CLIENTE SOLICITA ORÇAMENTO
   - Usa simulador
   - Recebe estimativa
   - Envia via WhatsApp ou formulário
   ↓
3. ADMIN CRIA PROCESSO
   - Define título e descrição
   - Seleciona cliente
   - Define prazo geral
   - Adiciona observações
   ↓
4. ADMIN SOLICITA DOCUMENTOS
   - Lista documentos necessários
   - Define prazo para cada um
   - Adiciona instruções
   ↓
5. CLIENTE VISUALIZA PROCESSO
   - Vê prazo geral destacado
   - Vê lista de documentos com prazos
   - Recebe alertas de urgência
   ↓
6. CLIENTE ENVIA DOCUMENTOS
   - Acessa página de upload
   - Vê todos documentos pendentes
   - Faz upload dos arquivos
   ↓
7. ADMIN REVISA DOCUMENTOS
   - Aprova ou rejeita
   - Adiciona comentários
   - Solicita correções se necessário
   ↓
8. ADMIN GERENCIA TAREFAS
   - Cria tarefas administrativas
   - Define prazos
   - Marca como concluídas
   ↓
9. SISTEMA MONITORA PRAZOS
   - Verifica diariamente
   - Alerta sobre vencimentos
   - Encerra processos automaticamente se necessário
   ↓
10. PROCESSO É CONCLUÍDO
    - Admin marca como concluído
    - Cliente é notificado
    - Histórico é preservado
\`\`\`

### Estados de um Processo

\`\`\`
PENDING (Pendente)
   ↓
IN_PROGRESS (Em Andamento)
   ↓
COMPLETED (Concluído) ou CANCELLED (Cancelado)
\`\`\`

### Estados de um Documento

\`\`\`
PENDING (Pendente)
   ↓
SUBMITTED (Enviado)
   ↓
APPROVED (Aprovado) ou REJECTED (Rejeitado)
   ↓
(Se rejeitado, volta para PENDING)
\`\`\`

---

## 📱 Responsividade

O sistema é 100% responsivo e otimizado para:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Breakpoints Tailwind

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

### Otimizações Mobile

- Menu hambúrguer em telas pequenas
- Cards empilhados verticalmente
- Formulários adaptados para toque
- Botões com tamanho mínimo de 44px
- Textos legíveis sem zoom
- Imagens otimizadas

---

## 🔒 Segurança

### Firestore Security Rules

- Validação de tipos de dados
- Validação de tamanhos de strings
- Validação de formatos (email, CPF, telefone)
- Controle de acesso baseado em papéis
- Proteção contra injeção de dados
- Auditoria de ações

### Storage Security Rules

- Controle de acesso por usuário
- Validação de tipos de arquivo
- Limite de tamanho de arquivo
- Proteção de caminhos sensíveis

### Boas Práticas Implementadas

- Senhas nunca armazenadas (Firebase Auth)
- Tokens de sessão seguros
- HTTPS obrigatório
- Validação client-side e server-side
- Sanitização de inputs
- Rate limiting em APIs
- Logs de auditoria

---

## 🚀 Performance

### Otimizações Implementadas

- **Next.js App Router**: Renderização otimizada
- **Server Components**: Redução de JavaScript no cliente
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Carregamento sob demanda
- **Lazy Loading**: Componentes carregados quando necessário
- **Caching**: Cache de dados do Firestore
- **CDN**: Vercel Edge Network

### Métricas Alvo

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

---

## 📊 Monitoramento

### Logs de Atividade

Todas as ações importantes são registradas em `activity_logs`:

- Criação de processos
- Atualização de status
- Upload de documentos
- Aprovação/rejeição de documentos
- Conclusão de tarefas
- Encerramento automático por prazo

### Métricas Disponíveis

- Total de processos por status
- Taxa de conclusão
- Tempo médio de processo
- Documentos pendentes
- Prazos próximos ao vencimento
- Atividades recentes

---

## 🛠️ Manutenção

### Tarefas Regulares

#### Diárias (Automatizadas)
- Verificação de prazos (cron job)
- Backup automático do Firestore (Firebase)

#### Semanais
- Revisão de logs de erro
- Análise de métricas de performance
- Verificação de segurança

#### Mensais
- Atualização de dependências
- Revisão de regras de segurança
- Análise de uso de recursos
- Limpeza de arquivos antigos

### Troubleshooting Comum

#### Problema: Usuário não consegue fazer login
**Solução:**
1. Verificar se email está verificado
2. Verificar se conta está ativa
3. Verificar regras do Firestore
4. Verificar logs de autenticação

#### Problema: Upload de arquivo falha
**Solução:**
1. Verificar tamanho do arquivo (< 10MB)
2. Verificar tipo de arquivo (PDF ou imagem)
3. Verificar regras do Storage
4. Verificar conexão com internet

#### Problema: Cron job não executa
**Solução:**
1. Verificar configuração no vercel.json
2. Verificar CRON_SECRET nas variáveis de ambiente
3. Verificar logs da Vercel
4. Verificar quota de execuções

---

## 📞 Suporte

### Contatos

- **Email**: contato@w1nner.com.br
- **WhatsApp**: +55 47 99638-4548
- **Endereço**: [Endereço da empresa]

### Documentação Adicional

- [README.md](README.md) - Visão geral e instalação
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura técnica
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Schema do banco de dados

---

## 📝 Changelog

### Versão Atual

**Funcionalidades Implementadas:**
- ✅ Sistema de autenticação completo
- ✅ Portal do cliente
- ✅ Painel administrativo
- ✅ Gestão de processos
- ✅ Sistema de prazos automatizado
- ✅ Upload de documentos
- ✅ Blog
- ✅ Simulador de orçamento
- ✅ Chat com IA
- ✅ Termos de uso e política de privacidade
- ✅ Sistema de logs de atividade
- ✅ Responsividade completa

**Melhorias Futuras:**
- 🔄 Notificações por email
- 🔄 Notificações push
- 🔄 Dashboard com gráficos avançados
- 🔄 Relatórios em PDF
- 🔄 Integração com sistemas de pagamento
- 🔄 App mobile nativo

---

**Última atualização:** Janeiro 2025  
**Versão da documentação:** 1.0  
**Mantido por:** Equipe W1nner
