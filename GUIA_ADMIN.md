# 👨‍💼 Guia do Administrador - Painel Admin W1nner

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Acesso ao Painel](#acesso-ao-painel)
3. [Dashboard](#dashboard)
4. [Gestão de Processos](#gestão-de-processos)
5. [Gestão de Usuários](#gestão-de-usuários)
6. [Gestão de Blog](#gestão-de-blog)
7. [Mensagens de Contato](#mensagens-de-contato)
8. [Sistema de Prazos](#sistema-de-prazos)
9. [Boas Práticas](#boas-práticas)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Painel Administrativo W1nner é uma ferramenta completa para gerenciar todos os aspectos da plataforma, incluindo processos, usuários, documentos, blog e muito mais.

### Responsabilidades do Admin

- Criar e gerenciar processos
- Solicitar e revisar documentos
- Gerenciar tarefas administrativas
- Definir e monitorar prazos
- Gerenciar usuários
- Publicar conteúdo no blog
- Responder mensagens de contato
- Monitorar atividades do sistema

---

## 🔐 Acesso ao Painel

### Como se Tornar Admin

1. Conta deve ser criada normalmente
2. UID deve ser adicionado às regras do Firestore como admin
3. Ou receber permissão de admin via custom claims (futuro)

### Fazer Login como Admin

1. Acesse [www.w1nner.com.br/login](http://www.w1nner.com.br/login)
2. Use suas credenciais de admin
3. Você será redirecionado para `/admin`

### Proteção de Rotas

Todas as rotas `/admin/*` são protegidas:
- Verificação de autenticação
- Verificação de papel de admin
- Redirecionamento automático se não autorizado

---

## 📊 Dashboard

### Visão Geral

O dashboard admin mostra:

#### Estatísticas Principais
- Total de processos por status
- Total de usuários
- Processos recentes
- Atividades recentes

#### Cards de Métricas
- **Processos Pendentes**: Processos aguardando início
- **Em Andamento**: Processos ativos
- **Concluídos**: Processos finalizados
- **Usuários Ativos**: Total de usuários cadastrados

#### Processos Recentes
- Lista dos 5 processos mais recentes
- Status visual
- Link direto para detalhes

#### Atividades Recentes
- Log das últimas ações no sistema
- Quem fez o quê e quando
- Link para processo relacionado

---

## 📁 Gestão de Processos

### Criar Novo Processo

#### Passo a Passo

1. Acesse "Processos" no menu admin
2. Clique em "Novo Processo"
3. Preencha o formulário:

**Campos Obrigatórios:**
- **Título**: Nome descritivo do processo
- **Descrição**: Detalhes do que será feito
- **Cliente**: Selecione o usuário (busca por nome ou email)
- **Status**: Pendente (padrão)

**Campos Opcionais:**
- **Prazo Geral**: Data limite para conclusão do processo
  - ⚠️ **Importante**: Se definido, o processo será encerrado automaticamente se o prazo vencer
  - Use apenas quando houver um prazo real e crítico
  - Sistema verifica diariamente às 00:00 UTC

4. Clique em "Criar Processo"
5. Processo é criado e cliente é notificado

#### Dicas para Criar Processos

- Use títulos claros e descritivos
- Inclua todos os detalhes relevantes na descrição
- Defina prazo geral apenas se necessário
- Considere tempo realista para conclusão
- Adicione margem de segurança no prazo

### Listar Processos

#### Visualização

- Todos os processos do sistema
- Filtros por status
- Busca por título ou cliente
- Ordenação por data

#### Ações Rápidas

- Ver detalhes
- Editar
- Atualizar status
- Deletar (com confirmação)

### Detalhes do Processo

#### Informações Exibidas

**Cabeçalho:**
- Título
- Status com badge colorido
- Prazo geral (se definido) com indicador de urgência
- Cliente (nome e email)
- Datas de criação e atualização

**Abas:**

1. **Visão Geral**
   - Descrição completa
   - Informações do cliente
   - Estatísticas (documentos, tarefas)

2. **Timeline**
   - Histórico completo de ações
   - Quem fez o quê e quando
   - Ordenado do mais recente para o mais antigo

3. **Documentos**
   - Lista de documentos solicitados
   - Status de cada documento
   - Prazos individuais
   - Ações: aprovar, rejeitar, adicionar comentário

4. **Tarefas**
   - Lista de tarefas administrativas
   - Status de cada tarefa
   - Prazos individuais
   - Ações: marcar como concluída, editar

#### Ações Disponíveis

- **Atualizar Status**: Mudar status do processo
- **Solicitar Documento**: Adicionar novo requisito
- **Criar Tarefa**: Adicionar nova tarefa administrativa
- **Adicionar Observação**: Registrar nota na timeline
- **Editar Processo**: Alterar informações básicas
- **Deletar Processo**: Remover processo (irreversível)

### Solicitar Documentos

#### Como Solicitar

1. Nos detalhes do processo, vá para aba "Documentos"
2. Clique em "Solicitar Documento"
3. Preencha o formulário:

**Campos:**
- **Título**: Nome do documento (ex: "RG - Frente e Verso")
- **Descrição**: Instruções detalhadas sobre o documento
- **Prazo**: Data limite para envio (opcional mas recomendado)
  - ⚠️ Se não enviado no prazo, pode causar encerramento do processo
  - Sistema verifica diariamente

4. Clique em "Adicionar Requisito"
5. Cliente verá o documento na lista de pendentes

#### Boas Práticas

- Seja específico no título
- Forneça instruções claras na descrição
- Defina prazo realista
- Agrupe documentos relacionados
- Solicite apenas documentos necessários

### Revisar Documentos

#### Quando Cliente Envia

1. Documento aparece com status "Enviado"
2. Você pode visualizar o arquivo
3. Revise cuidadosamente

#### Aprovar Documento

1. Clique em "Aprovar"
2. Status muda para "Aprovado"
3. Ação é registrada na timeline

#### Rejeitar Documento

1. Clique em "Rejeitar"
2. **Obrigatório**: Adicione comentário explicando o motivo
3. Status volta para "Pendente"
4. Cliente vê o comentário e pode reenviar

#### Motivos Comuns para Rejeição

- Documento ilegível
- Informações incompletas
- Documento errado
- Qualidade ruim da digitalização
- Documento vencido
- Falta de assinatura

### Gerenciar Tarefas

#### Criar Tarefa

1. Nos detalhes do processo, vá para aba "Tarefas"
2. Clique em "Nova Tarefa"
3. Preencha:
   - **Título**: Nome da tarefa
   - **Descrição**: Detalhes do que precisa ser feito
   - **Prazo**: Data limite (opcional)
   - **Responsável**: Quem vai executar (opcional)

4. Clique em "Criar Tarefa"

#### Marcar como Concluída

1. Encontre a tarefa na lista
2. Clique em "Marcar como Concluída"
3. Status muda e data de conclusão é registrada

#### Tipos de Tarefas

- **Análise de documentos**
- **Visita técnica**
- **Elaboração de projeto**
- **Aprovação em órgãos**
- **Emissão de certidões**
- **Reunião com cliente**
- **Outras atividades internas**

### Atualizar Status do Processo

#### Status Disponíveis

1. **Pendente** (🟡)
   - Processo criado, aguardando início
   - Use quando: processo acabou de ser criado

2. **Em Andamento** (🔵)
   - Processo sendo trabalhado ativamente
   - Use quando: começar a trabalhar no processo

3. **Concluído** (🟢)
   - Processo finalizado com sucesso
   - Use quando: tudo estiver pronto e entregue

4. **Cancelado** (🔴)
   - Processo encerrado sem conclusão
   - Use quando: cliente desistir ou prazo vencer

#### Como Atualizar

1. Nos detalhes do processo, clique em "Atualizar Status"
2. Selecione o novo status
3. Adicione observação (opcional mas recomendado)
4. Confirme
5. Cliente é notificado

---

## 👥 Gestão de Usuários

### Listar Usuários

#### Visualização

- Todos os usuários cadastrados
- Informações: nome, email, CPF, telefone, papel, data de cadastro
- Busca por nome ou email
- Filtro por papel (user/admin)

### Ver Detalhes do Usuário

#### Informações Exibidas

- Dados pessoais completos
- Data de cadastro
- Data de aceitação dos termos
- Processos do usuário
- Atividades recentes

### Editar Usuário

#### Campos Editáveis

- Nome
- Telefone
- Papel (user/admin)

#### Campos Não Editáveis

- Email (identificador único)
- CPF (documento)
- Data de cadastro

### Promover a Admin

1. Acesse detalhes do usuário
2. Clique em "Editar"
3. Altere papel para "admin"
4. Salve
5. Usuário terá acesso ao painel admin no próximo login

### Desativar Usuário

**Nota**: Funcionalidade em desenvolvimento

Atualmente, para desativar um usuário:
1. Entre em contato com suporte técnico
2. Ou delete manualmente no Firebase Console

---

## 📝 Gestão de Blog

### Criar Post

#### Passo a Passo

1. Acesse "Blog" no menu admin
2. Clique em "Novo Post"
3. Preencha o formulário:

**Campos:**
- **Título**: Título do post (3-200 caracteres)
- **Resumo**: Breve descrição (10-500 caracteres)
- **Conteúdo**: Texto completo do post (10-50000 caracteres)
- **Categoria**: Categoria do post (opcional)
- **Imagem de Capa**: Upload de imagem principal (opcional)
- **Imagens Adicionais**: Múltiplas imagens (opcional)

4. Clique em "Publicar"

#### Dicas para Posts

- Use títulos atrativos e descritivos
- Resumo deve despertar interesse
- Conteúdo deve ser informativo e bem formatado
- Use imagens de qualidade
- Revise antes de publicar
- Categorize adequadamente

### Editar Post

1. Na lista de posts, clique em "Editar"
2. Altere os campos desejados
3. Clique em "Atualizar"

### Deletar Post

1. Na lista de posts, clique em "Deletar"
2. Confirme a ação
3. Post é removido permanentemente

### Upload de Imagens

#### Formatos Aceitos
- JPG/JPEG
- PNG
- WebP

#### Tamanho Máximo
- 10MB por imagem

#### Boas Práticas
- Use imagens otimizadas
- Resolução adequada (1200x630px para capa)
- Nomes descritivos
- Compressão sem perda de qualidade

---

## 📧 Mensagens de Contato

### Visualizar Mensagens

#### Lista de Mensagens

- Todas as mensagens recebidas via formulário de contato
- Informações: nome, email, telefone, assunto, mensagem, data
- Status: novo, lido, respondido
- Ordenação por data (mais recentes primeiro)

### Marcar como Lida

1. Clique na mensagem
2. Status muda automaticamente para "lido"

### Responder Mensagem

**Opções:**

1. **Via Email**
   - Clique no email do remetente
   - Seu cliente de email abrirá
   - Responda normalmente

2. **Via WhatsApp**
   - Clique no telefone (se fornecido)
   - WhatsApp Web abrirá
   - Envie mensagem

### Deletar Mensagem

1. Clique em "Deletar"
2. Confirme a ação
3. Mensagem é removida permanentemente

---

## ⏰ Sistema de Prazos

### Como Funciona

#### Verificação Automática

- **Frequência**: Diário às 00:00 UTC (21:00 horário de Brasília)
- **Método**: Cron job da Vercel
- **Endpoint**: `/api/check-deadlines`

#### O que é Verificado

1. **Prazo Geral do Processo**
   - Se vencido: processo é encerrado

2. **Prazos de Documentos Obrigatórios**
   - Se vencido e não enviado: processo é encerrado

3. **Prazos de Tarefas Críticas**
   - Se vencido e não concluída: processo é encerrado

#### Ação Automática

Quando um prazo vence:
1. Status do processo muda para "Cancelado"
2. Entrada é adicionada na timeline explicando o motivo
3. Log é registrado no sistema

### Definir Prazos

#### Prazo Geral do Processo

**Quando definir:**
- Processos com deadline real do cliente
- Processos com prazos legais
- Processos urgentes

**Quando NÃO definir:**
- Processos sem prazo específico
- Processos de longo prazo indefinido
- Processos em fase de negociação

**Como definir:**
1. Ao criar processo, preencha campo "Prazo Geral"
2. Escolha data realista
3. Considere:
   - Complexidade do processo
   - Quantidade de documentos necessários
   - Tempo de resposta do cliente
   - Tempo de análise e aprovação
   - Margem de segurança

#### Prazo de Documento

**Quando definir:**
- Sempre que possível
- Documentos críticos para o processo
- Documentos com prazo de validade

**Como definir:**
1. Ao solicitar documento, preencha campo "Prazo"
2. Considere:
   - Dificuldade de obtenção do documento
   - Disponibilidade do cliente
   - Urgência do processo
   - Tempo de revisão

**Prazo recomendado:**
- Documentos simples: 3-7 dias
- Documentos complexos: 7-15 dias
- Documentos de órgãos: 15-30 dias

#### Prazo de Tarefa

**Quando definir:**
- Tarefas com deadline
- Tarefas críticas para o processo
- Tarefas dependentes de outras

**Como definir:**
1. Ao criar tarefa, preencha campo "Prazo"
2. Considere:
   - Complexidade da tarefa
   - Disponibilidade da equipe
   - Dependências
   - Urgência

### Monitorar Prazos

#### Indicadores Visuais

No painel admin, você verá:

- 🟢 **Verde**: Mais de 7 dias - Tranquilo
- 🟡 **Amarelo**: 4-7 dias - Atenção
- 🟠 **Laranja**: 1-3 dias - Urgente
- 🔴 **Vermelho**: < 1 dia ou vencido - CRÍTICO

#### Dashboard de Prazos

**Funcionalidade futura:**
- Lista de processos próximos ao vencimento
- Alertas de prazos críticos
- Relatório de prazos vencidos

### Estender Prazos

**Como fazer:**

1. Acesse detalhes do processo
2. Clique em "Editar Processo"
3. Altere o prazo geral
4. Ou edite o prazo do documento/tarefa específico
5. Salve as alterações

**Boas práticas:**
- Comunique-se com o cliente
- Documente o motivo da extensão
- Adicione observação na timeline
- Defina novo prazo realista

---

## 💡 Boas Práticas

### Gestão de Processos

1. **Seja Organizado**
   - Use títulos padronizados
   - Mantenha descrições atualizadas
   - Atualize status regularmente

2. **Comunique-se Claramente**
   - Instruções detalhadas para documentos
   - Comentários construtivos ao rejeitar
   - Observações relevantes na timeline

3. **Defina Prazos Realistas**
   - Considere complexidade
   - Adicione margem de segurança
   - Comunique prazos ao cliente

4. **Monitore Ativamente**
   - Verifique processos diariamente
   - Responda rapidamente a documentos enviados
   - Antecipe problemas

5. **Documente Tudo**
   - Registre decisões importantes
   - Adicione observações relevantes
   - Mantenha timeline atualizada

### Gestão de Documentos

1. **Seja Específico**
   - Título claro do documento
   - Instruções detalhadas
   - Exemplos quando necessário

2. **Revise Rapidamente**
   - Não deixe documentos pendentes
   - Feedback claro e construtivo
   - Aprove ou rejeite prontamente

3. **Comunique Rejeições**
   - Explique claramente o motivo
   - Seja educado e profissional
   - Ofereça orientação para correção

### Gestão de Usuários

1. **Respeite a Privacidade**
   - Acesse dados apenas quando necessário
   - Não compartilhe informações pessoais
   - Siga LGPD

2. **Seja Profissional**
   - Trate todos com respeito
   - Responda prontamente
   - Mantenha comunicação clara

### Gestão de Blog

1. **Qualidade do Conteúdo**
   - Revise antes de publicar
   - Use linguagem profissional
   - Forneça informações úteis

2. **SEO**
   - Use títulos descritivos
   - Inclua palavras-chave relevantes
   - Adicione meta descrições

3. **Imagens**
   - Use imagens de qualidade
   - Otimize tamanho
   - Adicione alt text

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Não Consigo Criar Processo

**Possíveis causas:**
- Campos obrigatórios não preenchidos
- Cliente não selecionado
- Erro de conexão

**Soluções:**
1. Verifique todos os campos
2. Recarregue a página
3. Tente novamente
4. Verifique console do navegador para erros

#### Documento Não Aparece Após Upload

**Possíveis causas:**
- Upload não completou
- Erro de permissão no Storage
- Arquivo muito grande

**Soluções:**
1. Verifique tamanho do arquivo (< 10MB)
2. Verifique formato (PDF, JPG, PNG)
3. Tente fazer upload novamente
4. Verifique regras do Storage

#### Cron Job Não Executou

**Possíveis causas:**
- CRON_SECRET incorreto
- Erro na configuração do vercel.json
- Quota de execuções excedida

**Soluções:**
1. Verifique variável de ambiente CRON_SECRET
2. Verifique configuração no vercel.json
3. Verifique logs da Vercel
4. Execute manualmente via API

#### Usuário Não Recebe Notificações

**Nota**: Sistema de notificações por email está em desenvolvimento

**Solução temporária:**
- Entre em contato diretamente com o cliente
- Use WhatsApp ou telefone

### Logs e Debugging

#### Acessar Logs

1. **Logs de Atividade**
   - Dashboard admin → Atividades Recentes
   - Mostra últimas ações no sistema

2. **Logs da Vercel**
   - Acesse dashboard da Vercel
   - Vá para "Logs"
   - Filtre por função ou erro

3. **Console do Navegador**
   - F12 para abrir DevTools
   - Aba "Console"
   - Veja erros JavaScript

#### Reportar Problemas

Ao reportar um problema, inclua:
- Descrição detalhada
- Passos para reproduzir
- Mensagens de erro
- Screenshots
- Navegador e versão
- Data e hora do ocorrido

---

## 📞 Suporte Técnico

### Contatos

- **Email**: suporte@w1nner.com.br
- **WhatsApp**: +55 47 99638-4548
- **Horário**: Segunda a Sexta, 8h às 18h

### Documentação Adicional

- [DOCUMENTACAO_COMPLETA.md](DOCUMENTACAO_COMPLETA.md) - Documentação técnica completa
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Schema do banco de dados
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura do sistema

---

**Última atualização:** Janeiro 2025  
**Versão do guia:** 1.0

---

**Obrigado por fazer parte da equipe W1nner!** 🏆
