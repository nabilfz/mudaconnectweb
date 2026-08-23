import React from 'react';
import { ArrowUpRight, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { BrandLogo } from '../brand/BrandLogo';

const FOOTER_GROUPS = [
  {
    title: 'Eksplorasi',
    links: [
      { label: 'Program', to: '/program' },
      { label: 'Kegiatan', to: '/kegiatan' },
      { label: 'Tentang kami', to: '/tentang' },
      { label: 'Pusat bantuan', to: '/faq' },
    ],
  },
  {
    title: 'Partisipasi',
    links: [
      { label: 'Formulir minat', to: '/minat' },
      { label: 'Hubungi tim', to: '/kontak' },
      { label: 'Kebijakan privasi', to: '/privasi' },
      { label: 'Disclaimer', to: '/disclaimer' },
    ],
  },
];

export const Footer: React.FC = () => (
  <footer className="w-full max-w-none overflow-hidden bg-[#071f32] text-white">
    <div className="site-gutter py-16 sm:py-24">
      <div className="grid gap-14 border-b border-white/15 pb-16 lg:grid-cols-[1.45fr_.55fr] lg:gap-20">
        <div className="max-w-4xl">
          <span className="mb-8 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8f05c]">
            <span className="h-px w-10 bg-[#d8f05c]" aria-hidden="true" />
            Ruang tumbuh generasi muda
          </span>
          <h2 className="text-[clamp(3rem,6vw,7rem)] font-bold leading-[0.92] tracking-[-0.06em]">
            Peluang yang tepat bisa mengubah arah perjalananmu.
          </h2>
          <p className="mt-7 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
            Temukan program yang terkurasi, pahami detailnya, lalu ambil langkah pertama
            menuju pengalaman baru yang berdampak.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              to="/program"
              className="inline-flex min-h-12 items-center gap-3 bg-[#d8f05c] px-6 text-sm font-bold text-[#071f32] transition-colors hover:bg-white"
            >
              Jelajahi program
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/kontak"
              className="inline-flex items-center gap-2 border-b border-white/45 py-2 text-sm font-bold text-white transition-colors hover:border-[#d8f05c] hover:text-[#d8f05c]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Hubungi tim
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 self-end lg:justify-self-end">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#d8f05c]">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-white/68">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link className="transition-colors hover:text-white" to={link.to}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-7 pt-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/" className="inline-block rounded-lg">
            <BrandLogo
              inverse
              loading="lazy"
              className="h-auto w-[156px] object-contain"
            />
          </Link>
          <p className="mt-3 max-w-sm text-xs leading-6 text-white/50">
            Platform informasi dan partisipasi untuk pemuda Indonesia.
          </p>
        </div>

        <div className="text-xs leading-6 text-white/50 sm:text-right">
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#d8f05c]" aria-hidden="true" />
            Informasi terstruktur, keputusan tetap oleh manusia.
          </p>
          <p>© {new Date().getFullYear()} MudaConnect. Hak cipta dilindungi.</p>
        </div>
      </div>
    </div>
  </footer>
);
