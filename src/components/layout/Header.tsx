import { useState, useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, Video, FileText, Headphones, HelpCircle, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, isLoading, isLoggingOut } = useAuth();

  // PERFORMANCE: Memoize logo error handler to prevent recreation on every render
  const handleLogoError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallbackIcon) fallbackIcon.style.display = 'flex';
  }, []);

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
        {/* Logo + Site Name */}
        <Link to="/" className="flex items-center gap-3">
          {/* PNG Logo Image with icon fallback */}
          <img 
            src="/logo.png" 
            alt="Taichi Nerves" 
            className="h-10 w-auto object-contain"
            onError={handleLogoError}
          />
          {/* Fallback icon (shown only if logo.png fails to load) */}
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          {/* Site Name - Always visible */}
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
<<<<<<< HEAD
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="cta" size="sm">
              Sign Up
            </Button>
          </Link>
=======
          {isLoggingOut ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : isLoading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user?.name || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/membership" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Membership
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
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
<<<<<<< HEAD
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="cta" className="w-full">
                  Sign Up
                </Button>
              </Link>
=======
              {isLoggingOut ? (
                <div className="flex-1 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : isLoading ? (
                <div className="flex-1 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : isAuthenticated ? (
                <div className="flex-1">
                  <div className="text-center mb-2">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">Logged in</p>
                  </div>
                  <Button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    variant="outline" 
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
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
                </>
              )}
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// PERFORMANCE: Memoize Header to prevent unnecessary re-renders
// Only re-renders when location changes (route navigation)
export default memo(Header);
