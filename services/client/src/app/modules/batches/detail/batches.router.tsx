import type React from 'react';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { BatchesRoutes } from '../batches.routes';
import { LazyBatchDetailPage } from './index';

// TODO: create ActivityIndicator component
// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center py-20">
    <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
  </div>
);

export const BatchesRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path={BatchesRoutes.Detail} element={<LazyBatchDetailPage />} />
      </Routes>
    </Suspense>
  );
};
