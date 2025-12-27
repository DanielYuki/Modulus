/**
 * Data Layer - Batch API Gateway
 * Handles communication with batch generation endpoints.
 */
import { api } from "@/app/core/api";
import type {
  BatchItem,
  BatchJob,
  BatchListItem,
  CreateBatchResult,
} from "@/app/domain/batch.entities";

// Re-export types for convenience (consumers can import from gateway or domain) // TODO: Remove these re-exports
export type { BatchItem, BatchJob, BatchListItem, CreateBatchResult };

/**
 * List all batch jobs.
 */
export async function listBatches(): Promise<BatchListItem[]> {
  const response = await api.get<BatchListItem[]>("/api/batch");
  return response.data;
}

/**
 * Create a new batch generation job.
 */
export async function createBatch(
  files: File[],
  template: File,
  subjects: string[],
  instructions?: string
): Promise<CreateBatchResult> {
  const formData = new FormData();

  // Add template
  formData.append("template", template);

  // Add subjects as newline-separated string
  formData.append("subjects", subjects.join("\n"));

  // TODO: implement proper PDF handling
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

  const response = await api.post<CreateBatchResult>("/api/batch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

/**
 * Get the current status of a batch job.
 */
export async function getBatchStatus(jobId: string): Promise<BatchJob> {
  const response = await api.get<BatchJob>(`/api/batch/${jobId}`);
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
 * - Without download param: inline viewing (preview)
 * - With download=true: forces download
 */
export function getPdfUrl(jobId: string, itemIndex: number, download = false): string {
  const base = `${api.defaults.baseURL}/api/batch/${jobId}/item/${itemIndex}/pdf`;
  return download ? `${base}?download=true` : base;
}

/**
 * Get the URL for downloading all PDFs as a zip file.
 */
export function getDownloadAllUrl(jobId: string): string {
  return `${api.defaults.baseURL}/api/batch/${jobId}/download-all`;
}
