import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, Video, FileText, Headphones, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const resourceItems = [
    { name: "Video Lectures", href: "/resources/lectures", icon: Video },
    { name: "Notes", href: "/resources/notes", icon: FileText },
    { name: "Podcast", href: "/resources/podcast", icon: Headphones },
    { name: "Quizzes", href: "/resources/quizzes", icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Taichi<span className="text-primary">Nerves</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link to="/">
            <Button variant={isActive("/") ? "navActive" : "nav"} size="sm" className="font-semibold">
              Home
            </Button>
          </Link>

          <Link to="/topics">
            <Button variant={isActive("/topics") ? "navActive" : "nav"} size="sm" className="font-semibold">
              Topics
            </Button>
          </Link>
          
          <Link to="/membership">
            <Button variant={isActive("/membership") ? "navActive" : "nav"} size="sm" className="font-semibold">
              Membership
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="nav" size="sm" className="gap-1 font-semibold">
                Resources
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {resourceItems.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link to={item.href} className="flex items-center gap-2 cursor-pointer">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/hire-tutor">
            <Button variant={isActive("/hire-tutor") ? "navActive" : "nav"} size="sm" className="font-semibold">
              Hire a Tutor
            </Button>
          </Link>

          <Link to="/donate">
            <Button variant={isActive("/donate") ? "navActive" : "nav"} size="sm" className="font-semibold">
              Donate
            </Button>
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="default" size="sm">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden animate-fade-in">
          <div className="container mx-auto space-y-1 px-4 py-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-semibold">
                Home
              </Button>
            </Link>
            <Link to="/topics" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-semibold">
                Topics
              </Button>
            </Link>
            <Link to="/membership" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-semibold">
                Membership
              </Button>
            </Link>
            
            <div className="py-2">
              <p className="px-4 text-sm font-semibold text-muted-foreground">Resources</p>
              {resourceItems.map((item) => (
                <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 pl-8 font-semibold">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>

            <Link to="/hire-tutor" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-semibold">
                Hire a Tutor
              </Button>
            </Link>
            <Link to="/donate" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-semibold">
                Donate
              </Button>
            </Link>

            <div className="flex gap-2 pt-4">
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
