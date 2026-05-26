import type { Training } from "@/types";
import { CURRENT_USER_ID } from "./users";

export let MOCK_TRAININGS: Training[] = [
  {
    id: "tr-001",
    title: "Digital Marketing Fundamentals",
    description: "Master the essentials of digital marketing strategies and tools.",
    category: "Marketing",
    status: "In Progress",
    instructorId: "u-002",
    instructorName: "Maria Santos",
    isInstructor: false,
    totalHours: 6,
    moduleCount: 12,
    enrollmentCount: 48,
    progress: 75,
    completed: false,
    progressColor: "#8B1A1A",
    tags: ["Marketing", "SEO", "Social Media"],
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tr-002",
    title: "Project Management Essentials",
    description: "Learn the core principles of effective project management.",
    category: "Management",
    status: "In Progress",
    instructorId: "u-003",
    instructorName: "John Reyes",
    isInstructor: false,
    totalHours: 8,
    moduleCount: 15,
    enrollmentCount: 32,
    progress: 45,
    completed: false,
    progressColor: "#16a34a",
    tags: ["Agile", "Scrum", "PMP"],
    createdAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "tr-003",
    title: "Data Analytics Bootcamp",
    description: "Transform data into actionable insights with analytics.",
    category: "Analytics",
    status: "In Progress",
    instructorId: CURRENT_USER_ID,
    instructorName: "Jose Dela Cruz",
    isInstructor: true,
    totalHours: 10,
    moduleCount: 18,
    enrollmentCount: 55,
    progress: 60,
    completed: false,
    progressColor: "#d97706",
    tags: ["Data", "Python", "BI"],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "tr-004",
    title: "Leadership Excellence Program",
    description: "Develop essential leadership skills for modern organizations.",
    category: "Leadership",
    status: "Completed",
    instructorId: "u-005",
    instructorName: "Robert Tan",
    isInstructor: false,
    totalHours: 5,
    moduleCount: 10,
    enrollmentCount: 40,
    progress: 100,
    completed: true,
    progressColor: "#8B1A1A",
    tags: ["Leadership", "EQ", "Communication"],
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "tr-005",
    title: "Advanced Excel & Power BI",
    description: "From formulas to dashboards — master Excel and Power BI for business reporting.",
    category: "Analytics",
    status: "Not Started",
    instructorId: "u-004",
    instructorName: "Anna Cruz",
    isInstructor: false,
    totalHours: 7,
    moduleCount: 14,
    enrollmentCount: 22,
    progress: 0,
    completed: false,
    progressColor: "#7c3aed",
    tags: ["Excel", "Power BI", "Reporting"],
    createdAt: "2026-04-01T00:00:00.000Z",
  },
];

export function getTrainingById(id: string): Training | undefined {
  return MOCK_TRAININGS.find((t) => t.id === id);
}

export function addTraining(training: Training): void {
  MOCK_TRAININGS = [training, ...MOCK_TRAININGS];
}

export function updateTraining(id: string, patch: Partial<Training>): Training | undefined {
  const idx = MOCK_TRAININGS.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  MOCK_TRAININGS[idx] = { ...MOCK_TRAININGS[idx], ...patch };
  return MOCK_TRAININGS[idx];
}

export function deleteTraining(id: string): boolean {
  const before = MOCK_TRAININGS.length;
  MOCK_TRAININGS = MOCK_TRAININGS.filter((t) => t.id !== id);
  return MOCK_TRAININGS.length < before;
}
