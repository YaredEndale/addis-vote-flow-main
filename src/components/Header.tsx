import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trophy, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/categories", label: "Categories" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/rules", label: "Rules" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center p-1 relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all rounded-full" />
              <img
                src="/logo-icon.png"
                alt="Addis Games Week Logo"
                className="w-full h-full object-contain relative z-10 animate-float-slow"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.logo-fallback')?.classList.remove('hidden');
                }}
              />
              <Trophy className="logo-fallback hidden w-5 h-5 text-primary absolute z-10" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg md:text-xl tracking-wider text-foreground group-hover:text-primary transition-colors">
                ADDIS GAMES WEEK
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Awards 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-300 ${isActive(link.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/categories">Vote Now</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 transition-colors duration-300 ${isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <User className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <Button variant="outline" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="hero" asChild className="mt-2">
                    <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>
                      Vote Now
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
