import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { adminService } from "@/services/adminService"
import { adminFileService } from "@/services/adminFileService"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { validators } from "@/utils/validation"
import { auditService } from "@/services/auditService"
import { ContentPreview } from "@/components/admin/ContentPreview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { UploadCloud, Eye } from "lucide-react"

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
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  useEffect(() => {
    if (!isEdit || !id) return
    setLoading(true)
    adminService.getContentById(id)
      .then((result) => {
        if (!result.success || !result.data) return
        setForm({
          title: result.data.title,
          contentType: result.data.content_type,
          status: result.data.status,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Load failed'))
      .finally(() => setLoading(false))
  }, [id, isEdit]);

  const handleFileUpload = async (file: File) => {
    // Validate file before upload
    const fileType = form.contentType === 'video' ? 'video' : 
                    form.contentType === 'pdf' ? 'pdf' : 'image'
    
    const validation = validators.file(file, fileType)
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    if (isEdit && id) {
      try {
        setSaving(true)
        await adminFileService.uploadFile(file, id, (progress) => {
          setUploadProgress(progress)
        })
        
        // Log audit
        await auditService.logFileUpload(`${file.name}_${Date.now()}`, file.name, file.size as number)
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
        const result = await adminService.updateContent(id, payload)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to update content')
        }
        savedContent = result.data
      } else {
        const result = await adminService.createContent(payload)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to create content')
        }
        savedContent = result.data
        navigate(`/admin/content/${savedContent.id}`)
      }

      if (pendingFiles.length > 0 && savedContent?.id) {
        for (const file of pendingFiles) {
          await adminFileService.uploadFile(file, savedContent.id)
        }
        setPendingFiles([])
      }

      if (status === 'review') {
        if (savedContent?.id) {
          const submitResult = await adminService.publishVideoLecture(savedContent.id)
          if (!submitResult.success) {
            console.error('Failed to submit for review:', submitResult.error)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    const validation = validators.content({
      title: form.title,
      content_type: form.contentType,
      summary: form.summary,
      references: form.references ? form.references.split(',').map(r => r.trim()) : []
    })
    
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      setError(validation.errors[0])
      return
    }
    
    // Clear validation errors and proceed
    setValidationErrors([])
    setError(null)
    handleSave()
  }

  const handlePublish = async () => {
    if (!isEdit || !id) return
    
    // Validate first
    const validation = validators.content({
      title: form.title,
      content_type: form.contentType,
      summary: form.summary,
      references: form.references ? form.references.split(',').map(r => r.trim()) : []
    })
    
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      setError(validation.errors[0])
      return
    }
    
    setShowPublishModal(true)
  }

  const confirmPublish = async () => {
    if (!isEdit || !id) return
    
    setSaving(true)
    try {
      const result = await adminService.updateContent(id, { 
        status: 'published' as const,
        published_at: new Date().toISOString()
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to publish content')
      }
      
      setForm(prev => ({ ...prev, status: 'published' }))
      setShowPublishModal(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish content')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    setShowPreviewModal(true)
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
        {validationErrors.length > 0 && (
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
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
            
            {isEdit && form.status !== 'published' && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handlePreview}
                disabled={saving || loading}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            )}
            
            {isEdit && form.status !== 'published' && (
              <Button 
                type="button" 
                variant="default"
                onClick={handlePublish}
                disabled={saving || loading}
                className="gap-2"
              >
                Publish
              </Button>
            )}
            
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

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Content Preview</h3>
              <Button 
                variant="outline" 
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </Button>
            </div>
            <ContentPreview content={form} contentType={form.contentType} />
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Publish Content?</h3>
              <Button 
                variant="outline" 
                onClick={() => setShowPublishModal(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                This content will be immediately visible to all subscribed learners. Please review the preview below before confirming.
              </p>
              
              <ContentPreview content={form} contentType={form.contentType} />
              
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPublishModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmPublish}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? 'Publishing...' : 'Confirm Publish'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentEditorPage;





