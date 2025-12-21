/**
 * Data Layer - Batch API Gateway
 * Handles communication with batch generation endpoints.
 */
import { api } from "@/app/core/api";

// Types matching backend schemas
export interface BatchItem {
  index: number;
  subject: string;
  status: "pending" | "generating" | "compiling" | "done" | "error";
  tex_available: boolean;
  pdf_available: boolean;
  error: string | null;
}

export interface BatchStatusResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_items: number;
  completed_items: number;
  failed_items: number;
  items: BatchItem[];
}

export interface CreateBatchResponse {
  job_id: string;
  message: string;
}

/**
 * Create a new batch generation job.
 */
export async function createBatch(
  files: File[],
  template: File,
  subjects: string[],
  instructions?: string
): Promise<CreateBatchResponse> {
  const formData = new FormData();

  // Add template
  formData.append("template", template);

  // Add subjects as newline-separated string
  formData.append("subjects", subjects.join("\n"));

  // Add reference PDFs
  for (const file of files) {
    if (file.name.endsWith(".pdf")) {
      formData.append("reference_pdf", file);
      break; // Only first PDF for now
    }
  }

  // Add instructions if provided
  if (instructions) {
    formData.append("instructions", instructions);
  }

  const response = await api.post<CreateBatchResponse>("/api/batch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

/**
 * Get the current status of a batch job.
 */
export async function getBatchStatus(jobId: string): Promise<BatchStatusResponse> {
  const response = await api.get<BatchStatusResponse>(`/api/batch/${jobId}`);
  return response.data;
}

/**
 * Get the URL for downloading a .tex file.
 */
export function getTexUrl(jobId: string, itemIndex: number): string {
  return `${api.defaults.baseURL}/api/batch/${jobId}/item/${itemIndex}/tex`;
}

/**
 * Get the URL for viewing/downloading a PDF.
 * Use this URL directly in window.open() for new tab viewing.
 */
export function getPdfUrl(jobId: string, itemIndex: number): string {
  return `${api.defaults.baseURL}/api/batch/${jobId}/item/${itemIndex}/pdf`;
}
