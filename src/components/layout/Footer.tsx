import { useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Youtube, Instagram, Facebook, Video, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // PERFORMANCE: Memoize logo error handler
  const handleLogoError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallbackIcon) fallbackIcon.style.display = 'flex';
  }, []);

  const footerSections = [
    {
      title: "Taichi Nerves",
      links: [
        { name: "Membership", href: "/membership" },
        { name: "Shop", href: "/shop" },
        { name: "Donate", href: "/donate" },
        { name: "Hire a Tutor", href: "/hire-tutor" },
        { name: "Team", href: "/team" },
        { name: "Login", href: "/login" },
        { name: "Sign Up", href: "/signup" },
      ],
    },
    {
      title: "Topics",
      links: [
        { name: "Human Anatomy", href: "/topics" },
        { name: "Physiology", href: "/topics" },
        { name: "Pharmacology", href: "/topics" },
        { name: "Pathology", href: "/topics" },
        { name: "Microbiology", href: "/topics" },
        { name: "Biochemistry", href: "/topics" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Video Lectures", href: "/resources/lectures" },
        { name: "Notes", href: "/resources/notes" },
        { name: "Podcast", href: "/resources/podcast" },
        { name: "Quizzes", href: "/resources/quizzes" },
      ],
    },
    {
      title: "Contact",
      links: [
        { name: "Get in Touch", href: "/contact" },
      ],
    },
  ];

  // Real social media links for Taichi Nerves
  const socialLinks = [
    { name: "YouTube", icon: Youtube, href: "https://www.youtube.com/channel/UCD36ZaQgkuLzBNR7CuCfJCA" },
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/share/17VDn8YasC/" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/taichinerves" },
    { name: "TikTok", icon: Video, href: "https://tiktok.com/@taichinerves" },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section with Logo */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              {/* Logo - Same as navbar */}
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
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering health science education through comprehensive, accessible learning resources.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Taichi Nerves. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// PERFORMANCE: Memoize Footer - it's static content that rarely needs to re-render
export default memo(Footer);
