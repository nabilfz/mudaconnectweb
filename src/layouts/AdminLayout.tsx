import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';
import { AdminSeo } from '../components/seo/AdminSeo';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { userProfile } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f2f6f4] text-[#24323d]">
      <AdminSeo />
      <a href="#admin-main-content" className="skip-link">
        Lewati ke konten admin
      </a>
      {/* Desktop & Mobile Sidebar */}
      <AdminSidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader
          userProfile={userProfile}
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          isSidebarOpen={mobileSidebarOpen}
        />

        <main
          id="admin-main-content"
          tabIndex={-1}
          className="surface-grid flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
