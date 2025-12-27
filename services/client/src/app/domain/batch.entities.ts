/**
 * Domain Layer - Batch Types
 * Pure TypeScript interfaces for batch operations.
 * NO React code here.
 */

/** Status of a batch job */
export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Status of a single batch item */
export type ItemStatus = 'pending' | 'generating' | 'compiling' | 'done' | 'error';

/** Single item within a batch */
export interface BatchItem {
  index: number;
  subject: string;
  status: ItemStatus;
  tex_available: boolean;
  pdf_available: boolean;
  error: string | null;
}

/** Full batch job with items (used in detail view) */
export interface BatchJob {
  id: string;
  status: BatchStatus;
  total_items: number;
  completed_items: number;
  failed_items: number;
  items: BatchItem[];
}

/** Batch list item (summary for list view) */
export interface BatchListItem {
  id: string;
  status: BatchStatus;
  total_items: number;
  completed_items: number;
  failed_items: number;
  created_at: string;
}

/** Response when creating a batch */
export interface CreateBatchResult {
  job_id: string;
  message: string;
}
