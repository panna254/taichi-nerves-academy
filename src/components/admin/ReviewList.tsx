import { ReviewTask } from "@/types/admin";
import { ArrowRight, CheckCircle, History, MessageSquare } from "lucide-react";

type Props = {
  items: ReviewTask[];
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
};

export const ReviewList = ({ items, onApprove, onRequestChanges }: Props) => {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-lg font-bold text-card-foreground">Review Queue</h3>
        <p className="text-sm text-muted-foreground">Approve or request changes on incoming items.</p>
      </div>

      <div className="divide-y divide-border">
        {items.map((task) => (
          <div key={task.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-card-foreground">{task.title}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-semibold">
                  v{task.version}
                </span>
                <span className="inline-flex items-center gap-1">
                  <History className="h-3.5 w-3.5" />
                  {new Date(task.submittedAt).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" />
                  {task.status}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onRequestChanges(task.id)}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
              >
                <MessageSquare className="h-4 w-4" />
                Request changes
              </button>
              <button
                onClick={() => onApprove(task.id)}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">No items awaiting review.</div>
        )}
      </div>
    </div>
  );
};

