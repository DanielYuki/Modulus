import type React from "react";
import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { AppLayout } from "@app/components";
import { LazyHomePage } from "@app/modules/home";
import { LazyBatchNewPage } from "@app/modules/batch-new";
import { LazyBatchOutputPage } from "@app/modules/batch-output";

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
  Settings: "/settings",
} as const;

export const RootRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes location={location}>
        <Route element={<AppLayout />}>
          <Route path={AppRoutes.Home} element={<LazyHomePage />} />
          <Route path={AppRoutes.BatchNew} element={<LazyBatchNewPage />} />
          <Route path={AppRoutes.BatchOutput} element={<LazyBatchOutputPage />} />
        </Route>
        <Route path="*" element={<Navigate to={AppRoutes.BatchNew} replace />} />
      </Routes>
    </Suspense>
  );
};
