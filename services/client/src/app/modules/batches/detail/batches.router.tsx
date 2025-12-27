import type React from 'react';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Icon } from '@atomic';
import { BatchesRoutes } from '../batches.routes';
import { LazyBatchDetailPage } from './index';

// TODO: create ActivityIndicator component
// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center py-20">
    <Icon name="progress_activity" size="xl" color="primary" className="animate-spin" />
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
