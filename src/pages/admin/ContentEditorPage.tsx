import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { adminContentService } from "@/services/adminContentService"
import { adminFileService } from "@/services/adminFileService"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { UploadCloud } from "lucide-react"

type FormState = {
  title: string;
  contentType: 'article' | 'video' | 'pdf' | 'quiz';
  status: 'draft' | 'review' | 'published' | 'archived';
  summary: string;
  references: string;
};

const ContentEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAdminAuth()
  const isEdit = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    title: "",
    contentType: "article",
    status: "draft",
    summary: "",
    references: "",
  });
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  useEffect(() => {
    if (!isEdit || !id) return
    setLoading(true)
    adminContentService.getContentById(id)
      .then((content) => {
        if (!content) return
        setForm({
          title: content.title,
          contentType: content.content_type,
          status: content.status,
          summary: content.summary ?? "",
          references: content.references?.join("\n") ?? "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Load failed'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleFileUpload = async (file: File) => {
    if (isEdit && id) {
      try {
        setSaving(true)
        await adminFileService.uploadFile(file, id, (progress) => {
          setUploadProgress(progress)
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setSaving(false)
        setUploadProgress(0)
      }
    } else {
      setPendingFiles((prev) => [...prev, file])
    }
  }

  const handleSave = async (status: 'draft' | 'review' = 'draft') => {
    if (!hasPermission('content.edit')) {
      setError('You do not have permission to edit content')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const payload = {
        title: form.title,
        content_type: form.contentType,
        content: form.summary, // Using summary as content for now
        summary: form.summary || undefined,
        references: form.references
          ? form.references.split('\n').filter((r: string) => r.trim() !== '')
          : undefined,
      }

      let savedContent
      if (isEdit && id) {
        savedContent = await adminContentService.updateContent(id, payload)
      } else {
        savedContent = await adminContentService.createContent(payload)
        navigate(`/admin/content/${savedContent.id}`)
      }

      if (pendingFiles.length > 0 && savedContent?.id) {
        for (const file of pendingFiles) {
          await adminFileService.uploadFile(file, savedContent.id)
        }
        setPendingFiles([])
      }

      if (status === 'review') {
        await adminContentService.submitForReview(savedContent.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave()
  }

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
                  onValueChange={(val) => setForm((f) => ({ ...f, contentType: val as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(val) => setForm((f) => ({ ...f, status: val as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
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
            <Button type="submit" disabled={saving || loading || !hasPermission('content.edit')} className="gap-2" onClick={() => handleSave()}>
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
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/50 px-4 py-10 text-center cursor-pointer hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/quicktime,application/pdf,text/plain,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file)
                    e.target.value = ''
                  }
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





