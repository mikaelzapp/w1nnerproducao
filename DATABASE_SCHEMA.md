# Schema do Banco de Dados - W1nner

## Visão Geral

O sistema utiliza Firebase Firestore como banco de dados NoSQL. As coleções são organizadas de forma hierárquica e seguem princípios de normalização quando apropriado.

## Coleções

### 1. users

Armazena informações dos usuários do sistema (clientes e administradores).

**Caminho**: `/users/{userId}`

**Campos**:
\`\`\`typescript
{
  // Identificação
  id: string                    // UID do Firebase Auth
  email: string                 // Email único
  name: string                  // Nome completo
  cpf: string                   // CPF (formato: 000.000.000-00)
  phone: string                 // Telefone (formato: +55 47 99999-9999)
  
  // Permissões
  isAdmin: boolean              // Se é administrador
  
  // Verificação
  emailVerified: boolean        // Email verificado
  phoneVerified: boolean        // Telefone verificado
  
  // Aceitação de Termos
  termsAcceptedAt: string       // Data de aceitação dos Termos de Uso (ISO 8601)
  privacyAcceptedAt: string     // Data de aceitação da Política de Privacidade (ISO 8601)
  
  // Perfil
  photoURL?: string             // URL da foto de perfil
  bio?: string                  // Biografia
  
  // Timestamps
  createdAt: string             // ISO 8601
  updatedAt: string             // ISO 8601
}
\`\`\`

**Índices**:
- `email` (único)
- `cpf` (único)
- `isAdmin`

**Regras de Segurança**:
- Leitura: Próprio usuário ou admin
- Criação: Apenas durante registro
- Atualização: Próprio usuário (campos limitados) ou admin
- Exclusão: Apenas admin

---

### 2. processes

Armazena processos de regularização e projetos dos clientes.

**Caminho**: `/processes/{processId}`

**Campos**:
\`\`\`typescript
{
  // Identificação
  id: string                    // ID auto-gerado
  userId: string                // Referência ao usuário
  
  // Informações Básicas
  title: string                 // Título do processo
  description: string           // Descrição detalhada
  type: string                  // Tipo de processo
  
  // Status
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
  priority: 'low' | 'medium' | 'high'
  
  deadline?: string             // Prazo de entrega do processo (ISO 8601)
  
  // Encerramento
  closedAt?: string             // Data de encerramento
  closedReason?: string         // Motivo do encerramento
  
  // Documentos Solicitados
  requirements: Array<{
    id: string                  // ID único do requisito
    name: string                // Nome do documento
    description: string         // Descrição do que é necessário
    status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado' | 'nao_tenho'
    deadline?: string           // Prazo de entrega (ISO 8601)
    files: Array<{
      id: string                // ID único do arquivo
      name: string              // Nome do arquivo
      url: string               // URL no Storage
      uploadedAt: string        // Timestamp do upload
    }>
    adminComments?: string      // Comentários do admin
    userNote?: string           // Justificativa do usuário
    createdAt: string           // Data de criação
    updatedAt: string           // Última atualização
  }>
  
  // Tarefas Administrativas
  adminTasks: Array<{
    id: string                  // ID único da tarefa
    title: string               // Título da tarefa
    description?: string        // Descrição
    status: 'pendente' | 'em_andamento' | 'concluido'
    deadline?: string           // Prazo de entrega (ISO 8601)
    files: Array<{
      id: string                // ID único do arquivo
      name: string              // Nome do arquivo
      url: string               // URL no Storage
      type: string              // Tipo MIME
      size: number              // Tamanho em bytes
      uploadedAt: string        // Timestamp do upload
    }>
    createdAt: string           // Data de criação
    completedAt?: string        // Data de conclusão
    createdBy: string           // ID do admin que criou
  }>
  
  // Timeline
  timeline: Array<{
    status: string              // Status da ação
    message: string             // Descrição da ação
    timestamp: string           // Quando ocorreu
    actor?: string              // Tipo: 'admin', 'user', 'system'
    actorName?: string          // Nome de quem executou
  }>
  
  // Timestamps
  createdAt: string             // ISO 8601
  updatedAt: string             // ISO 8601
}
\`\`\`

**Índices**:
- `userId`
- `status`
- `priority`
- `createdAt`
- `deadline`

**Regras de Segurança**:
- Leitura: Próprio usuário ou admin
- Criação: Apenas admin
- Atualização: Admin (todos os campos) ou usuário (apenas upload de documentos)
- Exclusão: Apenas admin

**Automação de Prazos**:
- Um cron job verifica diariamente os prazos do processo, `requirements` e `adminTasks`
- Se o prazo geral do processo (`deadline`) for vencido, o processo é automaticamente encerrado
- Se um prazo de `requirements` ou `adminTasks` for vencido e o item não estiver concluído/aprovado, o processo também é encerrado
- Quando encerrado, o processo recebe `status: 'cancelado'`, `closedAt` com timestamp, e `closedReason: 'Prazo de entrega não cumprido'`
- O motivo do encerramento é registrado em `closedReason` e na `timeline` com detalhes dos itens vencidos

---

### 3. payment_plans

Armazena planos de pagamento criados via Asaas.

**Caminho**: `/payment_plans/{planId}`

**Campos**:
\`\`\`typescript
{
  // Identificação
  id: string                    // ID auto-gerado
  userId: string                // Referência ao usuário
  
  // Informações do Plano
  planName: string              // Nome do plano
  description?: string          // Descrição
  
  // Valores
  totalValue: number            // Valor total em centavos
  installments: number          // Número de parcelas
  installmentValue: number      // Valor de cada parcela
  dueDay: number                // Dia de vencimento (1-31)
  
  // Status
  status: 'active' | 'cancelled' | 'completed'
  
  // Integração Asaas
  asaasCustomerId: string       // ID do cliente no Asaas
  asaasSubscriptionId: string   // ID da assinatura no Asaas
  
  // Timestamps
  createdAt: string             // ISO 8601
  updatedAt: string             // ISO 8601
}
\`\`\`

**Índices**:
- `userId`
- `status`
- `asaasSubscriptionId`

**Regras de Segurança**:
- Leitura: Próprio usuário ou admin
- Criação: Apenas admin
- Atualização: Apenas admin
- Exclusão: Apenas admin

---

### 4. blog_posts

Armazena posts do blog.

**Caminho**: `/blog_posts/{postId}`

**Campos**:
\`\`\`typescript
{
  // Identificação
  id: string                    // ID auto-gerado
  
  // Conteúdo
  title: string                 // Título do post
  excerpt: string               // Resumo
  content: string               // Conteúdo completo (Markdown)
  
  // Autor
  author: string                // Nome do autor
  authorEmail: string           // Email do autor
  
  // Categorização
  category?: string             // Categoria
  tags?: string[]               // Tags
  
  // Mídia
  imageUrl?: string             // Imagem de capa
  images?: string[]             // Galeria de imagens
  
  // Timestamps
  publishedAt: string           // Data de publicação
  createdAt: string             // ISO 8601
  updatedAt: string             // ISO 8601
}
\`\`\`

**Índices**:
- `publishedAt`
- `category`
- `author`

**Regras de Segurança**:
- Leitura: Público
- Criação: Usuários autenticados
- Atualização: Usuários autenticados
- Exclusão: Usuários autenticados

---

### 5. contact_messages

Armazena mensagens do formulário de contato.

**Caminho**: `/contact_messages/{messageId}`

**Campos**:
\`\`\`typescript
{
  // Identificação
  id: string                    // ID auto-gerado
  
  // Remetente
  name: string                  // Nome
  email: string                 // Email
  phone?: string                // Telefone
  
  // Mensagem
  subject?: string              // Assunto
  message: string               // Mensagem
  
  // Status
  status: 'novo' | 'lido' | 'respondido'
  
  // Timestamps
  createdAt: string             // ISO 8601
}
\`\`\`

**Índices**:
- `status`
- `createdAt`

**Regras de Segurança**:
- Leitura: Apenas admin
- Criação: Público
- Atualização: Não permitido
- Exclusão: Apenas admin

---

### 6. contact_requests

Armazena solicitações de orçamento.

**Caminho**: `/contact_requests/{requestId}`

**Campos**:
\`\`\`typescript
{
  // Identificação
  id: string                    // ID auto-gerado
  
  // Remetente
  name: string                  // Nome
  email: string                 // Email
  phone: string                 // Telefone
  
  // Orçamento
  areaType: 'urban' | 'rural'   // Tipo de área
  areaSize: number              // Tamanho em m²
  state: string                 // Estado (UF)
  city: string                  // Cidade
  regularizationType: string    // Tipo de regularização
  terrainType: string           // Tipo de terreno
  rumoStatus: string            // Status do rumo
  accessDifficulty: string      // Dificuldade de acesso
  
  // Cálculo
  estimatedCost: number         // Custo estimado
  transportCost: number         // Custo de locomoção
  totalCost: number             // Custo total
  
  // Mensagem
  message?: string              // Mensagem adicional
  
  // Status
  status: 'novo' | 'contatado' | 'convertido'
  
  // Timestamps
  createdAt: string             // ISO 8601
}
\`\`\`

**Índices**:
- `status`
- `state`
- `createdAt`

**Regras de Segurança**:
- Leitura: Apenas admin
- Criação: Público
- Atualização: Não permitido
- Exclusão: Apenas admin

---

### 7. activity_logs

Armazena logs de auditoria do sistema.

**Caminho**: `/activity_logs/{logId}`

**Campos**:
\`\`\`typescript
{
  // Identificação
  id: string                    // ID auto-gerado
  
  // Ação
  action: string                // Tipo de ação
  description: string           // Descrição detalhada
  
  // Usuário
  userId: string                // Quem executou
  userName?: string             // Nome do usuário
  
  // Metadados
  metadata?: {
    processId?: string
    processTitle?: string
    fileName?: string
    [key: string]: any
  }
  
  // Timestamp
  timestamp: string             // ISO 8601
}
\`\`\`

**Índices**:
- `userId`
- `action`
- `timestamp`

**Regras de Segurança**:
- Leitura: Apenas admin
- Criação: Sistema (via activity-logger)
- Atualização: Não permitido
- Exclusão: Apenas admin

---

## Storage Structure

### Estrutura de Pastas

\`\`\`
/
├── profile-photos/
│   └── {userId}/
│       └── {fileName}
│
├── blog-images/
│   └── {timestamp}-{fileName}
│
├── processes/
│   └── {userId}/
│       └── {processId}/
│           └── {timestamp}_{fileName}
│
└── tasks/
    └── {processId}/
        └── {taskId}/
            └── {timestamp}_{fileName}
\`\`\`

### Regras de Tamanho

- **Fotos de perfil**: Máximo 5MB (JPG, PNG, WebP)
- **Imagens do blog**: Máximo 5MB (JPG, PNG, WebP)
- **Documentos de processos**: Máximo 10MB (PDF, JPG, PNG)
- **Arquivos de tarefas**: Máximo 10MB (PDF, JPG, PNG)

---

## Queries Comuns

### Buscar processos de um usuário
\`\`\`typescript
const q = query(
  collection(db, "processes"),
  where("userId", "==", userId),
  orderBy("createdAt", "desc")
)
\`\`\`

### Buscar processos por status
\`\`\`typescript
const q = query(
  collection(db, "processes"),
  where("status", "==", "in_progress"),
  orderBy("priority", "desc")
)
\`\`\`

### Buscar posts do blog
\`\`\`typescript
const q = query(
  collection(db, "blog_posts"),
  orderBy("publishedAt", "desc"),
  limit(10)
)
\`\`\`

### Buscar logs de atividade
\`\`\`typescript
const q = query(
  collection(db, "activity_logs"),
  where("userId", "==", userId),
  orderBy("timestamp", "desc"),
  limit(50)
)
\`\`\`

---

## Migrações

### Histórico de Mudanças

**v1.0.0** (Janeiro 2025)
- Schema inicial criado
- Coleções: users, processes, payment_plans, blog_posts, contact_messages, contact_requests, activity_logs

---

Última atualização: Janeiro 2025
