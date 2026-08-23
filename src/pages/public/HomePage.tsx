import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';
import { ContentCard } from '../../components/content/ContentCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProgramCard } from '../../components/programs/ProgramCard';
import { getLatestContents } from '../../services/supabase/contents';
import { getPopularFaqs } from '../../services/supabase/faqs';
import { getFeaturedPrograms } from '../../services/supabase/programs';
import type { ContentItem, FAQ, Program } from '../../types';
import { mapDeliveryMode, mapRegistrationStatus } from '../../utils/enumMappers';
import { formatDateRange } from '../../utils/formatters';
import { getProgramImage } from '../../utils/programImages';

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85';

const VALUE_POINTS = [
  {
    index: '01',
    title: 'Peluang lebih mudah ditemukan',
    description: 'Program, pelatihan, dan kegiatan terkurasi hadir dalam satu katalog yang jelas.',
  },
  {
    index: '02',
    title: 'Informasi lebih transparan',
    description: 'Jadwal, biaya, format kegiatan, dan persyaratan ditampilkan sejak awal.',
  },
  {
    index: '03',
    title: 'Keputusan tetap manusiawi',
    description: 'Teknologi membantu proses awal; keputusan peserta tetap di tangan pengelola.',
  },
];

export const HomePage: React.FC = () => {
  const [featuredPrograms, setFeaturedPrograms] = useState<Program[]>([]);
  const [latestContents, setLatestContents] = useState<ContentItem[]>([]);
  const [popularFaqs, setPopularFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const [programs, contents, faqs] = await Promise.all([
        getFeaturedPrograms(),
        getLatestContents(3),
        getPopularFaqs(),
      ]);

      if (!isMountedRef.current) return;
      setFeaturedPrograms(programs);
      setLatestContents(contents);
      setPopularFaqs(faqs);
    } catch {
      if (isMountedRef.current) setHasError(true);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void loadHomeData();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadHomeData]);

  const leadProgram = featuredPrograms[0];

  return (
    <div className="min-h-screen w-full max-w-none bg-[#f1eee7]">
      <section className="relative w-full max-w-none overflow-hidden border-b border-white/20 bg-[#071f32] text-white">
        <div className="home-hero-grid">
          <div className="hero-copy relative z-10 flex flex-col justify-between py-11 lg:py-9 xl:py-11">
            <div className="reveal-up">
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#d8f05c]">
                <span className="h-px w-10 bg-[#d8f05c]" aria-hidden="true" />
                MudaConnect / Indonesia
              </div>

              <h1 className="mt-6 w-full max-w-none text-[clamp(3.25rem,6.1vw,7.1rem)] font-bold leading-[0.86] tracking-[-0.065em]">
                <span className="block sm:whitespace-nowrap">Tumbuh lewat</span>
                <span className="block">
                  <span className="editorial-italic text-[#d8f05c]">peluang</span> yang
                </span>
                <span className="block">tepat.</span>
              </h1>

              <div className="mt-6 grid w-full max-w-none gap-5 border-t border-white/20 pt-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                  Program, pelatihan, dan ruang kolaborasi untuk anak muda yang ingin
                  bergerak lebih jauh—dengan informasi yang jelas sejak awal.
                </p>

                <div className="flex flex-wrap items-center gap-5">
                  <Link
                    to="/program"
                    className="inline-flex min-h-13 items-center gap-3 bg-[#d8f05c] px-6 text-sm font-extrabold text-[#071f32] transition-colors hover:bg-white"
                  >
                    Lihat program
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/tentang"
                    className="group inline-flex items-center gap-2 border-b border-white/45 py-2 text-sm font-bold text-white transition-colors hover:border-[#d8f05c] hover:text-[#d8f05c]"
                  >
                    Tentang kami
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
              <span>Informasi terkurasi</span>
              <span className="h-1 w-1 bg-[#d8f05c]" aria-hidden="true" />
              <span>Daring & luring</span>
              <span className="h-1 w-1 bg-[#d8f05c]" aria-hidden="true" />
              <span>Terbuka untuk pemuda</span>
            </div>
          </div>

          <div className="home-hero-media relative lg:border-l lg:border-white/20">
            <img
              src={leadProgram ? getProgramImage(leadProgram) : FALLBACK_HERO_IMAGE}
              alt={
                leadProgram
                  ? `Peserta ${leadProgram.title}`
                  : 'Pemuda berdiskusi dan berkolaborasi'
              }
              width="1200"
              height="1400"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#071f32]/75 via-transparent to-[#071f32]/10"
              aria-hidden="true"
            />
            <div className="absolute right-0 top-0 border-b border-l border-white/25 bg-[#071f32]/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">
              Program unggulan / 01
            </div>

            <article className="absolute inset-x-0 bottom-0 border-t border-[#cfcac0] bg-[#f7f4ed] p-5 text-[#071f32] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#071f32]/15 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
                  {leadProgram
                    ? mapRegistrationStatus(leadProgram.registration_status)
                    : 'Program pilihan'}
                </span>
                <span className="text-xs font-bold text-[#52626c]">
                  {leadProgram
                    ? mapDeliveryMode(leadProgram.delivery_mode)
                    : 'Daring & tatap muka'}
                </span>
              </div>

              <h2 className="mt-4 max-w-xl text-xl font-bold leading-tight sm:text-2xl">
                {leadProgram?.title ?? 'Akademi Kepemimpinan Muda'}
              </h2>

              <div className="mt-4 grid gap-2.5 text-xs text-[#52626c] sm:grid-cols-2">
                <span className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-[#007d6f]" aria-hidden="true" />
                  {leadProgram
                    ? formatDateRange(leadProgram.start_date, leadProgram.end_date)
                    : 'Jadwal segera hadir'}
                </span>
                <span className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#007d6f]" aria-hidden="true" />
                  {leadProgram?.location ?? 'Berbagai kota di Indonesia'}
                </span>
              </div>

              <Link
                to={leadProgram ? `/program/${leadProgram.slug}` : '/program'}
                className="group mt-5 inline-flex items-center gap-3 text-sm font-extrabold text-[#071f32]"
              >
                Buka detail
                <span className="h-px w-8 bg-[#071f32] transition-all group-hover:w-12" aria-hidden="true" />
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="site-gutter border-b border-[#cfcac0] bg-[#f7f4ed]">
        <div className="grid lg:grid-cols-[.7fr_repeat(3,1fr)]">
          <div className="flex items-center border-b border-[#cfcac0] py-9 lg:border-b-0 lg:border-r lg:pr-10">
            <p className="max-w-[190px] text-sm font-bold leading-6 text-[#071f32]">
              Kenapa platform ini perlu ada.
            </p>
          </div>
          {VALUE_POINTS.map(({ index, title, description }) => (
            <article
              key={title}
              className="grid grid-cols-[auto_1fr] gap-5 border-b border-[#cfcac0] py-8 lg:border-b-0 lg:border-r lg:px-8 last:border-0"
            >
              <span className="pt-0.5 text-xs font-extrabold text-[#007d6f]">{index}</span>
              <div>
                <h2 className="text-sm font-extrabold text-[#071f32]">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-[#617078]">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-gutter py-20 sm:py-24">
        <div className="grid gap-8 border-t border-[#a9aaa4] pt-6 lg:grid-cols-[.55fr_1.45fr]">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
            02 / Pilihan minggu ini
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[clamp(2.5rem,4.2vw,4.8rem)] font-bold leading-[0.97] tracking-[-0.05em] text-[#071f32]">
                Mulai dari program yang benar-benar relevan.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#617078] sm:text-base">
                Bandingkan tujuan, jadwal, syarat, dan format pelaksanaan sebelum kamu
                mengambil langkah.
              </p>
            </div>
            <Link
              to="/program"
              className="group inline-flex shrink-0 items-center gap-3 border-b border-[#071f32] py-2 text-sm font-extrabold text-[#071f32]"
            >
              Semua program
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="mt-14">
          {isLoading ? (
            <div className="grid gap-x-7 gap-y-12 md:grid-cols-3" aria-label="Memuat program">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-[520px] animate-pulse border-t-2 border-[#cfcac0] bg-[#ebe7df]" />
              ))}
            </div>
          ) : hasError ? (
            <ErrorState
              message="Program belum dapat dimuat. Silakan coba kembali."
              onRetry={loadHomeData}
            />
          ) : featuredPrograms.length > 0 ? (
            <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {featuredPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <div className="border-y border-[#cfcac0] py-14 text-sm text-[#617078]">
              Belum ada program pilihan yang dipublikasikan.
            </div>
          )}
        </div>
      </section>

      <section className="grid bg-[#007d6f] text-white lg:grid-cols-2">
        <div className="relative min-h-[460px] lg:min-h-[680px]">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85"
            alt="Sekelompok pemuda membangun jejaring dan berkolaborasi"
            width="1400"
            height="1100"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#071f32]/12" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 bg-[#d8f05c] px-6 py-5 text-[#071f32] sm:px-8">
            <p className="text-4xl font-bold tracking-[-0.05em]">1 ruang.</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em]">
              Banyak kemungkinan.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between px-6 py-16 sm:px-10 lg:px-[clamp(3rem,6vw,7rem)] lg:py-24">
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8f05c]">
            <span className="h-px w-10 bg-[#d8f05c]" aria-hidden="true" />
            03 / Mengapa MudaConnect
          </div>
          <div className="mt-20 lg:mt-32">
            <h2 className="text-[clamp(2.7rem,4.6vw,5.2rem)] font-bold leading-[0.96] tracking-[-0.05em]">
              Informasi yang tersebar tidak seharusnya menahan potensimu.
            </h2>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/72">
              Kami menyusun peluang agar mudah dibandingkan dan dipahami—tanpa janji
              berlebihan, tanpa menyamarkan syarat, dan tanpa mengambil alih keputusanmu.
            </p>
            <Link
              to="/tentang"
              className="group mt-9 inline-flex items-center gap-4 border-b border-white/55 py-3 text-sm font-extrabold"
            >
              Cara kami bekerja
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="site-gutter bg-[#fbfaf6] py-20 sm:py-24">
        <div className="grid gap-8 border-t border-[#cfcac0] pt-6 lg:grid-cols-[.55fr_1.45fr]">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
            04 / Wawasan & kegiatan
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-3xl text-[clamp(2.4rem,4vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.048em] text-[#071f32]">
              Belajar tetap berjalan di luar program.
            </h2>
            <Link
              to="/kegiatan"
              className="group inline-flex shrink-0 items-center gap-3 border-b border-[#071f32] py-2 text-sm font-extrabold text-[#071f32]"
            >
              Semua kegiatan
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-x-7 gap-y-12 md:grid-cols-3">
          {latestContents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>

      <section className="site-gutter border-t border-[#cfcac0] bg-[#f1eee7] py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div className="lg:pr-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              05 / Pertanyaan umum
            </span>
            <h2 className="mt-6 text-[clamp(2.6rem,4.3vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[#071f32]">
              Sebelum kamu melangkah.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#617078]">
              Detail penting seharusnya mudah ditemukan. Kalau belum terjawab, tim kami
              siap membantu.
            </p>
            <Link
              to="/faq"
              className="group mt-8 inline-flex items-center gap-3 border-b border-[#071f32] py-2 text-sm font-extrabold text-[#071f32]"
            >
              Buka pusat bantuan
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="border-y border-[#a9aaa4]">
            <Accordion className="divide-y-0 border-0">
              {popularFaqs.slice(0, 4).map((faq) => (
                <AccordionItem key={faq.id} title={faq.question}>
                  {faq.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};
