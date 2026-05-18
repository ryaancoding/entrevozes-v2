import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function splitOptions(value: string) {
  return value
    .split("\n")
    .map(option => option.trim())
    .filter(Boolean);
}

export default function Submit() {
  const [submittedBy, setSubmittedBy] = useState("");

  const [articleTitle, setArticleTitle] = useState("");
  const [articleSummary, setArticleSummary] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [articleAuthor, setArticleAuthor] = useState("");

  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoDuration, setVideoDuration] = useState("");

  const [mindTitle, setMindTitle] = useState("");
  const [mindDescription, setMindDescription] = useState("");
  const [mindTopics, setMindTopics] = useState("");

  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState("");
  const [quizCorrect, setQuizCorrect] = useState("0");
  const [quizExplanation, setQuizExplanation] = useState("");

  const commonSubmitter = submittedBy.trim() || "Visitante";

  const articleMutation = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success("Artigo enviado! Aguarde aprovação do administrador.");
      setArticleTitle("");
      setArticleSummary("");
      setArticleLink("");
      setArticleAuthor("");
    },
    onError: error => toast.error(error.message),
  });

  const videoMutation = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Vídeo enviado! Aguarde aprovação do administrador.");
      setVideoTitle("");
      setVideoDescription("");
      setVideoUrl("");
      setVideoThumbnail("");
      setVideoDuration("");
    },
    onError: error => toast.error(error.message),
  });

  const mindMutation = trpc.mindMaps.create.useMutation({
    onSuccess: () => {
      toast.success("Mapa mental enviado! Aguarde aprovação do administrador.");
      setMindTitle("");
      setMindDescription("");
      setMindTopics("");
    },
    onError: error => toast.error(error.message),
  });

  const quizMutation = trpc.quizQuestions.create.useMutation({
    onSuccess: () => {
      toast.success("Questão enviada! Aguarde aprovação do administrador.");
      setQuizQuestion("");
      setQuizOptions("");
      setQuizCorrect("0");
      setQuizExplanation("");
    },
    onError: error => toast.error(error.message),
  });

  const submitArticle = (event: React.FormEvent) => {
    event.preventDefault();
    const title = articleTitle.trim();
    if (!title || !articleSummary.trim()) {
      toast.error("Informe título e resumo.");
      return;
    }

    articleMutation.mutate({
      title,
      slug: slugify(title),
      summary: articleSummary.trim(),
      articleLink: articleLink.trim() || undefined,
      author: articleAuthor.trim() || undefined,
      submittedBy: commonSubmitter,
    });
  };

  const submitVideo = (event: React.FormEvent) => {
    event.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) {
      toast.error("Informe título e URL do vídeo.");
      return;
    }

    articleMutation.reset();
    videoMutation.mutate({
      title: videoTitle.trim(),
      description: videoDescription.trim() || undefined,
      url: videoUrl.trim(),
      thumbnail: videoThumbnail.trim() || undefined,
      duration: videoDuration.trim() ? Number(videoDuration) : undefined,
      submittedBy: commonSubmitter,
    });
  };

  const submitMindMap = (event: React.FormEvent) => {
    event.preventDefault();
    const topics = splitOptions(mindTopics);
    if (!mindTitle.trim() || topics.length === 0) {
      toast.error("Informe título e pelo menos um tópico.");
      return;
    }

    mindMutation.mutate({
      title: mindTitle.trim(),
      description: mindDescription.trim() || undefined,
      content: JSON.stringify({
        tema: mindTitle.trim(),
        topicos: topics,
      }),
      submittedBy: commonSubmitter,
    });
  };

  const submitQuiz = (event: React.FormEvent) => {
    event.preventDefault();
    const options = splitOptions(quizOptions);
    const correctAnswer = Number(quizCorrect);

    if (!quizQuestion.trim() || options.length < 2) {
      toast.error("Informe a pergunta e pelo menos duas opções.");
      return;
    }

    if (Number.isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
      toast.error("A resposta correta precisa ser um número válido. Exemplo: 0 para a primeira opção.");
      return;
    }

    quizMutation.mutate({
      question: quizQuestion.trim(),
      options: JSON.stringify(options),
      correctAnswer,
      explanation: quizExplanation.trim() || undefined,
      submittedBy: commonSubmitter,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-red-900">Enviar conteúdo</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Envie artigos, vídeos, mapas mentais ou questões para o EntreVozes. O conteúdo fica pendente e só aparece no site depois da aprovação do administrador.
          </p>
        </div>

        <Card className="border-red-100 shadow-lg">
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
            <CardDescription>Esse nome aparece para o administrador saber quem enviou.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="submittedBy">Seu nome ou e-mail</Label>
              <Input
                id="submittedBy"
                placeholder="Ex.: Ryan / turma A / seuemail@email.com"
                value={submittedBy}
                onChange={event => setSubmittedBy(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="article" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="article">Artigo</TabsTrigger>
            <TabsTrigger value="video">Vídeo</TabsTrigger>
            <TabsTrigger value="mindmap">Mapa</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="article">
            <Card>
              <CardHeader>
                <CardTitle>Enviar artigo</CardTitle>
                <CardDescription>Coloque um resumo simples e o link para o artigo real.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitArticle} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={articleTitle} onChange={event => setArticleTitle(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Resumo</Label>
                    <Textarea value={articleSummary} onChange={event => setArticleSummary(event.target.value)} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Link do artigo real</Label>
                    <Input value={articleLink} onChange={event => setArticleLink(event.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Autor</Label>
                    <Input value={articleAuthor} onChange={event => setArticleAuthor(event.target.value)} />
                  </div>
                  <Button type="submit" disabled={articleMutation.isPending} className="gap-2">
                    {articleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Enviar para aprovação
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>Enviar vídeo</CardTitle>
                <CardDescription>Use links do YouTube ou outra plataforma.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitVideo} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={videoTitle} onChange={event => setVideoTitle(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>URL do vídeo</Label>
                    <Input value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea value={videoDescription} onChange={event => setVideoDescription(event.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Thumbnail opcional</Label>
                    <Input value={videoThumbnail} onChange={event => setVideoThumbnail(event.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração em segundos opcional</Label>
                    <Input type="number" value={videoDuration} onChange={event => setVideoDuration(event.target.value)} />
                  </div>
                  <Button type="submit" disabled={videoMutation.isPending} className="gap-2">
                    {videoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Enviar para aprovação
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mindmap">
            <Card>
              <CardHeader>
                <CardTitle>Enviar mapa mental</CardTitle>
                <CardDescription>Digite um tópico por linha.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitMindMap} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={mindTitle} onChange={event => setMindTitle(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea value={mindDescription} onChange={event => setMindDescription(event.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tópicos</Label>
                    <Textarea value={mindTopics} onChange={event => setMindTopics(event.target.value)} rows={6} placeholder={"Natureza\nEducação\nTecnologia"} />
                  </div>
                  <Button type="submit" disabled={mindMutation.isPending} className="gap-2">
                    {mindMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Enviar para aprovação
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle>Enviar questão de quiz</CardTitle>
                <CardDescription>Digite uma opção por linha. A primeira opção tem índice 0.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitQuiz} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pergunta</Label>
                    <Textarea value={quizQuestion} onChange={event => setQuizQuestion(event.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Opções</Label>
                    <Textarea value={quizOptions} onChange={event => setQuizOptions(event.target.value)} rows={5} placeholder={"Opção 1\nOpção 2\nOpção 3"} />
                  </div>
                  <div className="space-y-2">
                    <Label>Índice da resposta correta</Label>
                    <Input type="number" value={quizCorrect} onChange={event => setQuizCorrect(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Explicação opcional</Label>
                    <Textarea value={quizExplanation} onChange={event => setQuizExplanation(event.target.value)} rows={3} />
                  </div>
                  <Button type="submit" disabled={quizMutation.isPending} className="gap-2">
                    {quizMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Enviar para aprovação
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
