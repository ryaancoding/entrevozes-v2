import { useMemo, useState } from "react";
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
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `conteudo-${Date.now()}`;
}

export default function Submit() {
  const [name, setName] = useState("");

  const [articleTitle, setArticleTitle] = useState("");
  const [articleSummary, setArticleSummary] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [articleAuthor, setArticleAuthor] = useState("");

  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [mapTitle, setMapTitle] = useState("");
  const [mapDescription, setMapDescription] = useState("");
  const [mapContent, setMapContent] = useState("");

  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState("Opção A\nOpção B\nOpção C\nOpção D");
  const [quizCorrect, setQuizCorrect] = useState("0");
  const [quizExplanation, setQuizExplanation] = useState("");

  const submittedBy = useMemo(() => name.trim() || "Visitante", [name]);

  const articleMutation = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success("Artigo enviado! O admin vai analisar antes de publicar.");
      setArticleTitle("");
      setArticleSummary("");
      setArticleLink("");
      setArticleAuthor("");
    },
    onError: error => toast.error(error.message),
  });

  const videoMutation = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Vídeo enviado! O admin vai analisar antes de publicar.");
      setVideoTitle("");
      setVideoDescription("");
      setVideoUrl("");
    },
    onError: error => toast.error(error.message),
  });

  const mapMutation = trpc.mindMaps.create.useMutation({
    onSuccess: () => {
      toast.success("Mapa mental enviado! O admin vai analisar antes de publicar.");
      setMapTitle("");
      setMapDescription("");
      setMapContent("");
    },
    onError: error => toast.error(error.message),
  });

  const quizMutation = trpc.quizQuestions.create.useMutation({
    onSuccess: () => {
      toast.success("Questão enviada! O admin vai analisar antes de publicar.");
      setQuizQuestion("");
      setQuizOptions("Opção A\nOpção B\nOpção C\nOpção D");
      setQuizCorrect("0");
      setQuizExplanation("");
    },
    onError: error => toast.error(error.message),
  });

  const submitArticle = (event: React.FormEvent) => {
    event.preventDefault();
    articleMutation.mutate({
      title: articleTitle,
      slug: slugify(articleTitle),
      summary: articleSummary,
      articleLink,
      author: articleAuthor,
      submittedBy,
    });
  };

  const submitVideo = (event: React.FormEvent) => {
    event.preventDefault();
    videoMutation.mutate({
      title: videoTitle,
      description: videoDescription,
      url: videoUrl,
      submittedBy,
    });
  };

  const submitMap = (event: React.FormEvent) => {
    event.preventDefault();
    const content = JSON.stringify({
      tema: mapTitle,
      conteudo: mapContent,
      topicos: mapContent.split("\n").map(item => item.trim()).filter(Boolean),
    });
    mapMutation.mutate({
      title: mapTitle,
      description: mapDescription,
      content,
      submittedBy,
    });
  };

  const submitQuiz = (event: React.FormEvent) => {
    event.preventDefault();
    const options = quizOptions.split("\n").map(item => item.trim()).filter(Boolean);
    quizMutation.mutate({
      question: quizQuestion,
      options: JSON.stringify(options),
      correctAnswer: Number(quizCorrect),
      explanation: quizExplanation,
      submittedBy,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Enviar Conteúdo</h1>
          <p className="text-slate-600 mt-2">
            Envie artigos, vídeos, mapas mentais ou perguntas. O conteúdo será publicado somente após aprovação do administrador.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
            <CardDescription>Opcional, mas ajuda o admin a saber quem enviou.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input id="name" value={name} onChange={event => setName(event.target.value)} placeholder="Ex.: Ryan" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="article">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="article">Artigo</TabsTrigger>
            <TabsTrigger value="video">Vídeo</TabsTrigger>
            <TabsTrigger value="map">Mapa Mental</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="article">
            <Card>
              <CardHeader><CardTitle>Enviar artigo</CardTitle><CardDescription>Coloque um resumo simples e o link do artigo real.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={submitArticle} className="space-y-4">
                  <div className="space-y-2"><Label>Título</Label><Input value={articleTitle} onChange={e => setArticleTitle(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Resumo simples</Label><Textarea value={articleSummary} onChange={e => setArticleSummary(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Link do artigo</Label><Input type="url" value={articleLink} onChange={e => setArticleLink(e.target.value)} placeholder="https://..." /></div>
                  <div className="space-y-2"><Label>Autor</Label><Input value={articleAuthor} onChange={e => setArticleAuthor(e.target.value)} /></div>
                  <Button type="submit" disabled={articleMutation.isPending} className="gap-2 bg-red-700 hover:bg-red-800">{articleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Enviar artigo</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            <Card>
              <CardHeader><CardTitle>Enviar vídeo</CardTitle><CardDescription>Envie um link de vídeo para análise.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={submitVideo} className="space-y-4">
                  <div className="space-y-2"><Label>Título</Label><Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Descrição</Label><Textarea value={videoDescription} onChange={e => setVideoDescription(e.target.value)} /></div>
                  <div className="space-y-2"><Label>URL do vídeo</Label><Input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required /></div>
                  <Button type="submit" disabled={videoMutation.isPending} className="gap-2 bg-red-700 hover:bg-red-800">{videoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Enviar vídeo</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader><CardTitle>Enviar mapa mental</CardTitle><CardDescription>Liste os tópicos principais, um por linha.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={submitMap} className="space-y-4">
                  <div className="space-y-2"><Label>Título</Label><Input value={mapTitle} onChange={e => setMapTitle(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Descrição</Label><Textarea value={mapDescription} onChange={e => setMapDescription(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Tópicos/conteúdo</Label><Textarea value={mapContent} onChange={e => setMapContent(e.target.value)} required /></div>
                  <Button type="submit" disabled={mapMutation.isPending} className="gap-2 bg-red-700 hover:bg-red-800">{mapMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Enviar mapa</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader><CardTitle>Enviar questão do quiz</CardTitle><CardDescription>Coloque as alternativas uma por linha. A resposta correta usa índice começando em 0.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={submitQuiz} className="space-y-4">
                  <div className="space-y-2"><Label>Pergunta</Label><Textarea value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Opções</Label><Textarea value={quizOptions} onChange={e => setQuizOptions(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Índice da resposta correta</Label><Input type="number" min={0} value={quizCorrect} onChange={e => setQuizCorrect(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Explicação</Label><Textarea value={quizExplanation} onChange={e => setQuizExplanation(e.target.value)} /></div>
                  <Button type="submit" disabled={quizMutation.isPending} className="gap-2 bg-red-700 hover:bg-red-800">{quizMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Enviar questão</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
