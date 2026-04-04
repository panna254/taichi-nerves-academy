import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminService, showToast } from "@/services/adminService";
import { ContentItem } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Eye } from "lucide-react";

const ContentListPage = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    const result = await adminService.getContents({
      search: search || undefined,
      type: contentType !== "all" ? contentType : undefined,
      status: status !== "all" ? status : undefined,
    });
    
    if (result.success && result.data) {
      setItems(result.data);
    } else {
      setError(result.error || "Failed to load content");
      showToast(false, result.error || "Failed to load content");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [search, contentType, status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      return;
    }

    setBusyId(id);
    
    const result = await adminService.deleteVideoLecture(id);
    
    if (result.success) {
      showToast(true, "Content deleted successfully");
      load();
    } else {
      showToast(false, result.error || "Failed to delete content");
    }
    
    setBusyId(null);
  };

  const handlePublish = async (id: string) => {
    setBusyId(id);
    
    const result = await adminService.publishVideoLecture(id);
    
    if (result.success) {
      showToast(true, "Content published successfully");
      load();
    } else {
      showToast(false, result.error || "Failed to publish content");
    }
    
    setBusyId(null);
  };

  const handleUnpublish = async (id: string) => {
    setBusyId(id);
    
    const result = await adminService.unpublishVideoLecture(id);
    
    if (result.success) {
      showToast(true, "Content unpublished successfully");
      load();
    } else {
      showToast(false, result.error || "Failed to unpublish content");
    }
    
    setBusyId(null);
  };

  const filtered = useMemo(() => items, [items]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
        />
        <Select value={contentType} onValueChange={(val) => setContentType(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(val) => setStatus(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Content</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={load}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

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
                  <td className="px-4 py-3 capitalize">{item.content_type}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`capitalize ${getStatusColor(item.status)}`}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/content/${item.id}`} className="text-primary hover:underline text-xs font-semibold">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Link to={`/lectures/${item.id}`} className="text-muted-foreground hover:text-foreground text-xs font-semibold">
                        <Eye className="h-4 w-4" />
                      </Link>
                      {item.status === 'published' ? (
                        <button
                          className="text-yellow-600 hover:text-yellow-700 text-xs font-semibold disabled:opacity-50"
                          onClick={() => handleUnpublish(item.id)}
                          disabled={busyId === item.id}
                          title="Unpublish"
                        >
                          ▼
                        </button>
                      ) : (
                        <button
                          className="text-green-600 hover:text-green-700 text-xs font-semibold disabled:opacity-50"
                          onClick={() => handlePublish(item.id)}
                          disabled={busyId === item.id}
                          title="Publish"
                        >
                          ▲
                        </button>
                      )}
                      <button
                        className="text-destructive hover:underline text-xs font-semibold disabled:opacity-50"
                        onClick={() => handleDelete(item.id)}
                        disabled={busyId === item.id}
                        title="Delete"
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





