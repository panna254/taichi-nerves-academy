import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/services/mockAdminApi";
import { MedicalContent, ContentStatus, ContentType } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Eye } from "lucide-react";

const ContentListPage = () => {
  const [items, setItems] = useState<MedicalContent[]>([]);
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState<ContentType | "All">("All");
  const [status, setStatus] = useState<ContentStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .getContents({ search, contentType, status })
      .then((res) => setItems(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    setBusyId(id);
    await adminApi.deleteContent(id);
    setBusyId(null);
    load();
  };

  const filtered = useMemo(() => items, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Manage Content</h2>
          <p className="text-sm text-muted-foreground">Search, filter, and manage all learning content.</p>
        </div>
        <Link to="/admin/content/new">
          <Button>Create content</Button>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={load}
        />
        <Select value={contentType} onValueChange={(val) => setContentType(val as ContentType | "All")}>
          <SelectTrigger>
            <SelectValue placeholder="Content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types</SelectItem>
            <SelectItem value="Article">Article</SelectItem>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="PDF">PDF</SelectItem>
            <SelectItem value="Quiz">Quiz</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(val) => setStatus(val as ContentStatus | "All")}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Title</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Last Updated</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, idx) => (
                <tr key={idx} className="border-t border-border/60">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                  No content found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-semibold text-card-foreground">{item.title}</td>
                  <td className="px-4 py-3">{item.contentType}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/content/${item.id}`} className="text-primary hover:underline text-xs font-semibold">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Link to={`/lectures/${item.id}`} className="text-muted-foreground hover:text-foreground text-xs font-semibold">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        className="text-destructive hover:underline text-xs font-semibold disabled:opacity-50"
                        onClick={() => handleDelete(item.id)}
                        disabled={busyId === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentListPage;




