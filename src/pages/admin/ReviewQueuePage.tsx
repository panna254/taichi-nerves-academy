import { useEffect, useState } from "react";
import { adminService, showToast } from "@/services/adminService";
import { ContentItem } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ReviewQueuePage = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    const result = await adminService.getContents({ status: 'review' });
    
    if (result.success && result.data) {
      setItems(result.data);
    } else {
      setError(result.error || "Failed to load review queue");
      showToast(false, result.error || "Failed to load review queue");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    
    const result = await adminService.publishVideoLecture(id);
    
    if (result.success) {
      showToast(true, "Content approved and published successfully");
      load();
    } else {
      showToast(false, result.error || "Failed to approve content");
    }
    
    setBusyId(null);
  };

  const handleRequestChanges = async (id: string) => {
    if (!note.trim()) {
      showToast(false, "Please provide reviewer notes");
      return;
    }

    setBusyId(id);
    
    // For now, we'll update the status back to draft with a note
    // In a real implementation, you'd want to store the reviewer notes
    const result = await adminService.updateVideoLecture(id, { 
      content: { reviewer_notes: note }
    });
    
    if (result.success) {
      showToast(true, "Changes requested successfully");
      setNote("");
      load();
    } else {
      showToast(false, result.error || "Failed to request changes");
    }
    
    setBusyId(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-card-foreground">Review Queue</h2>
        <p className="text-sm text-muted-foreground">Approve or request changes for items awaiting review.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Review Queue</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={load}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

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
                    {item.content_type} • v{item.version} • {new Date(item.updated_at).toLocaleDateString()}
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





