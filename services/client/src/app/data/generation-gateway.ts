/**
 * Data Layer - API Gateway
 * Handles communication with the backend.
 */
import { api } from "@/app/core/api";
import type { GeneratedContent } from "@/app/domain/entities";

export async function generateContent(
  formData: FormData
): Promise<GeneratedContent> {
  const response = await api.post<GeneratedContent>("/api/generate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
