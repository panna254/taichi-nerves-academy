import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";

const AdminTopbar = () => {
  const { user, logout } = useAdminAuth();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dashboard</p>
        <h1 className="text-lg font-bold text-card-foreground">Welcome back{user ? `, ${user.name}` : ""}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        {user && (
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold uppercase">
              {user.name?.[0] ?? "A"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-card-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminTopbar;



