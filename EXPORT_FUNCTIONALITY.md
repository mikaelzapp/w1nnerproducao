# Funcionalidade de Exportação de Dados

Este documento descreve a funcionalidade de exportação de dados implementada no painel administrativo da W1nner Engenharia.

## 📋 Visão Geral

O sistema permite que administradores exportem dados em múltiplos formatos:
- **CSV** - Para análise em planilhas (Excel, Google Sheets)
- **PDF** - Para relatórios formatados e impressão
- **JSON** - Para backup completo dos dados

## 🎯 Funcionalidades Disponíveis

### 1. Painel Administrativo Principal (`/admin`)

No painel principal, você pode exportar:

#### Processos
- **CSV**: Lista completa de processos com ID, título, cliente, email, status, progresso e datas
- **PDF**: Relatório formatado de todos os processos

#### Usuários
- **CSV**: Lista de usuários com ID, nome, email, telefone, total de processos e data de cadastro
- **PDF**: Relatório formatado de todos os usuários

#### Logs de Atividade
- **CSV**: Histórico completo de ações administrativas
- **PDF**: Relatório de logs com data/hora, ação, detalhes e admin responsável

#### Backup Completo
- **JSON**: Exportação completa de todos os dados do sistema (usuários, processos, posts do blog e logs)

### 2. Página de Usuários (`/admin/usuarios`)

- Botões de exportação no cabeçalho do card
- Exporta apenas os usuários filtrados pela busca atual
- Formatos: CSV e PDF

### 3. Página de Processos (`/admin/processos`)

- Botões de exportação no cabeçalho do card
- Exporta apenas os processos filtrados pela busca atual
- Formatos: CSV e PDF

### 4. Detalhes do Processo (`/admin/processos/[id]`)

- Botão "Exportar PDF" no cabeçalho da página
- Gera um relatório completo do processo incluindo:
  - Informações básicas (ID, título, cliente, status)
  - Descrição e observações
  - Histórico completo de atualizações (timeline)
  - Lista de documentos anexados com tamanhos e datas

## 🛠️ Implementação Técnica

### Arquivos Principais

#### `lib/export-utils.ts`
Biblioteca de utilitários para exportação com as seguintes funções:

\`\`\`typescript
// Exportar para CSV
exportToCSV(data: ExportData)

// Exportar para PDF
exportToPDF(data: ExportData)

// Exportar para JSON
exportToJSON(data: any, filename: string)

// Formatadores auxiliares
formatDateForExport(date: any): string
formatStatusForExport(status: string): string
\`\`\`

### Dependências

As seguintes bibliotecas são utilizadas:
- `jspdf` (v3.0.3) - Geração de PDFs
- `jspdf-autotable` (v5.0.2) - Tabelas formatadas em PDFs

Ambas já estão incluídas no `package.json`.

## 📊 Formato dos Dados Exportados

### CSV
- Codificação: UTF-8
- Separador: vírgula (,)
- Campos com vírgulas ou quebras de linha são automaticamente escapados com aspas
- Primeira linha contém os cabeçalhos

### PDF
- Formato: A4
- Fonte: Padrão do jsPDF (Helvetica)
- Tabelas formatadas com cabeçalhos em azul
- Título opcional no topo do documento
- Tamanho de fonte: 8pt para tabelas, 16pt para títulos

### JSON
- Formato: JSON indentado (2 espaços)
- Inclui metadados como data de exportação
- Estrutura completa dos objetos do Firestore

## 🔒 Segurança

- Apenas administradores autenticados podem acessar as funcionalidades de exportação
- Protegido pelo componente `<AdminRoute>`
- Requer permissões adequadas no Firestore (ver `FIREBASE_SETUP.md`)

## 💡 Exemplos de Uso

### Exportar Processos Filtrados

1. Acesse `/admin/processos`
2. Use a barra de busca para filtrar processos específicos
3. Clique em "CSV" ou "PDF" no cabeçalho do card
4. O arquivo será baixado automaticamente

### Gerar Relatório de Processo Individual

1. Acesse `/admin/processos/[id]` (clique em um processo)
2. Clique no botão "Exportar PDF" no cabeçalho
3. Um relatório completo será gerado e baixado

### Fazer Backup Completo

1. Acesse `/admin`
2. Na seção "Exportar Dados", clique em "JSON" em "Backup Completo"
3. Um arquivo JSON com todos os dados será baixado

## 🐛 Solução de Problemas

### Erro ao Exportar
- Verifique se as regras do Firestore estão configuradas corretamente
- Confirme que você está autenticado como administrador
- Verifique o console do navegador para mensagens de erro

### PDF não Gera Corretamente
- Certifique-se de que as dependências `jspdf` e `jspdf-autotable` estão instaladas
- Verifique se há dados disponíveis para exportação

### CSV com Caracteres Estranhos
- O arquivo é gerado em UTF-8
- Ao abrir no Excel, use "Importar Dados" em vez de abrir diretamente
- No Google Sheets, a importação é automática

## 🔄 Atualizações Futuras

Possíveis melhorias:
- Exportação agendada automática
- Envio de relatórios por email
- Filtros avançados antes da exportação
- Personalização de campos exportados
- Exportação em formato Excel (.xlsx)
- Gráficos e visualizações nos PDFs

## 📞 Suporte

Para problemas ou dúvidas sobre a funcionalidade de exportação, consulte:
- Documentação do Firebase: `FIREBASE_SETUP.md`
- Logs de atividade no painel administrativo
- Console do navegador para mensagens de erro detalhadas
