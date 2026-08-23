import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <section className="grid min-h-[72vh] border-b border-[#cfcac0] bg-[#071f32] text-white lg:grid-cols-[42%_58%]">
      <div className="hero-copy flex min-h-[300px] flex-col justify-between border-b border-white/20 py-10 lg:min-h-0 lg:border-b-0 lg:border-r lg:py-16">
        <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d8f05c]">
          <span className="h-px w-10 bg-[#d8f05c]" aria-hidden="true" />
          Jalur terputus
        </div>
        <span
          className="text-[clamp(7rem,17vw,19rem)] font-bold leading-[0.72] tracking-[-0.09em] text-white/12"
          aria-hidden="true"
        >
          404
        </span>
      </div>

      <div className="hero-copy flex flex-col justify-center py-14 sm:py-20">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
          Halaman tidak ditemukan
        </p>
        <h1 className="mt-6 max-w-4xl text-[clamp(3.2rem,5.6vw,7rem)] font-bold leading-[0.9] tracking-[-0.06em]">
          Sepertinya kamu
          <span className="editorial-italic block text-[#d8f05c]">keluar dari jalur.</span>
        </h1>
        <p className="mt-8 max-w-xl text-sm leading-7 text-white/68 sm:text-base">
          Alamat yang dibuka mungkin keliru, sudah dipindahkan, atau tidak lagi
          tersedia. Kamu bisa kembali ke beranda atau melanjutkan pencarian program.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center gap-3 bg-[#d8f05c] px-6 text-sm font-extrabold text-[#071f32] transition-colors hover:bg-white"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Kembali ke beranda
          </Link>
          <Link
            to="/program"
            className="inline-flex min-h-12 items-center gap-3 border border-white/35 px-6 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Lihat katalog program
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};
