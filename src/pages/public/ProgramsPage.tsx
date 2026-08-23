import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { getPublishedPrograms } from '../../services/supabase/programs';
import { Program } from '../../types';
import { ProgramFilter, ProgramFilterState } from '../../components/programs/ProgramFilter';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { FolderKanban, ArrowRight, Calendar, MapPin, Clock } from 'lucide-react';
import { normalizeDeliveryMode, normalizeRegistrationStatus, mapRegistrationStatus, mapDeliveryMode } from '../../utils/enumMappers';
import { getProgramImage } from '../../utils/programImages';
import { formatDateRange } from '../../utils/formatters';

const ITEMS_PER_PAGE = 8;

export const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filter, setFilter] = useState<ProgramFilterState>({
    search: '',
    category: 'all',
    deliveryMode: 'all',
    registrationStatus: 'all',
  });

  const loadPrograms = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await getPublishedPrograms();
      setPrograms(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    getPublishedPrograms()
      .then((data) => {
        if (isActive) {
          setPrograms(data);
        }
      })
      .catch(() => {
        if (isActive) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch =
        filter.search === '' ||
        p.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        p.short_description.toLowerCase().includes(filter.search.toLowerCase()) ||
        p.location.toLowerCase().includes(filter.search.toLowerCase());

      const matchCategory = filter.category === 'all' || p.category === filter.category;
      const matchDelivery =
        filter.deliveryMode === 'all' || normalizeDeliveryMode(p.delivery_mode) === filter.deliveryMode;
      const matchStatus =
        filter.registrationStatus === 'all' ||
        normalizeRegistrationStatus(p.registration_status) === filter.registrationStatus;

      return matchSearch && matchCategory && matchDelivery && matchStatus;
    });
  }, [programs, filter]);

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);

  const paginatedPrograms = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrograms.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredPrograms, currentPage]);

  const featuredProgram = paginatedPrograms[0];
  const remainingPrograms = paginatedPrograms.slice(1);

  const handleFilterChange = (newFilter: ProgramFilterState) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setFilter({
      search: '',
      category: 'all',
      deliveryMode: 'all',
      registrationStatus: 'all',
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f1eee7] font-sans text-[#24323d]">
      <section className="site-gutter border-b border-[#cfcac0] py-10 sm:py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:gap-14">
          <div>
            <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#007d6f]">
              <span className="h-px w-10 bg-[#007d6f]" aria-hidden="true" />
              Katalog program / 01
            </div>
            <h1 className="mt-6 text-[clamp(3.1rem,4.6vw,5.5rem)] font-bold leading-[0.91] tracking-[-0.058em] text-[#071f32]">
              <span className="block">Peluang untuk</span>
              <span className="block">kamu temukan,</span>
              <span className="editorial-italic block text-[#007d6f]">pilih dengan jelas.</span>
            </h1>
          </div>

          <div className="border-t border-[#9fa29d] pt-5 lg:mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              Cari / bandingkan / tentukan
            </span>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#617078] sm:text-base">
              Bandingkan program kepemimpinan, keterampilan digital, dan kegiatan
              sosial berdasarkan format, status, serta kebutuhanmu.
            </p>
            <div className="mt-6 grid grid-cols-3 border-y border-[#cfcac0] py-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#52626c]">
              <span>01 / Cari</span>
              <span className="border-l border-[#cfcac0] pl-4">02 / Bandingkan</span>
              <span className="border-l border-[#cfcac0] pl-4">03 / Pilih</span>
            </div>
          </div>
        </div>

        <div className="mt-9 lg:mt-11">
          <ProgramFilter
            filter={filter}
            onChange={handleFilterChange}
            onReset={handleResetFilter}
          />
          <div className="mt-3 flex items-center justify-between gap-5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#617078]">
            <span>{filteredPrograms.length} program sesuai pilihan</span>
            {currentPage > 1 ? (
              <span>Halaman {currentPage} / {totalPages}</span>
            ) : (
              <span className="hidden sm:inline">Jadwal · format · status tersedia sejak awal</span>
            )}
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="site-gutter space-y-4 py-16">
          <CardSkeleton />
          <CardSkeleton />
        </section>
      ) : hasError ? (
        <section className="site-gutter py-16">
          <ErrorState onRetry={loadPrograms} />
        </section>
      ) : filteredPrograms.length === 0 ? (
        <section className="site-gutter py-16">
          <EmptyState
            icon={<FolderKanban className="h-8 w-8 text-[#617078]" />}
            title="Program tidak ditemukan"
            description="Tidak ada program yang sesuai dengan kriteria pencarian atau filter yang dipilih."
            actionLabel="Reset filter pencarian"
            onAction={handleResetFilter}
          />
        </section>
      ) : (
        <>
          {currentPage === 1 && featuredProgram && (
            <section className="grid border-b border-[#cfcac0] bg-[#fbfaf6] lg:min-h-[520px] lg:grid-cols-[58%_42%]">
              <div className="relative min-h-[340px] overflow-hidden bg-[#d9d4ca] lg:min-h-0">
                <img
                  src={getProgramImage(featuredProgram)}
                  alt={featuredProgram.title}
                  className="absolute inset-0 h-full w-full object-cover saturate-[.9]"
                />
                <div className="absolute left-0 top-0 bg-[#071f32] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                  Program unggulan / 01
                </div>
              </div>

              <article className="hero-copy flex flex-col justify-center py-12 lg:py-16">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#007d6f]">
                  <span>{featuredProgram.category}</span>
                  <span className="h-1 w-1 bg-[#007d6f]" aria-hidden="true" />
                  <span>{mapDeliveryMode(featuredProgram.delivery_mode)}</span>
                </div>
                <h2 className="mt-6 text-[clamp(2.3rem,3.5vw,4.3rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
                  {featuredProgram.title}
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-[#617078]">
                  {featuredProgram.short_description}
                </p>
                <div className="mt-8 grid gap-3 border-y border-[#cfcac0] py-5 text-xs text-[#52626c] sm:grid-cols-2">
                  <span className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#007d6f]" aria-hidden="true" />
                    {formatDateRange(featuredProgram.start_date, featuredProgram.end_date)}
                  </span>
                  <span className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#007d6f]" aria-hidden="true" />
                    {featuredProgram.location || 'Lokasi belum dipublikasikan'}
                  </span>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
                  <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#071f32]">
                    {mapRegistrationStatus(featuredProgram.registration_status)}
                  </span>
                  <Link
                    to={`/program/${featuredProgram.slug}`}
                    className="inline-flex min-h-11 items-center gap-3 bg-[#007d6f] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#071f32]"
                  >
                    Detail program <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </section>
          )}

          <section className="site-gutter py-16 sm:py-20">
            <div className="grid gap-6 border-t border-[#9fa29d] pt-6 lg:grid-cols-[.55fr_1.45fr]">
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
                02 / Indeks program
              </span>
              <h2 className="text-[clamp(2.2rem,3.6vw,4.2rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
                Program lain untuk dipertimbangkan.
              </h2>
            </div>

            <div className="mt-12 border-b border-[#cfcac0]">
              {(currentPage === 1 ? remainingPrograms : paginatedPrograms).map((program, index) => (
                <article
                  key={program.id}
                  className="grid gap-5 border-t border-[#cfcac0] py-6 transition-colors hover:bg-[#fbfaf6] md:grid-cols-[3rem_9rem_minmax(0,1fr)] md:px-4 xl:grid-cols-[3rem_10rem_minmax(0,1fr)_15rem] xl:items-center"
                >
                  <span className="text-xs font-extrabold text-[#007d6f]">
                    {String(
                      currentPage === 1
                        ? index + 2
                        : (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                    ).padStart(2, '0')}
                  </span>
                  <img
                    src={getProgramImage(program)}
                    alt=""
                    className="h-28 w-full object-cover saturate-[.9] md:h-24"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#007d6f]">
                      <span>{program.category}</span>
                      <span className="h-1 w-1 bg-[#007d6f]" aria-hidden="true" />
                      <span>{mapDeliveryMode(program.delivery_mode)}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold leading-tight text-[#071f32] sm:text-2xl">
                      <Link to={`/program/${program.slug}`} className="transition-colors hover:text-[#007d6f]">
                        {program.title}
                      </Link>
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#617078]">
                      {program.short_description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#cfcac0] pt-4 text-xs xl:block xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
                    <span className="flex items-center gap-2 text-[#52626c]">
                      <Clock className="h-3.5 w-3.5 text-[#007d6f]" aria-hidden="true" />
                      {formatDateRange(program.start_date, program.end_date)}
                    </span>
                    <span className="mt-0 block font-bold text-[#071f32] xl:mt-3">
                      {mapRegistrationStatus(program.registration_status)}
                    </span>
                    <Link
                      to={`/program/${program.slug}`}
                      className="mt-0 inline-flex items-center gap-2 font-extrabold text-[#007d6f] xl:mt-4"
                    >
                      Lihat rincian <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};
