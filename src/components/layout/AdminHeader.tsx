import React from 'react';
import { ExternalLink, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import type { Profile } from '../../types';
import { logoutAdmin } from '../../services/supabase/auth';
import { Button } from '../ui/Button';

export interface AdminHeaderProps {
  userProfile?: Profile | null;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const PAGE_TITLES = [
  { match: '/admin/programs', title: 'Kelola program' },
  { match: '/admin/faqs', title: 'Kelola FAQ' },
  { match: '/admin/contents', title: 'Kelola konten' },
  { match: '/admin/submissions', title: 'Formulir minat' },
  { match: '/admin/messages', title: 'Pesan kontak' },
  { match: '/admin/chatbot', title: 'MudaBot' },
  { match: '/admin/settings', title: 'Pengaturan' },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  userProfile,
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pageTitle =
    PAGE_TITLES.find((item) => pathname.startsWith(item.match))?.title ?? 'Ringkasan platform';

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <header className="flex h-[78px] shrink-0 items-center justify-between gap-3 border-b border-[#dce4df] bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#dce4df] bg-[#f5f7f3] text-[#0b2033] hover:bg-[#dff3ea] md:hidden"
            aria-label="Buka menu admin"
            aria-controls="admin-sidebar"
            aria-expanded={isSidebarOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#087f72]">
            Portal pengelola
          </p>
          <h1 className="truncate text-base font-extrabold text-[#0b2033] sm:text-lg">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden lg:inline-flex"
          rightIcon={<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          <Link to="/" target="_blank" rel="noopener noreferrer">
            Lihat situs publik
          </Link>
        </Button>

        {userProfile && (
          <div className="hidden items-center gap-2.5 rounded-full border border-[#dce4df] bg-[#f5f7f3] py-1.5 pl-1.5 pr-3 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0b2033] text-xs font-extrabold text-[#d8ed80]">
              {userProfile.full_name?.charAt(0).toUpperCase() || 'A'}
            </span>
            <span className="hidden text-left xl:block">
              <span className="block max-w-36 truncate text-xs font-extrabold leading-tight text-[#0b2033]">
                {userProfile.full_name || 'Admin MudaConnect'}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold capitalize text-[#63717b]">
                <ShieldCheck className="h-3 w-3 text-[#087f72]" aria-hidden="true" />
                {userProfile.role || 'Admin'}
              </span>
            </span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          leftIcon={<LogOut className="h-4 w-4 text-rose-600" aria-hidden="true" />}
          className="border-rose-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          aria-label="Keluar dari portal admin"
        >
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
};
