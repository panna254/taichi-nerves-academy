import { ChangeEvent } from "react";
import { ContentStatus, ContentType } from "@/types/admin";

type Props = {
  search: string;
  type: ContentType | "All";
  status: ContentStatus | "All";
  onSearchChange: (value: string) => void;
  onTypeChange: (value: ContentType | "All") => void;
  onStatusChange: (value: ContentStatus | "All") => void;
};

const contentTypes: Array<ContentType | "All"> = ["All", "Article", "Video", "PDF", "Quiz"];
const statuses: Array<ContentStatus | "All"> = ["All", "Draft", "Review", "Published"];

export const ContentFilters = ({ search, type, status, onSearchChange, onTypeChange, onStatusChange }: Props) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <input
        type="search"
        placeholder="Search by title..."
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        className="w-full md:w-1/3 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as ContentType | "All")}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Filter by content type"
        >
          {contentTypes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ContentStatus | "All")}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Filter by status"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

