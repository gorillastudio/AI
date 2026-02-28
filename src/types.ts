export type AnswerKey = Record<number, string>;

export interface StudentTest {
  id: string;
  file: File;
  previewUrl: string;
  status: 'analyzing' | 'success' | 'error';
  studentNumber?: number;
  answers?: Record<number, string>;
  score?: number;
  errorMessage?: string;
  isDuplicate?: boolean;
}
