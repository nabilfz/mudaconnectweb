import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MudaBotWidget } from '../components/chatbot/MudaBotWidget';
import { Seo } from '../components/seo/Seo';

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'MudaConnect — Peluang Tumbuh untuk Pemuda',
    description:
      'Temukan program, pelatihan, kegiatan, dan peluang pengembangan diri untuk pemuda Indonesia.',
  },
  '/tentang': {
    title: 'Tentang Kami',
    description:
      'Kenali cara MudaConnect merapikan informasi program dan peluang kepemudaan agar mudah dibandingkan.',
  },
  '/program': {
    title: 'Program untuk Pemuda',
    description:
      'Jelajahi program kepemudaan berdasarkan kategori, format, jadwal, dan status pendaftaran.',
  },
  '/kegiatan': {
    title: 'Kegiatan dan Wawasan',
    description:
      'Baca artikel, dengarkan audio, tonton video, dan ikuti kabar kegiatan MudaConnect.',
  },
  '/faq': {
    title: 'Pertanyaan Umum',
    description:
      'Temukan jawaban tentang program, persyaratan, formulir minat, biaya, jadwal, dan layanan MudaConnect.',
  },
  '/minat': {
    title: 'Formulir Minat Program',
    description:
      'Sampaikan minat awal terhadap program MudaConnect untuk ditinjau oleh tim pengelola.',
  },
  '/kontak': {
    title: 'Hubungi MudaConnect',
    description:
      'Sampaikan pertanyaan program, masukan platform, atau usulan kemitraan kepada tim MudaConnect.',
  },
  '/privasi': {
    title: 'Kebijakan Privasi',
    description:
      'Pelajari data yang dikumpulkan MudaConnect, tujuan pemrosesan, penyimpanan, dan pilihan pengguna.',
  },
  '/disclaimer': {
    title: 'Disclaimer',
    description:
      'Baca batas penggunaan informasi program, jawaban otomatis, media, dan layanan pihak ketiga di MudaConnect.',
  },
};

export const PublicLayout: React.FC = () => {
  const { pathname } = useLocation();
  const exactMeta = ROUTE_META[pathname];
  const fallbackMeta = pathname.startsWith('/program/')
    ? ROUTE_META['/program']
    : pathname.startsWith('/kegiatan/')
      ? ROUTE_META['/kegiatan']
      : {
          title: 'Halaman Tidak Ditemukan',
          description: 'Halaman yang kamu cari tidak tersedia di MudaConnect.',
        };
  const routeMeta = exactMeta || fallbackMeta;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="public-shell flex min-h-screen w-full max-w-none flex-col bg-[#f5f7f3] font-sans text-[#24323d]">
      <Seo
        title={routeMeta.title}
        description={routeMeta.description}
        path={pathname}
        noIndex={!exactMeta && !pathname.startsWith('/program/') && !pathname.startsWith('/kegiatan/')}
      />
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>
      <Header />

      <main id="main-content" className="min-w-0 w-full max-w-none flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />

      {/* Floating Chatbot Widget */}
      <div id="chatbot">
        <MudaBotWidget />
      </div>
    </div>
  );
};
