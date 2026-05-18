import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"articles" | "videos" | "mindMaps" | "quizzes">("articles");

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/login");
    }
  }, [loading, user, setLocation]);

  // Fetch pending content
  const { data: pending, isLoading, refetch } = trpc.moderation.getPending.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
    retry: false,
  });

  // Mutations
  const approveArticle = trpc.articles.approve.useMutation({
    onSuccess: () => {
      toast.success("Artigo aprovado!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectArticle = trpc.articles.reject.useMutation({
    onSuccess: () => {
      toast.success("Artigo rejeitado!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const approveVideo = trpc.videos.approve.useMutation({
    onSuccess: () => {
      toast.success("Vídeo aprovado!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectVideo = trpc.videos.reject.useMutation({
    onSuccess: () => {
      toast.success("Vídeo rejeitado!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const approveMindMap = trpc.mindMaps.approve.useMutation({
    onSuccess: () => {
      toast.success("Mapa mental aprovado!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectMindMap = trpc.mindMaps.reject.useMutation({
    onSuccess: () => {
      toast.success("Mapa mental rejeitado!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const approveQuiz = trpc.quizQuestions.approve.useMutation({
    onSuccess: () => {
      toast.success("Questão aprovada!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectQuiz = trpc.quizQuestions.reject.useMutation({
    onSuccess: () => {
      toast.success("Questão rejeitada!");
      refetch();
      setSelectedItem(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const renderModerationContent = (item: any, type: string) => {
    switch (type) {
      case "articles":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Título</h3>
              <p className="text-slate-600">{item.title}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Slug</h3>
              <p className="text-slate-600 font-mono text-sm">{item.slug}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Autor</h3>
              <p className="text-slate-600">{item.author || "Não informado"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Enviado por</h3>
              <p className="text-slate-600 text-sm">{item.submittedBy}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Resumo</h3>
              <p className="text-slate-600">{item.summary || "Não informado"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Link do artigo</h3>
              <div className="bg-slate-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-slate-600 whitespace-pre-wrap text-sm">{item.articleLink || "Link não informado"}</p>
              </div>
            </div>
          </div>
        );
      case "videos":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Título</h3>
              <p className="text-slate-600">{item.title}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">URL</h3>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm break-all">
                {item.url}
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Descrição</h3>
              <p className="text-slate-600">{item.description || "Não informada"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Enviado por</h3>
              <p className="text-slate-600 text-sm">{item.submittedBy}</p>
            </div>
            {item.duration && (
              <div>
                <h3 className="font-semibold text-slate-900">Duração</h3>
                <p className="text-slate-600">{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, "0")}</p>
              </div>
            )}
          </div>
        );
      case "mindMaps":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Título</h3>
              <p className="text-slate-600">{item.title}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Descrição</h3>
              <p className="text-slate-600">{item.description || "Não informada"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Enviado por</h3>
              <p className="text-slate-600 text-sm">{item.submittedBy}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Conteúdo JSON</h3>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs max-h-64 overflow-y-auto">
                {JSON.stringify(JSON.parse(item.content), null, 2)}
              </pre>
            </div>
          </div>
        );
      case "quizzes":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Questão</h3>
              <p className="text-slate-600">{item.question}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Opções</h3>
              <div className="space-y-2">
                {JSON.parse(item.options).map((option: string, index: number) => (
                  <div key={index} className={`p-2 rounded ${index === item.correctAnswer ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}>
                    {index === item.correctAnswer && <span className="text-green-600 font-semibold">✓ </span>}
                    {option}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Enviado por</h3>
              <p className="text-slate-600 text-sm">{item.submittedBy}</p>
            </div>
            {item.explanation && (
              <div>
                <h3 className="font-semibold text-slate-900">Explicação</h3>
                <p className="text-slate-600">{item.explanation}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const handleApprove = (id: number, type: string) => {
    switch (type) {
      case "articles":
        approveArticle.mutate({ id });
        break;
      case "videos":
        approveVideo.mutate({ id });
        break;
      case "mindMaps":
        approveMindMap.mutate({ id });
        break;
      case "quizzes":
        approveQuiz.mutate({ id });
        break;
    }
  };

  const handleReject = (id: number, type: string) => {
    switch (type) {
      case "articles":
        rejectArticle.mutate({ id });
        break;
      case "videos":
        rejectVideo.mutate({ id });
        break;
      case "mindMaps":
        rejectMindMap.mutate({ id });
        break;
      case "quizzes":
        rejectQuiz.mutate({ id });
        break;
    }
  };

  if (loading || (!user || user.role !== "admin")) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Painel de Moderação</h1>
          <p className="text-slate-600 mt-2">Gerencie e aprove conteúdos submetidos</p>
        </div>

        {/* Stats */}
        {pending && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Artigos Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pending.articles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vídeos Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pending.videos.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Mapas Mentais Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pending.mindMaps.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Questões Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pending.quizzes.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Moderation Tabs */}
        <Tabs defaultValue="articles" onValueChange={(v) => setSelectedType(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="articles">Artigos</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="mindMaps">Mapas Mentais</TabsTrigger>
            <TabsTrigger value="quizzes">Questões</TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : pending?.articles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-slate-600">Nenhum artigo pendente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending?.articles.map((article) => (
                  <Card key={article.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{article.title}</CardTitle>
                          <CardDescription className="line-clamp-1">{article.summary}</CardDescription>
                        </div>
                        <Badge variant="outline">Pendente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">Enviado por: {article.submittedBy}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(article)}
                            className="gap-2"
                          >
                            <Eye size={16} />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(article.id, "articles")}
                            disabled={approveArticle.isPending}
                            className="gap-2"
                          >
                            <CheckCircle size={16} />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(article.id, "articles")}
                            disabled={rejectArticle.isPending}
                            className="gap-2"
                          >
                            <XCircle size={16} />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : pending?.videos.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-slate-600">Nenhum vídeo pendente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending?.videos.map((video) => (
                  <Card key={video.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                          <CardDescription className="line-clamp-1">{video.description}</CardDescription>
                        </div>
                        <Badge variant="outline">Pendente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">Enviado por: {video.submittedBy}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(video)}
                            className="gap-2"
                          >
                            <Eye size={16} />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(video.id, "videos")}
                            disabled={approveVideo.isPending}
                            className="gap-2"
                          >
                            <CheckCircle size={16} />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(video.id, "videos")}
                            disabled={rejectVideo.isPending}
                            className="gap-2"
                          >
                            <XCircle size={16} />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Mind Maps Tab */}
          <TabsContent value="mindMaps" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : pending?.mindMaps.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-slate-600">Nenhum mapa mental pendente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending?.mindMaps.map((mindMap) => (
                  <Card key={mindMap.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{mindMap.title}</CardTitle>
                          <CardDescription className="line-clamp-1">{mindMap.description}</CardDescription>
                        </div>
                        <Badge variant="outline">Pendente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">Enviado por: {mindMap.submittedBy}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(mindMap)}
                            className="gap-2"
                          >
                            <Eye size={16} />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(mindMap.id, "mindMaps")}
                            disabled={approveMindMap.isPending}
                            className="gap-2"
                          >
                            <CheckCircle size={16} />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(mindMap.id, "mindMaps")}
                            disabled={rejectMindMap.isPending}
                            className="gap-2"
                          >
                            <XCircle size={16} />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : pending?.quizzes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-slate-600">Nenhuma questão pendente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending?.quizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{quiz.question}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {JSON.parse(quiz.options).length} opções
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Pendente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">Enviado por: {quiz.submittedBy}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(quiz)}
                            className="gap-2"
                          >
                            <Eye size={16} />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(quiz.id, "quizzes")}
                            disabled={approveQuiz.isPending}
                            className="gap-2"
                          >
                            <CheckCircle size={16} />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(quiz.id, "quizzes")}
                            disabled={rejectQuiz.isPending}
                            className="gap-2"
                          >
                            <XCircle size={16} />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Modal */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Conteúdo</DialogTitle>
                <DialogDescription>
                  Revise o conteúdo antes de aprovar ou rejeitar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {renderModerationContent(selectedItem, selectedType)}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
