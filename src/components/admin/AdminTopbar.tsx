import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AdminTopbar = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ full_name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user, refreshKey]);

  // Listen for storage events to trigger refresh when settings are updated
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfileUpdated') {
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Get user details from users table using clerk_user_id
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('clerk_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        // Fallback to auth user data
        setUserData({
          full_name: user.email?.split('@')[0],
          email: user.email
        });
      } else {
        setUserData({
          full_name: data.full_name || user.email?.split('@')[0],
          email: data.email || user.email
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({
        full_name: user.email?.split('@')[0],
        email: user.email
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Get display name with fallbacks
  const displayName = userData?.full_name || user?.email?.split('@')[0] || 'Admin';
  const displayEmail = userData?.email || user?.email;

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dashboard</p>
        <h1 className="text-lg font-bold text-card-foreground">
          {loading ? 'Loading...' : `Welcome back, ${displayName}`}
        </h1>
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
              {displayName[0] ?? "A"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-card-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={handleLogout}>
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




