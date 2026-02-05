// Admin Dashboard Type Definitions

export type Role = "ADMIN" | "EDITOR" | "REVIEWER";

export type ContentType = "Article" | "Video" | "PDF" | "Quiz";

export type ContentStatus = "Draft" | "Review" | "Published";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  previewUrl?: string;
  uploadedAt: string;
}

export interface MedicalContent {
  id: string;
  title: string;
  contentType: ContentType;
  status: ContentStatus;
  lastUpdated: string;
  version: number;
  references: string[];
  summary?: string;
  author?: string;
  reviewerNotes?: string;
  files: UploadedFile[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface ReviewTask {
  id: string;
  contentId: string;
  title: string;
  version: number;
  submittedAt: string;
  status: "Pending" | "Changes Requested" | "Approved";
}

export interface DashboardStats {
  totalContent: number;
  published: number;
  inReview: number;
  drafts: number;
  activeUsers: number;
}



