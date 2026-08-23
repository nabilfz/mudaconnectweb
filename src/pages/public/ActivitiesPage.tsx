import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { getPublishedContents } from '../../services/supabase/contents';
import { ContentItem } from '../../types';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Layers, ArrowRight } from 'lucide-react';
import { mapContentType } from '../../utils/enumMappers';
import { formatDateIndonesian } from '../../utils/formatters';
import { getContentImage } from '../../utils/programImages';

const TYPE_FILTERS = [
  { id: 'all', label: 'Semua Konten' },
  { id: 'article', label: 'Artikel' },
  { id: 'campaign', label: 'Kampanye' },
  { id: 'image', label: 'Foto / Galeri' },
  { id: 'audio', label: 'Audio / Podcast' },
  { id: 'video', label: 'Video' },
  { id: 'activity', label: 'Kegiatan' },
];

export const ActivitiesPage: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadContents = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await getPublishedContents();
      setContents(data);
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const filteredContents = useMemo(() => {
    if (selectedType === 'all') return contents;
    return contents.filter((c) => c.content_type === selectedType);
  }, [contents, selectedType]);

  const leadStory = filteredContents[0];
  const archiveList = filteredContents.slice(1);

  return (
    <div className="min-h-screen bg-[#f1eee7] font-sans text-[#24323d]">
      <section className="site-gutter border-b border-[#cfcac0] py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-16">
          <div>
            <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#007d6f]">
              <span className="h-px w-10 bg-[#007d6f]" aria-hidden="true" />
              Arsip publikasi / 01
            </div>
            <h1 className="mt-7 text-[clamp(3rem,5.3vw,6.3rem)] font-bold leading-[0.92] tracking-[-0.058em] text-[#071f32]">
              Cerita dari mereka
              <span className="editorial-italic block text-[#007d6f]">yang sudah bergerak.</span>
            </h1>
          </div>
          <div>
            <p className="max-w-xl text-sm leading-7 text-[#617078] sm:text-base">
              Artikel edukatif, liputan kampanye, podcast, dan dokumentasi kegiatan
              pemuda dari berbagai daerah.
            </p>
            <div className="mt-7 flex items-center gap-0 overflow-x-auto border-y border-[#9fa29d]">
              {TYPE_FILTERS.map((filter) => {
                const isActive = selectedType === filter.id;
                return (
                  <button
                    type="button"
                    key={filter.id}
                    onClick={() => setSelectedType(filter.id)}
                    className={`min-h-11 whitespace-nowrap border-r border-[#cfcac0] px-4 text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#071f32] text-white'
                        : 'bg-transparent text-[#52626c] hover:bg-[#fbfaf6] hover:text-[#071f32]'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
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
          <ErrorState onRetry={loadContents} />
        </section>
      ) : filteredContents.length === 0 ? (
        <section className="site-gutter py-16">
          <EmptyState
            icon={<Layers className="h-8 w-8 text-[#617078]" />}
            title="Konten belum tersedia"
            description="Belum ada publikasi untuk kategori yang kamu pilih."
            actionLabel="Tampilkan semua konten"
            onAction={() => setSelectedType('all')}
          />
        </section>
      ) : (
        <>
          {leadStory && (
            <section className="grid border-b border-[#cfcac0] lg:min-h-[520px] lg:grid-cols-[62%_38%]">
              <div className="relative min-h-[340px] overflow-hidden bg-[#d9d4ca] lg:min-h-0">
                <img
                  src={getContentImage(leadStory)}
                  alt={leadStory.alt_text || leadStory.title}
                  className="absolute inset-0 h-full w-full object-cover saturate-[.9]"
                />
                <span className="absolute left-0 top-0 bg-[#fbfaf6] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#071f32]">
                  Liputan utama / 01
                </span>
              </div>
              <article className="hero-copy flex flex-col justify-center bg-[#007d6f] py-12 text-white lg:py-16">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#d8f05c]">
                  <span>{mapContentType(leadStory.content_type)}</span>
                  <span className="h-1 w-1 bg-[#d8f05c]" aria-hidden="true" />
                  <span>{formatDateIndonesian(leadStory.created_at)}</span>
                </div>
                <h2 className="mt-7 text-[clamp(2.35rem,3.6vw,4.4rem)] font-bold leading-[0.98] tracking-[-0.052em]">
                  <Link to={`/kegiatan/${leadStory.slug}`} className="transition-colors hover:text-[#d8f05c]">
                    {leadStory.title}
                  </Link>
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/72">
                  {leadStory.excerpt}
                </p>
                <Link
                  to={`/kegiatan/${leadStory.slug}`}
                  className="mt-8 inline-flex min-h-11 w-fit items-center gap-3 bg-[#d8f05c] px-5 text-sm font-extrabold text-[#071f32] transition-colors hover:bg-white"
                >
                  Baca selengkapnya <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            </section>
          )}

          {archiveList.length > 0 && (
            <section className="site-gutter py-16 sm:py-20">
              <div className="grid gap-6 border-t border-[#9fa29d] pt-6 lg:grid-cols-[.55fr_1.45fr]">
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
                  02 / Arsip terbaru
                </span>
                <h2 className="text-[clamp(2.2rem,3.6vw,4.2rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
                  Publikasi lain untuk dibaca.
                </h2>
              </div>

              <div className="mt-12 border-b border-[#cfcac0]">
                {archiveList.map((item, index) => (
                  <article
                    key={item.id}
                    className="grid gap-5 border-t border-[#cfcac0] py-6 transition-colors hover:bg-[#fbfaf6] md:grid-cols-[3rem_10rem_minmax(0,1fr)] md:px-4 xl:grid-cols-[3rem_12rem_minmax(0,1fr)_12rem] xl:items-center"
                  >
                    <span className="text-xs font-extrabold text-[#007d6f]">
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <img
                      src={getContentImage(item)}
                      alt=""
                      className="h-28 w-full object-cover saturate-[.9] md:h-24"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#007d6f]">
                        <span>{mapContentType(item.content_type)}</span>
                        <span className="h-1 w-1 bg-[#007d6f]" aria-hidden="true" />
                        <span>{formatDateIndonesian(item.created_at)}</span>
                      </div>
                      <h3 className="mt-2 text-xl font-bold leading-tight text-[#071f32] sm:text-2xl">
                        <Link to={`/kegiatan/${item.slug}`} className="transition-colors hover:text-[#007d6f]">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#617078]">
                        {item.excerpt}
                      </p>
                    </div>
                    <Link
                      to={`/kegiatan/${item.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-extrabold text-[#007d6f] xl:justify-end"
                    >
                      Baca artikel <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
