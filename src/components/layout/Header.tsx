import React, { useState } from 'react';
import { ArrowUpRight, Menu, Sparkles, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { BrandLogo } from '../brand/BrandLogo';

const NAV_LINKS = [
  { label: 'Beranda', path: '/' },
  { label: 'Tentang', path: '/tentang' },
  { label: 'Program', path: '/program' },
  { label: 'Kegiatan', path: '/kegiatan' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Kontak', path: '/kontak' },
];

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const mobileMenuRef = useFocusTrap<HTMLElement>(
    isMobileMenuOpen,
    () => setIsMobileMenuOpen(false)
  );

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 w-full max-w-none border-b border-[#cfcac0] bg-[#fbfaf6]/94 backdrop-blur-xl">
      <div className="site-gutter flex h-[72px] items-center justify-between gap-5">
        <Link
          to="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="group flex min-w-0 items-center gap-3 rounded-xl"
          aria-label="MudaConnect — kembali ke beranda"
        >
          <BrandLogo className="h-auto w-[142px] object-contain transition-opacity duration-300 group-hover:opacity-75 sm:w-[164px]" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <nav
            className="flex items-center gap-7"
            aria-label="Navigasi utama"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-2 text-[13px] font-bold transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-[#007d6f] after:transition-transform ${
                    active
                      ? 'text-[#071f32] after:scale-x-100'
                      : 'text-[#617078] after:scale-x-0 hover:text-[#007d6f] hover:after:scale-x-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/program"
            className="inline-flex min-h-11 items-center gap-3 bg-[#071f32] px-5 text-sm font-bold text-white transition-colors hover:bg-[#007d6f]"
          >
            Temukan peluang
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="grid min-h-11 min-w-11 place-items-center border border-[#cfcac0] bg-transparent text-[#071f32] transition-colors hover:bg-[#e7e3db] lg:hidden"
          aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="fixed inset-x-0 top-[72px] z-50 h-[calc(100dvh-72px)] bg-[#071f32]/50 p-3 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <nav
            ref={mobileMenuRef}
            className="ml-auto flex max-h-full max-w-lg flex-col overflow-y-auto border border-[#cfcac0] bg-[#fbfaf6] p-3 shadow-2xl"
            aria-label="Navigasi seluler"
            aria-modal="true"
            role="dialog"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[#cfcac0] px-3 pb-4 pt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#007d6f]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Jelajahi MudaConnect
            </div>

            {NAV_LINKS.map((link, index) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-12 items-center justify-between border-b border-[#dfdbd3] px-3 py-3 text-base font-bold transition-colors ${
                    active
                      ? 'border-l-4 border-l-[#007d6f] bg-[#f1eee7] text-[#00685d]'
                      : 'text-[#071f32] hover:bg-[#f1eee7]'
                  }`}
                >
                  {link.label}
                  <span className="text-[#a7b5ae]" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </Link>
              );
            })}

            <Link
              to="/program"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 bg-[#071f32] px-5 text-sm font-bold text-white"
            >
              Temukan peluang
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
