import { NavLink as RouterLink, useLocation } from "react-router-dom";
import { LayoutGrid, FilePlus2, FileText, ClipboardList, Image, Users } from "lucide-react";

const navItems = [
  { label: "Overview", to: "/admin", icon: LayoutGrid },
  { label: "Create Content", to: "/admin/content/new", icon: FilePlus2 },
  { label: "Manage Content", to: "/admin/content", icon: FileText },
  { label: "Review Queue", to: "/admin/review", icon: ClipboardList },
  { label: "Media Library", to: "/admin/media", icon: Image },
  { label: "Users & Roles", to: "/admin/users", icon: Users },
];

const AdminSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex lg:w-64 flex-col border-r border-border bg-card/60 backdrop-blur">
      <div className="px-6 py-5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin</p>
        <h2 className="font-display text-xl font-bold text-card-foreground">Taichi Nerves</h2>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
          return (
            <RouterLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </RouterLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;


