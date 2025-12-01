// src/components/Navbar.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Star, LogOut, Moon, Sun, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import GetStartedModal from "@/components/GetStartedModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeProvider";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">ArthaDrishti</span>
        </Link>

        {/* Center nav links - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <Link
            to="/screener"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Screener
          </Link>
          <Link
            to="/screens"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Screens
          </Link>
          <Link
            to="/portfolio"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Portfolio
          </Link>
          <Link
            to="/watchlist"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Watchlist
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </div>

        {/* Right side: search + theme toggle + auth */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Auth section with loading state - Desktop only */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <>
                <Link to="/watchlist">
                  <Button variant="ghost" size="icon">
                    <Star className="h-5 w-5" />
                  </Button>
                </Link>

                <div className="flex items-center gap-3">
                  <span className="text-sm truncate max-w-[150px]">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut().catch(() => {})}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="default" onClick={() => setOpen(true)}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <Link
              to="/screener"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Screener
            </Link>
            <Link
              to="/screens"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Screens
            </Link>
            <Link
              to="/portfolio"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              to="/watchlist"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Watchlist
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {/* Mobile Auth Section */}
            <div className="border-t border-border pt-4 mt-2">
              {loading ? (
                <div className="w-full h-9 bg-muted animate-pulse rounded-md" />
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      signOut().catch(() => {});
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    setOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <GetStartedModal open={open} onClose={() => setOpen(false)} />
    </nav>
  );
};

export default Navbar;
