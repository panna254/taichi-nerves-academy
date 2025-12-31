import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContentStatus, ContentType, MedicalContent, UploadedFile } from "@/types/admin";
import { UploadArea } from "./UploadArea";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  contentType: z.enum(["Article", "Video", "PDF", "Quiz"]),
  status: z.enum(["Draft", "Review"]),
  summary: z.string().min(10, "Summary should be descriptive"),
  references: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: MedicalContent;
  files: UploadedFile[];
  onSubmit: (data: Omit<MedicalContent, "id" | "version" | "lastUpdated">) => void;
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<UploadedFile>;
  onFileAdded: (file: UploadedFile) => void;
};

export const ContentForm = ({ defaultValues, onSubmit, onUpload, files, onFileAdded }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      contentType: defaultValues?.contentType ?? "Article",
      status: (defaultValues?.status as ContentStatus | undefined) ?? "Draft",
      summary: defaultValues?.summary ?? "",
      references: defaultValues?.references?.join("\n") ?? "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      setValue("title", defaultValues.title);
      setValue("contentType", defaultValues.contentType);
      setValue("status", defaultValues.status === "Published" ? "Review" : defaultValues.status);
      setValue("summary", defaultValues.summary);
      setValue("references", defaultValues.references.join("\n"));
    }
  }, [defaultValues, setValue]);

  const submitForm = (values: FormValues) => {
    const payload: Omit<MedicalContent, "id" | "version" | "lastUpdated"> = {
      id: defaultValues?.id ?? "",
      title: values.title,
      contentType: values.contentType as ContentType,
      status: values.status,
      summary: values.summary,
      references: values.references ? values.references.split("\n").map((r) => r.trim()).filter(Boolean) : [],
      version: defaultValues?.version ?? 1,
      lastUpdated: defaultValues?.lastUpdated ?? new Date().toISOString(),
      author: defaultValues?.author ?? "Admin",
      files,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-card-foreground">Title</label>
          <input
            {...register("title")}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Enter title"
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-card-foreground">Content Type</label>
            <select
              {...register("contentType")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {(["Article", "Video", "PDF", "Quiz"] as ContentType[]).map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-card-foreground">Status</label>
            <select
              {...register("status")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {(["Draft", "Review"] as ContentStatus[]).map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-card-foreground">Summary (rich text placeholder)</label>
        <textarea
          {...register("summary")}
          rows={4}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Write a concise overview..."
        />
        {errors.summary && <p className="text-sm text-destructive">{errors.summary.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-card-foreground">References / citations</label>
        <textarea
          {...register("references")}
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="One reference per line"
        />
        {errors.references && <p className="text-sm text-destructive">{errors.references.message}</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-card-foreground">Upload files</p>
            <p className="text-xs text-muted-foreground">Attach images, PDFs, or video previews.</p>
          </div>
        </div>
        <UploadArea
          onUpload={async (file, progress) => {
            const uploaded = await onUpload(file, progress);
            onFileAdded(uploaded);
            return uploaded;
          }}
          onUploaded={() => {}}
        />
        {files.length ? (
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <span
                key={file.id}
                className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
              >
                {file.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save content"}
        </button>
      </div>
    </form>
  );
};

