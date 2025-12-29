export const BatchesRoutes = {
  List: '/batches',
  Detail: '/batches/:batchId',
  detailPath: (batchId: string) => `/batches/${batchId}`,
} as const;
