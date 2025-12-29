export type LectureResourceType = "slides" | "notes" | "quiz" | "reference" | "practice";

export type LectureResource = {
  label: string;
  type: LectureResourceType;
  url: string;
};

export type Lecture = {
  slug: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  date: string;
  tags: string[];
  resources: LectureResource[];
};

export const getYoutubeThumbnail = (youtubeId: string) =>
  `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

export const getYoutubeEmbedUrl = (youtubeId: string) =>
  `https://www.youtube.com/embed/${youtubeId}?rel=0`;

export const recentLectures: Lecture[] = [
  {
    slug: "membrane-transport-plasma-membrane",
    title: "Membrane Transport Across the Plasma Membrane",
    description:
      "Explore how molecules and ions cross the cell membrane: what the membrane is made of, the roles of its structures, and how passive vs active transport differ across their mechanisms.",
    youtubeId: "UpAewnVYivA",
    duration: "50 min",
    level: "Beginner",
    date: "Dec 14, 2025",
    tags: ["Membrane Transport", "Passive Transport", "Active Transport", "Cell Membrane", "Ion Channels"],
    resources: [],
  },
  {
    slug: "diuretic-agents-overview",
    title: "Diuretic Agents: Classes, PK/PD, and Clinical Use",
    description:
      "Explore all five classes of diuretics—their chemistry, pharmacodynamics, and pharmacokinetics—along with indications, contraindications, toxicities, and prescribing considerations with examples for each class.",
    youtubeId: "47Eoh-UV5h0",
    duration: "31 min",
    level: "Intermediate",
    date: "Dec 09, 2025",
    tags: ["Diuretics", "Pharmacology", "PK/PD", "Clinical Indications", "Toxicity"],
    resources: [],
  },
];

export const findLectureBySlug = (slug: string) =>
  recentLectures.find((lecture) => lecture.slug === slug);

