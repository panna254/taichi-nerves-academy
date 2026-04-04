import { useEffect, useState } from "react";
import { adminService, showToast } from "@/services/adminService";
import { DashboardStats } from "@/services/adminService";
import StatCards from "@/components/admin/StatCards";
import { Activity, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getDashboardStats();
      
      if (result.success && result.data) {
        setStats(result.data);
        showToast(true, "Dashboard stats loaded successfully");
      } else {
        setError(result.error || "Failed to load dashboard stats");
        showToast(false, result.error || "Failed to load dashboard stats");
      }
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: "Published Content", value: stats.publishedContent, icon: <CheckCircle2 className="h-5 w-5" /> },
          { label: "In Review", value: stats.reviewQueue, icon: <ShieldCheck className="h-5 w-5" /> },
          { label: "Drafts", value: stats.draftContent, icon: <Clock className="h-5 w-5" /> },
          { label: "Total Content", value: stats.totalContent, icon: <Activity className="h-5 w-5" /> },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h3 className="text-lg font-bold text-card-foreground mb-3">User Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="text-sm font-semibold">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Subscriptions</span>
              <span className="text-sm font-semibold">{stats.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Admin Users</span>
              <span className="text-sm font-semibold">{stats.totalAdmins}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h3 className="text-lg font-bold text-card-foreground mb-3">Content Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Published</span>
              <span className="text-sm font-semibold">{stats.publishedContent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Drafts</span>
              <span className="text-sm font-semibold">{stats.draftContent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">In Review</span>
              <span className="text-sm font-semibold">{stats.reviewQueue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;





