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
import { Loader2, Plus, Play } from "lucide-react";

export default function Videos() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    thumbnail: "",
    duration: "",
  });

  // Fetch videos
  const { data: videos, isLoading, refetch } = trpc.videos.list.useQuery({ status: "approved" });

  // Create video mutation
  const createVideo = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Vídeo enviado para moderação!");
      setFormData({ title: "", description: "", url: "", thumbnail: "", duration: "" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar vídeo");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createVideo.mutate({
      title: formData.title,
      description: formData.description || undefined,
      url: formData.url,
      thumbnail: formData.thumbnail || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
    });
  };

  const getVideoEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Vídeos</h1>
            <p className="text-slate-600 mt-2">Aprenda com conteúdo em vídeo de qualidade</p>
          </div>
          {user && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Novo Vídeo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Novo Vídeo</DialogTitle>
                  <DialogDescription>
                    Compartilhe um vídeo educativo. Será revisado antes de ser publicado.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <Input
                      placeholder="Título do vídeo"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL do Vídeo * (YouTube ou link direto)</label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Textarea
                      placeholder="Descrição do vídeo"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">URL da Thumbnail</label>
                      <Input
                        placeholder="https://..."
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duração (segundos)</label>
                      <Input
                        type="number"
                        placeholder="300"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button disabled={createVideo.isPending}>
                      {createVideo.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar para Moderação
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <Play size={48} className="text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                    <Badge variant="secondary">{video.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {video.duration && (
                    <p className="text-xs text-slate-500">
                      Duração: {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(video.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-600">Nenhum vídeo publicado ainda</p>
            </CardContent>
          </Card>
        )}

        {/* Video Player Modal */}
        {selectedVideo && (
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedVideo.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getVideoEmbedUrl(selectedVideo.url)}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {selectedVideo.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-slate-600 whitespace-pre-wrap">{selectedVideo.description}</p>
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
