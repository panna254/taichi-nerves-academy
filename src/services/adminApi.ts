import {
  AuthSession,
  ContentStatus,
  ContentType,
  DashboardStats,
  MedicalContent,
  ReviewTask,
  Role,
  UploadedFile,
  User,
} from "@/types/admin";

const simulateDelay = <T>(data: T, delay = 400) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), delay));

const now = () => new Date().toISOString();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

let mockContents: MedicalContent[] = [
  {
    id: "ct-1",
    title: "Managing Diuretic Therapy in Heart Failure",
    contentType: "Article",
    status: "Review",
    summary: "Evidence-based guidance on loop and thiazide diuretics with dosing pearls and monitoring steps.",
    references: ["ACC/AHA HF guidelines 2022", "NEJM 2023 diuretic strategies"],
    version: 3,
    lastUpdated: "2025-01-10T12:00:00Z",
    author: "Dr. A. Patel",
    files: [],
  },
  {
    id: "ct-2",
    title: "Point-of-Care Ultrasound for DVT",
    contentType: "Video",
    status: "Published",
    summary: "Quick-start video on compression ultrasound technique, anatomy landmarks, and pitfalls.",
    references: ["ACEP Sonoguide", "J Thromb Haemost 2024"],
    version: 2,
    lastUpdated: "2025-01-08T15:30:00Z",
    author: "Dr. B. Chen",
    files: [],
  },
  {
    id: "ct-3",
    title: "Antibiotic Stewardship Quiz - ICU",
    contentType: "Quiz",
    status: "Draft",
    summary: "Ten-question formative quiz on ICU antibiotic best practices and de-escalation.",
    references: ["IDSA 2024 sepsis guidance"],
    version: 1,
    lastUpdated: "2025-01-05T09:20:00Z",
    author: "Dr. L. Gomez",
    files: [],
  },
  {
    id: "ct-4",
    title: "ECG Library Pocket PDF",
    contentType: "PDF",
    status: "Published",
    summary: "High-yield ECG reference covering rhythms, ischemia patterns, and electrolyte changes.",
    references: ["ACC ECG primer 2023"],
    version: 5,
    lastUpdated: "2025-01-02T11:00:00Z",
    author: "Dr. M. Okeke",
    files: [],
  },
];

let mockUploads: UploadedFile[] = [
  {
    id: "up-1",
    name: "hf-diuretics-slides.pdf",
    url: "/files/hf-diuretics-slides.pdf",
    type: "application/pdf",
    size: 1.2 * 1024 * 1024,
    uploadedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "up-2",
    name: "pocus-dvt-demo.mp4",
    url: "/files/pocus-dvt-demo.mp4",
    type: "video/mp4",
    size: 52 * 1024 * 1024,
    uploadedAt: "2025-01-08T14:00:00Z",
  },
];

let mockReviewQueue: ReviewTask[] = [
  {
    id: "rv-1",
    contentId: "ct-1",
    title: "Managing Diuretic Therapy in Heart Failure",
    version: 3,
    submittedAt: "2025-01-10T12:30:00Z",
    status: "Pending",
  },
  {
    id: "rv-2",
    contentId: "ct-3",
    title: "Antibiotic Stewardship Quiz - ICU",
    version: 1,
    submittedAt: "2025-01-05T10:00:00Z",
    status: "Pending",
  },
];

const mockUsers: User[] = [
  { id: "u-1", name: "Amira Singh", email: "amira@taichinerves.com", role: "ADMIN" },
  { id: "u-2", name: "Jonas Kim", email: "jonas@taichinerves.com", role: "EDITOR" },
  { id: "u-3", name: "Rita Patel", email: "rita@taichinerves.com", role: "REVIEWER" },
];

export const adminApi = {
  async login(email: string, _password: string, role: Role): Promise<AuthSession> {
    const user = mockUsers.find((u) => u.email === email) ?? { id: uid(), name: email.split("@")[0], email, role };
    return simulateDelay({ token: `mock-token-${role}-${Date.now()}`, user });
  },

  async fetchContents(filters?: { search?: string; type?: ContentType | "All"; status?: ContentStatus | "All" }) {
    let results = [...mockContents];
    if (filters?.search) {
      results = results.filter((c) => c.title.toLowerCase().includes(filters.search!.toLowerCase()));
    }
    if (filters?.type && filters.type !== "All") {
      results = results.filter((c) => c.contentType === filters.type);
    }
    if (filters?.status && filters.status !== "All") {
      results = results.filter((c) => c.status === filters.status);
    }
    return simulateDelay(results);
  },

  async fetchContentById(id: string) {
    const content = mockContents.find((c) => c.id === id);
    if (!content) throw new Error("Content not found");
    return simulateDelay(content);
  },

  async createContent(payload: Omit<MedicalContent, "id" | "lastUpdated" | "version">) {
    const newContent: MedicalContent = {
      ...payload,
      id: uid(),
      lastUpdated: now(),
      version: 1,
    };
    mockContents = [newContent, ...mockContents];
    return simulateDelay(newContent);
  },

  async updateContent(id: string, payload: Partial<MedicalContent>) {
    mockContents = mockContents.map((c) =>
      c.id === id ? { ...c, ...payload, version: (c.version ?? 1) + 1, lastUpdated: now() } : c
    );
    const updated = mockContents.find((c) => c.id === id);
    if (!updated) throw new Error("Content not found after update");
    return simulateDelay(updated);
  },

  async deleteContent(id: string) {
    mockContents = mockContents.filter((c) => c.id !== id);
    mockReviewQueue = mockReviewQueue.filter((r) => r.contentId !== id);
    return simulateDelay({ success: true });
  },

  async fetchReviewQueue() {
    return simulateDelay(mockReviewQueue);
  },

  async updateReviewTask(id: string, status: ReviewTask["status"]) {
    mockReviewQueue = mockReviewQueue.map((task) => (task.id === id ? { ...task, status } : task));
    return simulateDelay(mockReviewQueue.find((t) => t.id === id)!);
  },

  async fetchUploads() {
    return simulateDelay(mockUploads);
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    let progress = 0;
    const totalSteps = 5;
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        progress += 100 / totalSteps;
        onProgress?.(Math.min(100, Math.round(progress)));
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 150);
    });

    const uploaded: UploadedFile = {
      id: uid(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: now(),
    };
    mockUploads = [uploaded, ...mockUploads];
    return simulateDelay(uploaded, 200);
  },

  async fetchUsers() {
    return simulateDelay(mockUsers);
  },

  async fetchStats(): Promise<DashboardStats> {
    const totalContents = mockContents.length;
    const drafts = mockContents.filter((c) => c.status === "Draft").length;
    const inReview = mockContents.filter((c) => c.status === "Review").length;
    const published = mockContents.filter((c) => c.status === "Published").length;
    return simulateDelay({ totalContents, drafts, inReview, published });
  },
};

