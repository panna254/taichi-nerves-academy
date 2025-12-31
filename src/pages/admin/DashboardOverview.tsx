import { useEffect, useState } from "react";
import { adminApi } from "@/services/mockAdminApi";
import { MedicalContent } from "@/types/admin";
import StatCards from "@/components/admin/StatCards";
import { Activity, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

const DashboardOverview = () => {
  const [data, setData] = useState<MedicalContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getContents().then((res) => setData(res)).finally(() => setLoading(false));
  }, []);

  const published = data.filter((c) => c.status === "Published").length;
  const review = data.filter((c) => c.status === "Review").length;
  const drafts = data.filter((c) => c.status === "Draft").length;

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: "Published", value: loading ? "…" : published, icon: <CheckCircle2 className="h-5 w-5" /> },
          { label: "In Review", value: loading ? "…" : review, icon: <ShieldCheck className="h-5 w-5" /> },
          { label: "Drafts", value: loading ? "…" : drafts, icon: <Clock className="h-5 w-5" /> },
          { label: "Total Items", value: loading ? "…" : data.length, icon: <Activity className="h-5 w-5" /> },
        ]}
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="text-lg font-bold text-card-foreground mb-3">Recent updates</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.contentType} • v{item.version} • {new Date(item.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-semibold rounded-full bg-primary/10 px-2 py-1 text-primary">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;




