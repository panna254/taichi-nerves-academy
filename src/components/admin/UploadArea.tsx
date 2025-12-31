import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { UploadedFile } from "@/types/admin";

type Props = {
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<UploadedFile>;
  onUploaded: (file: UploadedFile) => void;
};

export const UploadArea = ({ onUpload, onUploaded }: Props) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await onUpload(file, setProgress);
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center">
        <UploadCloud className="h-8 w-8 text-primary" />
        <div>
          <p className="font-semibold text-card-foreground">Upload files</p>
          <p className="text-sm text-muted-foreground">Images, PDFs, or videos up to 200MB</p>
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} aria-label="Upload file" />
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Choose file</span>
      </label>
      {uploading && (
        <div className="w-full rounded-full bg-muted">
          <div
            role="progressbar"
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Upload progress: ${progress}%`}
          />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

