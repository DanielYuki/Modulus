/**
 * Domain Layer - Pure TypeScript Interfaces
 * NO React code here.
 */

export interface GenerationRequest {
  prompt: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
}

export interface GeneratedContent {
  files: Record<string, string>;
  metadata: Record<string, unknown>;
}
