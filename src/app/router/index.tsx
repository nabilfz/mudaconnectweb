import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { RouteLoading } from './RouteLoading';

const PublicLayout = lazy(() =>
  import('../../layouts/PublicLayout').then((module) => ({ default: module.PublicLayout }))
);
const HomePage = lazy(() =>
  import('../../pages/public/HomePage').then((module) => ({ default: module.HomePage }))
);
const AboutPage = lazy(() =>
  import('../../pages/public/AboutPage').then((module) => ({ default: module.AboutPage }))
);
const ProgramsPage = lazy(() =>
  import('../../pages/public/ProgramsPage').then((module) => ({ default: module.ProgramsPage }))
);
const ProgramDetailPage = lazy(() =>
  import('../../pages/public/ProgramDetailPage').then((module) => ({
    default: module.ProgramDetailPage,
  }))
);
const ActivitiesPage = lazy(() =>
  import('../../pages/public/ActivitiesPage').then((module) => ({ default: module.ActivitiesPage }))
);
const ActivityDetailPage = lazy(() =>
  import('../../pages/public/ActivityDetailPage').then((module) => ({
    default: module.ActivityDetailPage,
  }))
);
const FaqPage = lazy(() =>
  import('../../pages/public/FaqPage').then((module) => ({ default: module.FaqPage }))
);
const InterestPage = lazy(() =>
  import('../../pages/public/InterestPage').then((module) => ({ default: module.InterestPage }))
);
const ContactPage = lazy(() =>
  import('../../pages/public/ContactPage').then((module) => ({ default: module.ContactPage }))
);
const PrivacyPage = lazy(() =>
  import('../../pages/public/PrivacyPage').then((module) => ({ default: module.PrivacyPage }))
);
const DisclaimerPage = lazy(() =>
  import('../../pages/public/DisclaimerPage').then((module) => ({
    default: module.DisclaimerPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('../../pages/public/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);
const AdminLoginPage = lazy(() =>
  import('../../pages/admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage }))
);
const AdminForgotPasswordPage = lazy(() =>
  import('../../pages/admin/AdminForgotPasswordPage').then((module) => ({
    default: module.AdminForgotPasswordPage,
  }))
);
const AdminResetPasswordPage = lazy(() =>
  import('../../pages/admin/AdminResetPasswordPage').then((module) => ({
    default: module.AdminResetPasswordPage,
  }))
);
const AdminProtectedApp = lazy(() => import('./AdminProtectedApp'));

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tentang" element={<AboutPage />} />
          <Route path="/program" element={<ProgramsPage />} />
          <Route path="/program/:slug" element={<ProgramDetailPage />} />
          <Route path="/kegiatan" element={<ActivitiesPage />} />
          <Route path="/kegiatan/:slug" element={<ActivityDetailPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/minat" element={<InterestPage />} />
          <Route path="/kontak" element={<ContactPage />} />
          <Route path="/privasi" element={<PrivacyPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
        <Route path="/admin/*" element={<AdminProtectedApp />} />

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);
