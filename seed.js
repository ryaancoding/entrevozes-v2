import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL não encontrada.");
  process.exit(1);
}

const connection = await mysql.createConnection(dbUrl);

await connection.execute(`
  INSERT IGNORE INTO articles 
  (title, slug, summary, articleLink, author, submittedBy, status)
  VALUES
  (
    'O que é o Reflorestamento do Imaginário?',
    'reflorestamento-do-imaginario',
    'Um texto introdutório sobre como reconstruir nossa forma de imaginar o futuro, a natureza e a sociedade.',
    'https://pt.wikipedia.org/wiki/Imagin%C3%A1rio',
    'Equipe Entrevozes',
    'admin',
    'approved'
  ),
  (
    'Educação, natureza e tecnologia',
    'educacao-natureza-tecnologia',
    'Reflexão sobre como a tecnologia pode ajudar no aprendizado sem afastar o ser humano da natureza.',
    'https://pt.wikipedia.org/wiki/Educa%C3%A7%C3%A3o_ambiental',
    'Equipe Entrevozes',
    'admin',
    'approved'
  )
`);

await connection.execute(`
  INSERT IGNORE INTO videos
  (title, description, url, thumbnail, duration, submittedBy, status)
  VALUES
  (
    'Vídeo introdutório sobre educação ambiental',
    'Conteúdo base para entender a relação entre sociedade, meio ambiente e aprendizagem.',
    'https://www.youtube.com/watch?v=8r0Z2gB9lDg',
    '',
    300,
    'admin',
    'approved'
  ),
  (
    'Tecnologia e futuro sustentável',
    'Vídeo de apoio para discussão sobre tecnologia, consciência ambiental e futuro.',
    'https://www.youtube.com/watch?v=H5jrxP9F4l4',
    '',
    420,
    'admin',
    'approved'
  )
`);

await connection.execute(`
  INSERT IGNORE INTO mind_maps
  (title, description, content, submittedBy, status)
  VALUES
  (
    'Mapa mental: Reflorestamento do Imaginário',
    'Organização das ideias principais do projeto.',
    '{"nodes":[{"id":"1","label":"Reflorestamento do Imaginário"},{"id":"2","label":"Natureza"},{"id":"3","label":"Educação"},{"id":"4","label":"Tecnologia"},{"id":"5","label":"Futuro Sustentável"}],"edges":[{"from":"1","to":"2"},{"from":"1","to":"3"},{"from":"1","to":"4"},{"from":"1","to":"5"}]}',
    'admin',
    'approved'
  )
`);

await connection.execute(`
  INSERT IGNORE INTO quiz_questions
  (question, options, correct_answer, explanation, submittedBy, status)
  VALUES
  (
    'Qual é a ideia principal do Reflorestamento do Imaginário?',
    '["Plantar árvores apenas em áreas urbanas","Reconstruir formas de pensar o futuro e a relação com a natureza","Criar uma rede social sobre florestas","Substituir livros por tecnologia"]',
    1,
    'A ideia central é ampliar a imaginação social, ecológica e cultural sobre o futuro.',
    'admin',
    'approved'
  ),
  (
    'Como a tecnologia pode ajudar nesse processo?',
    '["Apenas substituindo professores","Organizando conteúdos, conectando pessoas e facilitando o acesso ao conhecimento","Eliminando o contato com a natureza","Servindo apenas para entretenimento"]',
    1,
    'A tecnologia pode ser uma ferramenta de apoio para aprendizagem e organização de conhecimento.',
    'admin',
    'approved'
  )
`);

await connection.end();

console.log("Conteúdo inicial publicado com sucesso!");