import type React from "react";
import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { LazyHomePage } from "@app/modules/home";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Route definitions
export const AppRoutes = {
  Home: "/",
  Dashboard: "/dashboard",
} as const;

export const RootRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes location={location}>
        <Route path={AppRoutes.Home} element={<LazyHomePage />} />
        <Route path="*" element={<Navigate to={AppRoutes.Home} replace />} />
      </Routes>
    </Suspense>
  );
};
