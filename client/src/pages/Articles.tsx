import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ExternalLink } from "lucide-react";

export default function Articles() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    articleLink: "",
    author: "",
  });

  // Fetch articles
  const { data: articles, isLoading, refetch } = trpc.articles.list.useQuery({ status: "approved" });

  // Create article mutation
  const createArticle = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success("Artigo enviado para moderação!");
      setFormData({ title: "", slug: "", summary: "", articleLink: "", author: "" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar artigo");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.summary) {
      toast.error("Preencha os campos obrigatórios: título, slug e resumo");
      return;
    }
    createArticle.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Artigos</h1>
            <p className="text-slate-600 mt-2">Compartilhe conhecimento através de artigos educativos</p>
          </div>
          {user && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Novo Artigo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Novo Artigo</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do seu artigo. Será revisado antes de ser publicado.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <Input
                      placeholder="Título do artigo"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug *</label>
                    <Input
                      placeholder="slug-do-artigo"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Autor</label>
                    <Input
                      placeholder="Seu nome"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Resumo Simples *</label>
                    <Textarea
                      placeholder="Resumo breve do artigo (2-3 linhas)"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link do Artigo Completo</label>
                    <Input
                      placeholder="https://exemplo.com/artigo-completo"
                      type="url"
                      value={formData.articleLink}
                      onChange={(e) => setFormData({ ...formData, articleLink: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button disabled={createArticle.isPending}>
                      {createArticle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar para Moderação
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <Badge variant="secondary">{article.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{article.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-2">Por: {article.author || "Anônimo"}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(article.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-600">Nenhum artigo publicado ainda</p>
            </CardContent>
          </Card>
        )}

        {/* Article Detail Modal */}
        {selectedArticle && (
          <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedArticle.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">
                    <strong>Autor:</strong> {selectedArticle.author || "Anônimo"}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Data:</strong> {new Date(selectedArticle.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="whitespace-pre-wrap text-slate-700">{selectedArticle.summary}</p>
                  </div>
                </div>
                {selectedArticle.articleLink && (
                  <div className="pt-4 border-t border-slate-200">
                    <a
                      href={selectedArticle.articleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ler artigo completo
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
