import type React from 'react';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { ActivityIndicator } from '@atomic';
import { BatchesRoutes } from '../batches.routes';
import { LazyBatchDetailPage } from './index';

export const BatchesRouter: React.FC = () => {
  return (
    <Suspense fallback={<ActivityIndicator type="spinner" size="xl" />}>
      <Routes>
        <Route path={BatchesRoutes.Detail} element={<LazyBatchDetailPage />} />
      </Routes>
    </Suspense>
  );
};
