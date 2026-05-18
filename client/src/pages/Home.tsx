import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { BookOpen, Video, Network, HelpCircle, Users, Zap, Shield } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Artigos Educativos",
      description: "Compartilhe e acesse artigos de qualidade sobre diversos tópicos educacionais",
    },
    {
      icon: Video,
      title: "Vídeos de Aprendizado",
      description: "Aprenda com conteúdo em vídeo de alta qualidade de criadores especializados",
    },
    {
      icon: Network,
      title: "Mapas Mentais",
      description: "Organize conceitos e ideias através de mapas mentais interativos",
    },
    {
      icon: HelpCircle,
      title: "Quizzes Interativos",
      description: "Teste seus conhecimentos com questões de múltipla escolha e obtenha feedback",
    },
    {
      icon: Users,
      title: "Comunidade Colaborativa",
      description: "Conecte-se com outros aprendizes e compartilhe conhecimento",
    },
    {
      icon: Shield,
      title: "Conteúdo Moderado",
      description: "Todo conteúdo é revisado para garantir qualidade e precisão",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-50 to-rose-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Bem-vindo ao <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">EntreVozes</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Uma plataforma colaborativa para compartilhar e aprender conteúdos educativos através de artigos, vídeos, mapas mentais e quizzes
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/articles">
                  <Button size="lg" className="gap-2">
                    <BookOpen size={20} />
                    Explorar Conteúdo
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button size="lg" variant="outline" className="gap-2">
                      <Shield size={20} />
                      Painel de Moderação
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="gap-2"
                >
                  <Zap size={20} />
                  Comece Agora
                </Button>
                <Button size="lg" variant="outline" onClick={() => (window.location.href = getLoginUrl())}>
                  Entrar na Plataforma
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Recursos Principais</h2>
          <p className="text-lg text-slate-600">Tudo que você precisa para aprender e compartilhar conhecimento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-red-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-center text-white space-y-6">
            <h2 className="text-4xl font-bold">Pronto para começar?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Junte-se à comunidade EntreVozes e comece a compartilhar e aprender com conteúdo educativo de qualidade
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              <Zap size={20} />
              Entrar Agora
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-red-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="EntreVozes Logo" className="w-8 h-8" />
              <span className="font-bold text-slate-900">EntreVozes</span>
            </div>
            <p className="text-slate-600 text-center md:text-right">
              © 2026 EntreVozes. Todos os direitos reservados. Uma plataforma para compartilhar conhecimento.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
