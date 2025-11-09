import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">ArthaDrishti</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <Link to="/screener" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Screener
          </Link>
          <a href="/#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="default">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
