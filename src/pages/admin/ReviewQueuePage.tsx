import { useEffect, useState } from "react";
import { adminApi } from "@/services/mockAdminApi";
import { MedicalContent } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ReviewQueuePage = () => {
  const [items, setItems] = useState<MedicalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.getReviewQueue().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    await adminApi.approveContent(id);
    setBusyId(null);
    load();
  };

  const handleRequestChanges = async (id: string) => {
    setBusyId(id);
    await adminApi.requestChanges(id, note || "Please review and update.");
    setNote("");
    setBusyId(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-card-foreground">Review Queue</h2>
        <p className="text-sm text-muted-foreground">Approve or request changes for items awaiting review.</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, idx) => <Skeleton key={idx} className="h-24 rounded-2xl" />)
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
            No items awaiting review.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.contentType} • v{item.version} • {new Date(item.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit">
                  {item.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{item.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-card-foreground">Request changes</label>
                  <Textarea
                    placeholder="Add reviewer notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-2 md:items-end md:justify-end">
                  <Button
                    size="sm"
                    className="w-full md:w-auto"
                    onClick={() => handleApprove(item.id)}
                    disabled={busyId === item.id}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={() => handleRequestChanges(item.id)}
                    disabled={busyId === item.id}
                  >
                    Request changes
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewQueuePage;




