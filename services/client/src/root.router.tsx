import { AppLayout } from '@app/components';
import { LazyBatchNewPage } from '@app/modules/batch-new';
import { BatchNewRoutes } from '@app/modules/batch-new/batch-new.routes';
import { LazyBatchDetailPage, LazyBatchesPage } from '@app/modules/batches';
import { BatchesRoutes } from '@app/modules/batches/batches.routes';
import { ActivityIndicator } from '@atomic';
import type React from 'react';
import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';

export const RootRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<ActivityIndicator type="spinner" size="lg" />}>
      <Routes location={location}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={BatchesRoutes.List} replace />} />
          <Route path={BatchNewRoutes.New} element={<LazyBatchNewPage />} />
          <Route path={BatchesRoutes.List} element={<LazyBatchesPage />} />
          <Route path={BatchesRoutes.Detail} element={<LazyBatchDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to={BatchesRoutes.List} replace />} />
      </Routes>
    </Suspense>
  );
};
