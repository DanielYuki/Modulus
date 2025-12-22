import type React from "react";
import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { AppLayout } from "@app/components";
import { LazyHomePage } from "@app/modules/home";
import { LazyBatchNewPage } from "@app/modules/batch-new";
import { BatchNewRoutes } from "@app/modules/batch-new/batch-new.routes";
import { LazyBatchesPage, BatchesRoutes } from "@app/modules/batches";

// TODO: Create ActivityIndicator component instead
// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const RootRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes location={location}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={BatchesRoutes.List} replace />} />
          <Route path="/home" element={<LazyHomePage />} />
          <Route path={BatchNewRoutes.New} element={<LazyBatchNewPage />} />
          <Route path={BatchesRoutes.Base} element={<LazyBatchesPage />} />
        </Route>
        <Route path="*" element={<Navigate to={BatchesRoutes.List} replace />} />
      </Routes>
    </Suspense>
  );
};
