# W1nner Engenharia e Topografia

Sistema completo de gestão para empresa de engenharia e topografia, incluindo portal do cliente, painel administrativo, sistema de processos, regularização fundiária e integração com gateway de pagamentos.

## 🚀 Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Banco de Dados**: Firebase Firestore
- **Armazenamento**: Firebase Storage
- **Autenticação**: Firebase Authentication
- **Pagamentos**: Asaas API
- **IA**: Vercel AI SDK (OpenAI, Anthropic, xAI)
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **PDF**: jsPDF

## 📋 Funcionalidades Principais

### Portal Público
- **Landing Page**: Apresentação da empresa com serviços e estatísticas
- **Página de Serviços**: Detalhamento completo dos serviços oferecidos
- **Simulador de Orçamento**: Calculadora interativa para regularização fundiária
  - Cálculo baseado em área, tipo de terreno, estado, dificuldade de acesso
  - 10 métodos de regularização (REURB, Usucapião, INCRA, etc.)
  - Assistente IA para dúvidas
  - Geração de PDF do orçamento
  - Envio para WhatsApp
- **Formulário de Contato**: Envio de mensagens para a equipe
- **Blog**: Artigos e notícias sobre engenharia e topografia

### Portal do Cliente
- **Dashboard**: Visão geral de processos e tarefas
- **Meus Processos**: Acompanhamento de processos em andamento
- **Upload de Documentos**: Envio de documentos solicitados
- **Perfil**: Gerenciamento de dados pessoais e foto
- **Notificações**: Alertas sobre atualizações nos processos

### Painel Administrativo
- **Dashboard**: Métricas e estatísticas gerais
- **Gestão de Usuários**: CRUD completo de usuários
- **Gestão de Processos**: Criação e acompanhamento de processos
  - Solicitação de documentos
  - Aprovação/rejeição de arquivos
  - Criação de tarefas
  - Timeline de atividades
- **Gestão de Planos**: Criação de planos de pagamento com Asaas
- **Blog**: Criação e edição de posts
- **Logs de Atividade**: Auditoria completa do sistema

## 🏗️ Estrutura do Projeto

\`\`\`
w1nner-main/
├── app/                          # Páginas Next.js (App Router)
│   ├── page.tsx                  # Landing page
│   ├── servicos/                 # Página de serviços
│   ├── contato/                  # Formulário de contato
│   ├── orcamento/                # Simulador de orçamento
│   ├── blog/                     # Blog público
│   ├── portal/                   # Portal do cliente
│   │   ├── page.tsx              # Dashboard do cliente
│   │   ├── processos/            # Processos do cliente
│   │   ├── upload/               # Upload de documentos
│   │   └── perfil/               # Perfil do usuário
│   ├── admin/                    # Painel administrativo
│   │   ├── page.tsx              # Dashboard admin
│   │   ├── usuarios/             # Gestão de usuários
│   │   ├── processos/            # Gestão de processos
│   │   ├── cobranca/             # Gestão de planos
│   │   └── blog/                 # Gestão do blog
│   └── api/                      # API Routes
│       └── assistant/            # Assistente IA
├── components/                   # Componentes React
│   ├── ui/                       # Componentes shadcn/ui
│   ├── navigation.tsx            # Menu de navegação
│   ├── footer.tsx                # Rodapé
│   ├── admin-route.tsx           # Proteção de rotas admin
│   └── protected-route.tsx       # Proteção de rotas autenticadas
├── lib/                          # Bibliotecas e utilitários
│   ├── firebase/                 # Configuração Firebase
│   │   ├── config.ts             # Inicialização Firebase
│   │   ├── auth-context.tsx      # Context de autenticação
│   │   └── activity-logger.ts    # Logger de atividades
│   ├── asaas/                    # Integração Asaas
│   │   └── client.ts             # Cliente API Asaas
│   ├── utils/                    # Utilitários
│   │   ├── regularization.ts     # Cálculos de regularização
│   │   └── pdf-generator.ts      # Geração de PDFs
│   └── export-utils.ts           # Exportação de dados
├── firestore.rules               # Regras de segurança Firestore
├── storage.rules                 # Regras de segurança Storage
└── public/                       # Arquivos estáticos

\`\`\`

## 🔐 Segurança

### Firestore Security Rules
- Validação rigorosa de tipos de dados
- Verificação de autenticação e autorização
- Proteção contra injeção de dados maliciosos
- Validação de tamanhos e formatos de campos
- Bloqueio padrão para coleções não especificadas

### Storage Security Rules
- Validação de tipos de arquivo (PDF, imagens)
- Limites de tamanho (5MB para imagens, 10MB para documentos)
- Verificação de nomes de arquivo seguros
- Controle de acesso baseado em propriedade

### Boas Práticas Implementadas
- Sanitização de entrada no assistente IA
- Proteção de rotas com componentes de guarda
- Variáveis de ambiente para chaves sensíveis
- Logs de auditoria para ações críticas
- Rate limiting recomendado via Firebase App Check

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Firebase
- Conta Asaas (para pagamentos)

### Configuração

1. Clone o repositório:
\`\`\`bash
git clone <repository-url>
cd w1nner-main
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Asaas
ASAAS_API_KEY=

# Supabase (para desenvolvimento)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=
\`\`\`

4. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication (Email/Password)
   - Ative Firestore Database
   - Ative Storage
   - Copie as credenciais para as variáveis de ambiente

5. Deploy das regras de segurança:
\`\`\`bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
\`\`\`

6. Execute o projeto:
\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:3000

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outros Provedores
O projeto é compatível com qualquer provedor que suporte Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Railway

## 📱 Responsividade

O site é 100% responsivo e otimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

Breakpoints Tailwind utilizados:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

## 🎨 Design System

### Cores
- **Primary**: Preto (#000000) - Marca principal
- **Secondary**: Cinza claro (#F5F5F5) - Backgrounds
- **Muted**: Cinza médio (#737373) - Textos secundários
- **Accent**: Cinza escuro (#262626) - Destaques

### Tipografia
- **Sans**: Geist Sans - Textos gerais
- **Serif**: Playfair Display - Títulos e destaques

### Componentes
Baseados em shadcn/ui com customizações:
- Buttons, Cards, Dialogs, Forms
- Tables, Tabs, Toasts, Tooltips
- Charts (Recharts), Calendars, Selects

## 📚 Documentação Adicional

- [Guia do Usuário](./USER_GUIDE.md) - Para clientes
- [Guia do Administrador](./ADMIN_GUIDE.md) - Para administradores
- [Guia do Desenvolvedor](./DEVELOPER_GUIDE.md) - Para desenvolvedores
- [Arquitetura](./ARCHITECTURE.md) - Detalhes técnicos
- [Schema do Banco](./DATABASE_SCHEMA.md) - Estrutura Firestore
- [API](./API_DOCUMENTATION.md) - Endpoints e integrações

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da W1nner Engenharia e Topografia.

## 📞 Suporte

- Email: contato@w1nner.com.br
- WhatsApp: +55 47 99638-4548
- Site: https://w1nner.com.br

---

Desenvolvido com ❤️ pela equipe W1nner
"# w1nnerproducao" 
