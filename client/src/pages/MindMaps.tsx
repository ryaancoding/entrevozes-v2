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
import { Loader2, Plus, Network } from "lucide-react";

export default function MindMaps() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMindMap, setSelectedMindMap] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  });

  // Fetch mind maps
  const { data: mindMaps, isLoading, refetch } = trpc.mindMaps.list.useQuery({ status: "approved" });

  // Create mind map mutation
  const createMindMap = trpc.mindMaps.create.useMutation({
    onSuccess: () => {
      toast.success("Mapa mental enviado para moderação!");
      setFormData({ title: "", description: "", content: "" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mapa mental");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    try {
      // Validate JSON
      JSON.parse(formData.content);
      createMindMap.mutate(formData);
    } catch {
      toast.error("Conteúdo deve ser um JSON válido");
    }
  };

  const renderMindMapPreview = (content: string) => {
    try {
      const data = JSON.parse(content);
      return (
        <div className="space-y-2 text-sm">
          {typeof data === "object" && data !== null && (
            <div className="space-y-1">
              {Object.entries(data).slice(0, 3).map(([key, value]) => (
                <div key={key} className="text-slate-600">
                  <strong>{key}:</strong> {String(value).substring(0, 30)}...
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } catch {
      return <p className="text-slate-500 text-sm">Conteúdo JSON inválido</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Mapas Mentais</h1>
            <p className="text-slate-600 mt-2">Organize e visualize conceitos através de mapas mentais</p>
          </div>
          {user && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Novo Mapa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Novo Mapa Mental</DialogTitle>
                  <DialogDescription>
                    Crie um mapa mental em formato JSON. Será revisado antes de ser publicado.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <Input
                      placeholder="Título do mapa mental"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Textarea
                      placeholder="Descrição do mapa mental"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Conteúdo JSON *</label>
                    <Textarea
                      placeholder={`{\n  "tema_central": "Conceito Principal",\n  "subtema_1": "Detalhe 1",\n  "subtema_2": "Detalhe 2"\n}`}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={8}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button disabled={createMindMap.isPending}>
                      {createMindMap.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar para Moderação
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Mind Maps Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : mindMaps && mindMaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mindMaps.map((mindMap) => (
              <Card
                key={mindMap.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedMindMap(mindMap)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 flex items-center gap-2">
                        <Network size={20} className="text-red-600 flex-shrink-0" />
                        {mindMap.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">{mindMap.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{mindMap.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-3 rounded-lg mb-3 max-h-24 overflow-hidden">
                    {renderMindMapPreview(mindMap.content)}
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(mindMap.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-600">Nenhum mapa mental publicado ainda</p>
            </CardContent>
          </Card>
        )}

        {/* Mind Map Detail Modal */}
        {selectedMindMap && (
          <Dialog open={!!selectedMindMap} onOpenChange={() => setSelectedMindMap(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Network size={24} className="text-red-600" />
                  {selectedMindMap.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedMindMap.description && (
                  <div>
                    <p className="text-sm text-slate-600">{selectedMindMap.description}</p>
                  </div>
                )}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold mb-3 text-slate-900">Estrutura do Mapa</h3>
                  <div className="space-y-2">
                    {(() => {
                      try {
                        const data = JSON.parse(selectedMindMap.content);
                        return (
                          <div className="space-y-2">
                            {Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex gap-2 text-sm">
                                <span className="font-semibold text-red-600 min-w-fit">{key}:</span>
                                <span className="text-slate-700">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      } catch {
                        return <p className="text-slate-500">Erro ao processar conteúdo JSON</p>;
                      }
                    })()}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-900">JSON Bruto</h3>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(JSON.parse(selectedMindMap.content), null, 2)}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
