import { MedicalContent } from "@/types/admin";
import { ArrowRight, Eye, Pencil, Trash2 } from "lucide-react";

type Props = {
  items: MedicalContent[];
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
};

const statusStyles: Record<string, string> = {
  Draft: "bg-amber-100 text-amber-800",
  Review: "bg-blue-100 text-blue-800",
  Published: "bg-emerald-100 text-emerald-800",
};

export const ContentTable = ({ items, onEdit, onPreview, onDelete }: Props) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Title</th>
            <th className="px-4 py-3 text-left font-semibold">Type</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Last Updated</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-muted/40">
              <td className="px-4 py-3">
                <div className="font-semibold text-card-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.author}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{item.contentType}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status] ?? ""}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(item.lastUpdated).toLocaleString()}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                    onClick={() => onEdit(item.id)}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                    onClick={() => onPreview(item.id)}
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </button>
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-destructive text-destructive px-2 py-1 text-xs font-semibold hover:bg-destructive/10"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                No content found. Try adjusting filters or creating new content.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

