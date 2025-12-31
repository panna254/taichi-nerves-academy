import { useEffect, useState } from "react";
import { adminApi } from "@/services/mockAdminApi";
import { UploadedFile } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MediaLibraryPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.getMediaLibrary().then(setFiles).finally(() => setLoading(false));
  }, []);

  const filtered = files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()));

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [...Array(6)].map((_, idx) => <Skeleton key={idx} className="h-32 rounded-2xl" />)
          : filtered.map((file) => (
              <div key={file.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(file.size / 1024)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{file.type.split("/")[1]}</Badge>
                </div>
                <a className="text-xs text-primary font-semibold" href={file.url} target="_blank" rel="noreferrer">
                  Open file
                </a>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MediaLibraryPage;




