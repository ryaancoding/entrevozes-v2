# EntreVozes - Project TODO

## Database & Backend
- [x] Configurar schema do banco de dados (drizzle/schema.ts) com tabelas articles, videos, mind_maps, quiz_questions
- [x] Executar migrações SQL via webdev_execute_sql
- [x] Implementar helpers de banco de dados (server/db.ts) para CRUD de artigos
- [x] Implementar helpers de banco de dados (server/db.ts) para CRUD de vídeos
- [x] Implementar helpers de banco de dados (server/db.ts) para CRUD de mapas mentais
- [x] Implementar helpers de banco de dados (server/db.ts) para CRUD de quizzes
- [x] Criar roteadores tRPC (server/routers.ts) para artigos com procedures CRUD e fluxo de aprovação
- [x] Criar roteadores tRPC (server/routers.ts) para vídeos com procedures CRUD e fluxo de aprovação
- [x] Criar roteadores tRPC (server/routers.ts) para mapas mentais com procedures CRUD e fluxo de aprovação
- [x] Criar roteadores tRPC (server/routers.ts) para quizzes com procedures CRUD e fluxo de aprovação
- [x] Criar procedure tRPC para listar conteúdos pendentes de moderação

## Frontend - Pages
- [x] Implementar página de Artigos (client/src/pages/Articles.tsx) com listagem e submissão
- [x] Implementar página de Vídeos (client/src/pages/Videos.tsx) com listagem e submissão
- [x] Implementar página de Mapas Mentais (client/src/pages/MindMaps.tsx) com listagem e submissão
- [x] Implementar página de Quiz (client/src/pages/Quiz.tsx) com questões e pontuação
- [x] Implementar página de Admin (client/src/pages/Admin.tsx) com painel de moderação
- [x] Implementar página Home (client/src/pages/Home.tsx) com landing page da plataforma

## Frontend - Navigation & Layout
- [x] Criar componente MainNav.tsx com navegação principal
- [x] Configurar rotas em App.tsx com todas as páginas
- [x] Implementar controle de acesso para página Admin (role=admin)

## Styling & Theme
- [x] Aplicar identidade visual EntreVozes em index.css
- [x] Definir paleta de cores coerente com tema da plataforma
- [x] Configurar tipografia e espaçamento global

## Testing
- [x] Escrever testes unitários com Vitest para helpers de banco de dados
- [x] Corrigir navegação em Home.tsx e MainNav.tsx (remover anchors aninhados)
- [x] Corrigir proteção de rota Admin com useEffect
- [x] Corrigir lógica de progressão e pontuação do Quiz
- [x] Adicionar tipografia global (Inter font e regras de escala)

## Deployment
- [x] Criar checkpoint final do projeto
- [x] Entregar projeto ao usuário
