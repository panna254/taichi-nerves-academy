import { useEffect, useState } from "react";
import { adminService, showToast } from "@/services/adminService";
import { ContentFile } from "@/services/adminService";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MediaLibraryPage = () => {
  const [files, setFiles] = useState<ContentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    // For now, we'll fetch content files from the database
    // In a real implementation, you might want to add a getMediaFiles method
    const result = await adminService.getContents();
    
    if (result.success && result.data) {
      // Extract files from content items
      const allFiles: ContentFile[] = [];
      // This is a placeholder - you'd need to implement proper file fetching
      // For now, we'll show an empty state
      setFiles(allFiles);
    } else {
      setError(result.error || "Failed to load media library");
      showToast(false, result.error || "Failed to load media library");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const filtered = files.filter((file) => 
    file.original_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Media Library</h2>
          <p className="text-sm text-muted-foreground">Uploaded images, PDFs, and videos.</p>
        </div>
        <Input
          className="max-w-xs"
          placeholder="Search files"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Media Library</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadFiles}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [...Array(6)].map((_, idx) => <Skeleton key={idx} className="h-32 rounded-2xl" />)
          : filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
              {search ? "No files found matching your search." : "No files uploaded yet."}
            </div>
          ) : filtered.map((file) => (
              <div key={file.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground truncate">{file.original_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(file.file_size / 1024)} KB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{file.file_type.split("/")[1]}</Badge>
                </div>
                <a className="text-xs text-primary font-semibold" href={file.public_url} target="_blank" rel="noreferrer">
                  Open file
                </a>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MediaLibraryPage;





