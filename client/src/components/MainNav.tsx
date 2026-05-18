import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { BookOpen, Video, Network, HelpCircle, Settings, LogOut, LogIn, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

export default function MainNav() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Desconectado com sucesso!");
    } catch (error) {
      toast.error("Erro ao desconectar");
    }
  };

  const navItems = [
    { label: "Artigos", href: "/articles", icon: BookOpen },
    { label: "Vídeos", href: "/videos", icon: Video },
    { label: "Mapas Mentais", href: "/mindmaps", icon: Network },
    { label: "Quiz", href: "/quiz", icon: HelpCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-red-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl text-red-900 hover:text-red-700 transition-colors">
              <img src="/logo.png" alt="EntreVozes Logo" className="w-8 h-8" />
              <span>EntreVozes</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 transition-colors">
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 bg-red-200 rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-red-700">{user.name || "Usuário"}</span>
                </div>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button size="sm" variant="outline" className="gap-2 border-red-300 text-red-700 hover:bg-red-50">
                      <Settings size={18} />
                      <span className="text-sm font-medium">Admin</span>
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut size={18} />
                  Sair
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => (window.location.href = getLoginUrl())}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <LogIn size={18} />
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="space-y-4 mt-8">
                  {/* Mobile Nav Items */}
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href}>
                          <a
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon size={18} />
                            <span className="text-sm font-medium">{item.label}</span>
                          </a>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-red-200 pt-4">
                    {loading ? (
                      <div className="w-full h-10 bg-slate-200 rounded animate-pulse" />
                    ) : isAuthenticated && user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-red-700">{user.name || "Usuário"}</span>
                        </div>
                        {user.role === "admin" && (
                          <Link href="/admin">
                            <a
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-900 hover:bg-red-200 transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              <Settings size={18} />
                              <span className="text-sm font-medium">Admin</span>
                            </a>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <LogOut size={18} />
                          Sair
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          window.location.href = getLoginUrl();
                          setIsOpen(false);
                        }}
                        className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <LogIn size={18} />
                        Entrar
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
