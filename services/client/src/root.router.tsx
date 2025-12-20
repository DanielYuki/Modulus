import type React from "react";
import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { LazyHomePage } from "@app/modules/home";
import { LazyBatchNewPage } from "@app/modules/batch-new";
import { LazyBatchProgressPage } from "@app/modules/batch-progress";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Route definitions
export const AppRoutes = {
  Home: "/",
  Documents: "/documents",
  BatchNew: "/batch/new",
  BatchOutput: "/batch/output",
  BatchProgress: "/batch/:id",
  Settings: "/settings",
} as const;

export const RootRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes location={location}>
        <Route path={AppRoutes.Home} element={<LazyHomePage />} />
        <Route path={AppRoutes.BatchNew} element={<LazyBatchNewPage />} />
        <Route path={AppRoutes.BatchProgress} element={<LazyBatchProgressPage />} />
        <Route path={AppRoutes.BatchOutput} element={<LazyBatchProgressPage />} />
        <Route path="*" element={<Navigate to={AppRoutes.BatchNew} replace />} />
      </Routes>
    </Suspense>
  );
};
