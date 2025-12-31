import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "@/services/mockAdminApi";
import { ContentStatus, ContentType, MedicalContent, UploadedFile } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { UploadCloud } from "lucide-react";

type FormState = {
  title: string;
  contentType: ContentType;
  status: ContentStatus;
  summary: string;
  references: string;
};

const ContentEditorPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    title: "",
    contentType: "Article",
    status: "Draft",
    summary: "",
    references: "",
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      adminApi
        .getContentById(id)
        .then((content) => {
          if (!content) return;
          setForm({
            title: content.title,
            contentType: content.contentType,
            status: content.status,
            summary: content.summary ?? "",
            references: content.references.join("\n"),
          });
          setFiles(content.files);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.summary.trim()) {
      setError("Summary is required");
      return;
    }
    setSaving(true);
    const payload: Omit<MedicalContent, "id" | "lastUpdated" | "version"> = {
      title: form.title,
      contentType: form.contentType,
      status: form.status,
      summary: form.summary,
      references: form.references
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
      reviewerNotes: "",
      files,
    };

    if (isEdit && id) {
      await adminApi.updateContent(id, payload);
    } else {
      await adminApi.createContent(payload);
    }
    setSaving(false);
    navigate("/admin/content");
  };

  const handleFileUpload = async (file: File) => {
    setUploadProgress(0);
    const uploaded = await adminApi.uploadFile(
      { name: file.name, size: file.size, type: file.type },
      (percent) => setUploadProgress(percent)
    );
    setFiles((prev) => [uploaded, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">{isEdit ? "Edit Content" : "Create Content"}</h2>
          <p className="text-sm text-muted-foreground">Fill in the details to save your content.</p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Content type</Label>
                <Select
                  value={form.contentType}
                  onValueChange={(val) => setForm((f) => ({ ...f, contentType: val as ContentType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(val) => setForm((f) => ({ ...f, status: val as ContentStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary (mock rich text)</Label>
              <Textarea
                id="summary"
                placeholder="Short abstract or key points..."
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Rich text editor placeholder—ready to plug in later.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="references">References / citations</Label>
              <Textarea
                id="references"
                placeholder="One reference per line"
                value={form.references}
                onChange={(e) => setForm((f) => ({ ...f, references: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving || loading} className="gap-2">
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/content")}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-3">
            <h3 className="text-sm font-semibold text-card-foreground">Upload files</h3>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/50 px-4 py-10 text-center cursor-pointer hover:border-primary">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
              </div>
            )}
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-xs text-muted-foreground">No files yet.</p>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(file.size / 1024)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a className="text-xs text-primary" href={file.url} target="_blank" rel="noreferrer">
                      Preview
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContentEditorPage;




