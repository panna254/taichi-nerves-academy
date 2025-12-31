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

  // Modern social media icons with brand colors
  const SocialIcon = ({ name }: { name: string }) => {
    switch (name) {
      case "YouTube":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case "Facebook":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case "Instagram":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
          </svg>
        );
      case "TikTok":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Real social media links for Taichi Nerves with brand colors
  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com/channel/UCD36ZaQgkuLzBNR7CuCfJCA", color: "hover:bg-[#FF0000]" },
    { name: "Facebook", href: "https://www.facebook.com/share/17VDn8YasC/", color: "hover:bg-[#1877F2]" },
    { name: "Instagram", href: "https://www.instagram.com/taichinerves", color: "hover:bg-gradient-to-tr hover:from-[#FCAF45] hover:via-[#E1306C] hover:to-[#C13584]" },
    { name: "TikTok", href: "https://tiktok.com/@taichinerves", color: "hover:bg-[#000000]" },
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
            
            {/* Modern Social Links with Brand Colors */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10 text-foreground transition-all duration-300 hover:scale-110 hover:text-white ${social.color}`}
                  aria-label={`Follow us on ${social.name}`}
                >
                  <SocialIcon name={social.name} />
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
