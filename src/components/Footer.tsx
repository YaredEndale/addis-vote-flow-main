import { Trophy, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 flex items-center justify-center p-1 relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all rounded-full" />
                <img
                  src="/logo.png"
                  alt="addisgamesweek Logo"
                  className="w-full h-full object-contain relative z-10 animate-float-slow"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.logo-fallback')?.classList.remove('hidden');
                  }}
                />
                <Trophy className="logo-fallback hidden w-5 h-5 text-primary absolute z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg tracking-wider text-foreground">addisgamesweek</span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                  Awards 2026
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Celebrating excellence in Ethiopian gaming. Your vote shapes the future of our gaming community.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-lg tracking-wide mb-2">QUICK LINKS</h4>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Vote Now
            </Link>
            <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Rules & Transparency
            </Link>
          </div>

          {/* Organized By */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-lg tracking-wide mb-2">ORGANIZED BY</h4>
            <a
              href="https://ethiopiangamesassociation.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ethiopian Games Association
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Building the future of gaming in Ethiopia
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 addisgamesweek. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/rules" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/rules" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
