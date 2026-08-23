import React from 'react';
import {
  Bot,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Settings,
  UserCheck,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { BrandLogo } from '../brand/BrandLogo';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { env } from '../../services/supabase/env';

export interface AdminSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const MENU_ITEMS = [
  { label: 'Ringkasan', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Program', path: '/admin/programs', icon: FolderKanban },
  { label: 'FAQ', path: '/admin/faqs', icon: HelpCircle },
  { label: 'Konten', path: '/admin/contents', icon: FileText },
  { label: 'Form minat', path: '/admin/submissions', icon: UserCheck },
  { label: 'Pesan kontak', path: '/admin/messages', icon: Mail },
  { label: 'MudaBot', path: '/admin/chatbot', icon: Bot },
  { label: 'Pengaturan', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const closeMobile = () => onCloseMobile?.();
  const sidebarRef = useFocusTrap<HTMLElement>(isOpenMobile, closeMobile);

  return (
    <>
      {isOpenMobile && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#071722]/65 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
          aria-label="Tutup menu admin"
        />
      )}

      <aside
        ref={sidebarRef}
        id="admin-sidebar"
        aria-label="Navigasi portal admin"
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] shrink-0 flex-col border-r border-white/8 bg-[#0b2033] text-white shadow-2xl transition-transform duration-300 ease-out md:static md:translate-x-0 md:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[78px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d8ed80]">
              <BrandLogo
                variant="icon"
                decorative
                className="h-7 w-7 object-contain"
              />
            </span>
            <div>
              <span className="block text-sm font-extrabold leading-tight">MudaConnect</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">
                Portal pengelola
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobile}
            className="grid h-10 w-10 place-items-center rounded-xl text-white/55 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">
            Ruang kerja
          </p>
          <div className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#d8ed80] text-[#0b2033] shadow-[0_8px_20px_rgba(216,237,128,.12)]'
                        : 'text-white/64 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                env.isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-300'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-extrabold">
              {env.isSupabaseConfigured ? 'Backend terhubung' : 'Data contoh aktif'}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-white/45">
            {env.isSupabaseConfigured
              ? 'Autentikasi dan data menggunakan konfigurasi Supabase.'
              : 'Hubungkan Supabase sebelum menggunakan portal di produksi.'}
          </p>
        </div>
      </aside>
    </>
  );
};
