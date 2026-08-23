import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AdminErrorBoundary } from '../../components/admin/AdminErrorBoundary';
import { AuthProvider } from '../../hooks/useAuth';
import { AdminLayout } from '../../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RouteLoading } from './RouteLoading';

const AdminDashboardPage = lazy(() =>
  import('../../pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  }))
);
const AdminProgramsPage = lazy(() =>
  import('../../pages/admin/AdminProgramsPage').then((module) => ({
    default: module.AdminProgramsPage,
  }))
);
const AdminProgramEditPage = lazy(() =>
  import('../../pages/admin/AdminProgramEditPage').then((module) => ({
    default: module.AdminProgramEditPage,
  }))
);
const AdminFaqsPage = lazy(() =>
  import('../../pages/admin/AdminFaqsPage').then((module) => ({ default: module.AdminFaqsPage }))
);
const AdminContentsPage = lazy(() =>
  import('../../pages/admin/AdminContentsPage').then((module) => ({
    default: module.AdminContentsPage,
  }))
);
const AdminSubmissionsPage = lazy(() =>
  import('../../pages/admin/AdminSubmissionsPage').then((module) => ({
    default: module.AdminSubmissionsPage,
  }))
);
const AdminMessagesPage = lazy(() =>
  import('../../pages/admin/AdminMessagesPage').then((module) => ({
    default: module.AdminMessagesPage,
  }))
);
const AdminChatbotPage = lazy(() =>
  import('../../pages/admin/AdminChatbotPage').then((module) => ({
    default: module.AdminChatbotPage,
  }))
);
const AdminSettingsPage = lazy(() =>
  import('../../pages/admin/AdminSettingsPage').then((module) => ({
    default: module.AdminSettingsPage,
  }))
);

export default function AdminProtectedApp() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <AdminErrorBoundary>
                  <AdminLayout />
                </AdminErrorBoundary>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="programs" element={<AdminProgramsPage />} />
              <Route path="programs/new" element={<AdminProgramEditPage />} />
              <Route path="programs/:id/edit" element={<AdminProgramEditPage />} />
              <Route path="faqs" element={<AdminFaqsPage />} />
              <Route path="contents" element={<AdminContentsPage />} />
              <Route path="submissions" element={<AdminSubmissionsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="chatbot" element={<AdminChatbotPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
