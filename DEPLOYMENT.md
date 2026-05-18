# Deployment Guide - Entrevozes

Este guia explica como preparar e fazer deploy do projeto Entrevozes na Vercel com banco de dados MySQL persistente.

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta em um provedor MySQL (Railway, PlanetScale, Aiven, etc.)
- Git configurado localmente
- Node.js 18+ instalado

## Passo 1: Criar Banco de Dados MySQL

Escolha um dos provedores abaixo e crie um banco MySQL:

### Opção 1: Railway (Recomendado)
1. Acesse [railway.app](https://railway.app)
2. Crie uma nova conta ou faça login
3. Clique em "New Project" → "Provision MySQL"
4. Aguarde o banco ser criado
5. Clique no banco e vá para "Connect"
6. Copie a string de conexão no formato: `mysql://user:password@host:port/railway`

### Opção 2: PlanetScale
1. Acesse [planetscale.com](https://planetscale.com)
2. Crie uma conta ou faça login
3. Crie um novo banco de dados
4. Vá para "Passwords" e gere uma nova senha
5. Copie a string de conexão: `mysql://user:password@aws.connect.psdb.cloud/database?sslaccept=strict`

### Opção 3: Aiven
1. Acesse [aiven.io](https://aiven.io)
2. Crie uma conta ou faça login
3. Crie um novo serviço MySQL
4. Vá para "Connection" e copie a string: `mysql://user:password@host:port/database?ssl-mode=REQUIRED`

## Passo 2: Preparar o Projeto Localmente

### 2.1 Configurar variáveis de ambiente local

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite .env.local e adicione sua DATABASE_URL
# DATABASE_URL=mysql://seu_usuario:sua_senha@seu_host:3306/seu_banco
```

### 2.2 Instalar dependências

```bash
pnpm install
```

### 2.3 Executar migrations do banco

```bash
# Gerar migrations baseado no schema
pnpm db:generate

# Aplicar migrations no banco
pnpm db:migrate

# Ou fazer tudo de uma vez
pnpm db:push
```

### 2.4 Testar localmente

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Abrir http://localhost:5173 no navegador
# Verificar se consegue criar artigos, vídeos, mapas mentais e quizzes
```

### 2.5 Validar persistência

1. Crie um artigo/vídeo/mapa mental/quiz
2. Atualize a página - o item deve continuar visível
3. Reinicie o servidor (`Ctrl+C` e `pnpm dev` novamente)
4. Confirme que os dados ainda estão lá

## Passo 3: Fazer Commit e Push

```bash
# Adicionar todas as mudanças
git add .

# Fazer commit
git commit -m "configura banco persistente para produção"

# Fazer push para o repositório
git push origin main
```

## Passo 4: Deploy na Vercel

### 4.1 Conectar repositório na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New..." → "Project"
3. Selecione seu repositório GitHub/GitLab/Bitbucket
4. Clique em "Import"

### 4.2 Configurar variáveis de ambiente

1. Na página do projeto, vá para "Settings" → "Environment Variables"
2. Adicione uma nova variável:
   - **Name:** `DATABASE_URL`
   - **Value:** Cole a string de conexão do seu banco MySQL
   - **Environments:** Selecione "Production", "Preview", "Development"
3. Clique em "Save"

### 4.3 Configurar build

1. Verifique se as configurações estão corretas:
   - **Framework Preset:** Node.js
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

2. Clique em "Deploy"

### 4.4 Aguardar deploy

O Vercel vai:
1. Instalar dependências (`pnpm install`)
2. Executar build (`pnpm build`)
3. Fazer deploy automático

Quando terminar, você receberá uma URL pública para acessar a aplicação.

## Passo 5: Testar em Produção

1. Acesse a URL fornecida pela Vercel
2. Faça login com sua conta
3. Crie um artigo/vídeo/mapa mental/quiz
4. Atualize a página - o item deve estar lá
5. Aguarde alguns minutos e acesse novamente - os dados devem persistir

## Troubleshooting

### Erro: "DATABASE_URL is not set"

**Solução:**
1. Verifique se a variável `DATABASE_URL` foi adicionada em Settings → Environment Variables
2. Redeploy o projeto (clique em "Redeploy" na página do projeto)

### Erro: "Failed to connect to database"

**Possíveis causas:**
1. String de conexão incorreta
2. Banco de dados não está acessível
3. Firewall bloqueando conexão

**Solução:**
1. Verifique a string de conexão no provedor
2. Teste a conexão localmente com `pnpm db:push`
3. Adicione IP da Vercel à whitelist do provedor (se necessário)

### Dados não persistem

**Solução:**
1. Verifique se `DATABASE_URL` está configurado
2. Verifique logs do Vercel (clique em "View Logs")
3. Teste localmente com `pnpm dev` para confirmar que funciona

### Build falha

**Solução:**
1. Verifique logs do build no Vercel
2. Teste localmente com `pnpm build`
3. Confirme que todas as dependências estão instaladas

## Estrutura de Dados

O banco MySQL contém as seguintes tabelas:

### users
- `id` (int, PK)
- `openId` (varchar, unique)
- `name` (text)
- `email` (varchar)
- `loginMethod` (varchar)
- `role` (enum: user, admin)
- `createdAt`, `updatedAt`, `lastSignedIn` (timestamp)

### articles
- `id` (int, PK)
- `title` (varchar)
- `slug` (varchar, unique)
- `summary` (text) - Resumo simples do artigo
- `articleLink` (varchar) - Link para o artigo completo externo
- `author` (varchar)
- `submittedBy` (varchar)
- `status` (enum: pending, approved, rejected)
- `createdAt`, `updatedAt` (timestamp)

### videos
- `id` (int, PK)
- `title` (varchar)
- `description` (text)
- `url` (varchar)
- `thumbnail` (varchar)
- `duration` (int)
- `submittedBy` (varchar)
- `status` (enum: pending, approved, rejected)
- `createdAt`, `updatedAt` (timestamp)

### mind_maps
- `id` (int, PK)
- `title` (varchar)
- `description` (text)
- `content` (text) - JSON structure
- `submittedBy` (varchar)
- `status` (enum: pending, approved, rejected)
- `createdAt`, `updatedAt` (timestamp)

### quiz_questions
- `id` (int, PK)
- `question` (varchar)
- `options` (text) - JSON array
- `correctAnswer` (int) - Index da resposta correta
- `explanation` (text)
- `submittedBy` (varchar)
- `status` (enum: pending, approved, rejected)
- `createdAt`, `updatedAt` (timestamp)

## Comandos Úteis

```bash
# Desenvolvimento local
pnpm dev

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start

# Gerar migrations
pnpm db:generate

# Aplicar migrations
pnpm db:migrate

# Fazer tudo de uma vez
pnpm db:push

# Executar testes
pnpm test

# Formatar código
pnpm format
```

## Segurança

- ✅ Arquivo `.env` está no `.gitignore` - nunca será commitado
- ✅ Variáveis de ambiente são configuradas na Vercel
- ✅ Credenciais do banco não estão expostas no código
- ✅ Apenas `DATABASE_URL` é necessário configurar

## Próximos Passos

1. Configurar domínio customizado (opcional)
2. Configurar CI/CD automático
3. Monitorar performance e logs
4. Fazer backup regular do banco de dados

## Suporte

Para mais informações:
- [Documentação Vercel](https://vercel.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [tRPC](https://trpc.io)
