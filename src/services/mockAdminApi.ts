import { MedicalContent, ContentStatus, ContentType, UploadedFile, User, Role } from "@/types/admin";

let contents: MedicalContent[] = [
  {
    id: "cnt-001",
    title: "Hypertension Guidelines 2025",
    contentType: "Article",
    status: "Review",
    lastUpdated: "2025-12-10T09:00:00Z",
    version: 3,
    references: ["ESC/ESH 2025", "JNC updates"],
    summary: "Updated hypertension guidance with clinical pearls and dosing tables.",
    reviewerNotes: "Verify CKD section references.",
    files: [],
  },
  {
    id: "cnt-002",
    title: "ECG Interpretation Masterclass",
    contentType: "Video",
    status: "Published",
    lastUpdated: "2025-12-01T14:00:00Z",
    version: 2,
    references: ["ACC ECG standards"],
    summary: "Video walkthrough of common ECG patterns with clinical scenarios.",
    files: [],
  },
  {
    id: "cnt-003",
    title: "Diabetes Ketoacidosis Checklist",
    contentType: "PDF",
    status: "Draft",
    lastUpdated: "2025-12-05T10:30:00Z",
    version: 1,
    references: ["ADA 2025", "ISPAD toolkit"],
    summary: "Stepwise DKA management for the ED.",
    files: [],
  },
  {
    id: "cnt-004",
    title: "Respiratory Failure Quiz Pack",
    contentType: "Quiz",
    status: "Draft",
    lastUpdated: "2025-12-08T12:00:00Z",
    version: 1,
    references: ["ARDSNet", "GOLD 2025"],
    summary: "20 MCQs covering acute respiratory failure workup.",
    files: [],
  },
];

let files: UploadedFile[] = [
  {
    id: "file-001",
    name: "cv-lecture.pdf",
    type: "application/pdf",
    size: 1_200_000,
    url: "https://files.taichinerves.com/cv-lecture.pdf",
    uploadedAt: "2025-12-07T08:00:00Z",
  },
  {
    id: "file-002",
    name: "ecg-video.mp4",
    type: "video/mp4",
    size: 12_000_000,
    url: "https://files.taichinerves.com/ecg-video.mp4",
    uploadedAt: "2025-12-01T09:30:00Z",
  },
];

const users: User[] = [
  {
    id: "usr-001",
    name: "Dr. Amina Patel",
    email: "amina.patel@taichinerves.com",
    role: "ADMIN",
  },
  {
    id: "usr-002",
    name: "Chen Wei",
    email: "chen.wei@taichinerves.com",
    role: "EDITOR",
  },
  {
    id: "usr-003",
    name: "Sara Kim",
    email: "sara.kim@taichinerves.com",
    role: "REVIEWER",
  },
];

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

type ContentFilter = {
  search?: string;
  contentType?: ContentType | "All";
  status?: ContentStatus | "All";
};

export const adminApi = {
  async getContents(filter: ContentFilter = {}): Promise<MedicalContent[]> {
    await delay();
    const { search, contentType, status } = filter;
    return contents.filter((item) => {
      const matchesType = contentType && contentType !== "All" ? item.contentType === contentType : true;
      const matchesStatus = status && status !== "All" ? item.status === status : true;
      const matchesSearch = search ? item.title.toLowerCase().includes(search.toLowerCase()) : true;
      return matchesType && matchesStatus && matchesSearch;
    });
  },

  async getContentById(id: string): Promise<MedicalContent | undefined> {
    await delay();
    return contents.find((c) => c.id === id);
  },

  async createContent(payload: Omit<MedicalContent, "id" | "lastUpdated" | "version">): Promise<MedicalContent> {
    await delay();
    const newContent: MedicalContent = {
      ...payload,
      id: `cnt-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      version: 1,
    };
    contents = [newContent, ...contents];
    return newContent;
  },

  async updateContent(id: string, data: Partial<MedicalContent>): Promise<MedicalContent> {
    await delay();
    const existing = contents.find((c) => c.id === id);
    if (!existing) throw new Error("Content not found");
    const updated: MedicalContent = {
      ...existing,
      ...data,
      version: (existing.version ?? 1) + 1,
      lastUpdated: new Date().toISOString(),
    };
    contents = contents.map((c) => (c.id === id ? updated : c));
    return updated;
  },

  async deleteContent(id: string): Promise<void> {
    await delay();
    contents = contents.filter((c) => c.id !== id);
  },

  async getReviewQueue(): Promise<MedicalContent[]> {
    await delay();
    return contents.filter((c) => c.status === "Review");
  },

  async approveContent(id: string): Promise<MedicalContent> {
    return this.updateContent(id, { status: "Published" });
  },

  async requestChanges(id: string, note: string): Promise<MedicalContent> {
    return this.updateContent(id, { status: "Draft", reviewerNotes: note });
  },

  async getMediaLibrary(): Promise<UploadedFile[]> {
    await delay();
    return files;
  },

  async uploadFile(
    file: { name: string; type: string; size: number },
    onProgress?: (percent: number) => void
  ): Promise<UploadedFile> {
    let progress = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        progress = Math.min(100, progress + 20);
        onProgress?.(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const uploaded: UploadedFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: `https://files.taichinerves.com/${file.name}`,
            uploadedAt: new Date().toISOString(),
          };
          files = [uploaded, ...files];
          resolve(uploaded);
        }
      }, 250);
    });
  },

  async getUsers(): Promise<User[]> {
    await delay();
    return users;
  },

  async updateUserRole(userId: string, role: Role): Promise<User> {
    await delay();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, role };
    const idx = users.findIndex((u) => u.id === userId);
    users[idx] = updated;
    return updated;
  },
};





