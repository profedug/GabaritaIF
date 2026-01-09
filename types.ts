
export enum Difficulty {
  EASY = 'Fácil',
  MEDIUM = 'Médio',
  HARD = 'Difícil'
}

export enum SimulationType {
  TREINO = 'Treino (pós-aula)',
  REFORCO = 'Reforço'
}

export enum QuestionSource {
  IA_ONLY = 'Apenas IA',
  INTERNET_VESTIBULAR = 'Vestibulares/IFs/ENEM',
  MIXED = 'Misto (IA + Vestibulares)'
}

export enum Source {
  IA = 'ia',
  MANUAL = 'manual',
  VESTIBULAR = 'vestibular'
}

export interface Class {
  id: string;
  name: string;
  year: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  pin: string;
  photoUrl?: string;
  parentName: string;
  parentPhone: string;
  classId: string;
}

export interface Professor {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone: string;
  pin: string;
  photoUrl?: string;
  isAdmin: boolean;
  hasAccess: boolean;
}

export interface Question {
  id: string;
  statement: string;
  options: string[];
  correctAnswer: number;
  topic: string; 
  difficulty: Difficulty;
  source: Source;
  originInfo?: string; 
}

export interface Simulation {
  id: string;
  title: string;
  type: SimulationType;
  questions: Question[];
  createdAt: number;
  teacherId: string;
  teacherName: string; 
  year?: string;
  classId?: string;
  targetStudentIds: string[];
}

export interface StudentResponse {
  id: string;
  studentId: string;
  studentName: string;
  simulationId: string;
  answers: number[];
  score: number;
  feedback: string;
  timestamp: number;
}
