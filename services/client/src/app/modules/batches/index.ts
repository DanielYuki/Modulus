import { lazy } from 'react';

export const LazyBatchesPage = lazy(() => import('./batches.page'));
export const LazyBatchDetailPage = lazy(() => import('./detail/batch-detail.page'));

export { BatchesRoutes } from './batches.routes';
