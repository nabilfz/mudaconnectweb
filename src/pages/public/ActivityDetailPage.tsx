import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getContentBySlug, getPublishedContents } from '../../services/supabase/contents';
import { ContentItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDateIndonesian } from '../../utils/formatters';
import { mapContentType } from '../../utils/enumMappers';
import { getContentImage } from '../../utils/programImages';
import { ArrowLeft, ArrowRight, Calendar, ChevronRight } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { ContentMedia } from '../../components/content/ContentMedia';

function renderStructuredArticleBody(bodyText: string) {
  if (!bodyText) {
    return <p className="italic text-[#617078]">Informasi akan segera hadir.</p>;
  }

  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8 text-[#52626c]">
      {paragraphs.map((block, blockIndex) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        const numberedLines = lines.filter((line) => /^\d+\.\s+/.test(line));

        if (numberedLines.length > 0) {
          const introLine = lines.find((line) => !/^\d+\.\s+/.test(line));

          return (
            <section key={blockIndex} className="pt-2">
              {introLine && (
                <h2 className="text-2xl font-bold leading-tight text-[#071f32] sm:text-3xl">
                  {introLine}
                </h2>
              )}
              <ol className="mt-7 border-b border-[#cfcac0]">
                {numberedLines.map((numberedLine, itemIndex) => {
                  const lineContent = numberedLine.replace(/^\d+\.\s+/, '');
                  const parts = lineContent.match(/^([^—:-]+)[—:-]\s*(.*)$/);

                  return (
                    <li
                      key={numberedLine}
                      className="grid gap-4 border-t border-[#cfcac0] py-5 sm:grid-cols-[3rem_minmax(0,1fr)]"
                    >
                      <span className="text-xs font-extrabold text-[#007d6f]">
                        {String(itemIndex + 1).padStart(2, '0')}
                      </span>
                      <div>
                        {parts ? (
                          <>
                            <h3 className="text-base font-bold leading-snug text-[#071f32]">
                              {parts[1].trim()}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-[#617078]">
                              {parts[2].trim()}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm leading-7 text-[#52626c]">{lineContent}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        }

        return (
          <p key={blockIndex} className="text-base leading-8 text-[#52626c]">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export const ActivityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!slug) return;
      setIsLoading(true);
      setHasError(false);

      try {
        const item = await getContentBySlug(slug);
        setContent(item);

        if (item) {
          const allItems = await getPublishedContents();
          setRelatedItems(allItems.filter((candidate) => candidate.id !== item.id).slice(0, 3));
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen animate-pulse bg-[#f1eee7]">
        <div className="site-gutter grid gap-8 py-12 lg:grid-cols-[.42fr_1.58fr]">
          <div className="h-4 w-36 bg-[#cfcac0]" />
          <div className="space-y-5">
            <div className="h-16 w-full bg-[#d9d4ca]" />
            <div className="h-5 w-4/5 bg-[#e2ded6]" />
          </div>
        </div>
        <div className="h-[48vh] min-h-[360px] bg-[#d9d4ca]" />
      </div>
    );
  }

  if (hasError || !content) {
    return (
      <div className="site-gutter min-h-[70vh] bg-[#f1eee7] py-16 font-sans">
        <ErrorState
          title="Konten Tidak Ditemukan"
          message="Konten yang kamu cari tidak ditemukan atau telah diarsipkan."
        />
        <div className="mt-6">
          <Button asChild variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/kegiatan">Kembali ke arsip kegiatan</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1eee7] font-sans text-[#24323d]">
      <Seo
        title={content.title}
        description={content.excerpt || 'Publikasi terbaru dari MudaConnect.'}
        path={`/kegiatan/${content.slug}`}
        image={getContentImage(content)}
        type="article"
      />
      <nav
        className="site-gutter flex min-h-12 items-center gap-2 overflow-hidden border-b border-[#cfcac0] bg-[#fbfaf6] text-[11px] font-bold text-[#617078]"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="shrink-0 transition-colors hover:text-[#007d6f]">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9fa29d]" aria-hidden="true" />
        <Link to="/kegiatan" className="shrink-0 transition-colors hover:text-[#007d6f]">
          Kegiatan
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9fa29d]" aria-hidden="true" />
        <span className="truncate text-[#071f32]">{content.title}</span>
      </nav>

      <header className="site-gutter border-b border-[#cfcac0] bg-[#fbfaf6] py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[.42fr_1.58fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              <span>{mapContentType(content.content_type)}</span>
              <span className="h-px w-8 bg-[#007d6f]" aria-hidden="true" />
              <span>Publikasi</span>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs font-bold text-[#617078]">
              <Calendar className="h-4 w-4 text-[#007d6f]" aria-hidden="true" />
              {formatDateIndonesian(content.created_at)}
            </p>
          </div>

          <div>
            <h1 className="text-[clamp(3rem,5.5vw,6.7rem)] font-bold leading-[0.91] tracking-[-0.06em] text-[#071f32]">
              {content.title}
            </h1>
            {content.excerpt && (
              <p className="mt-8 max-w-4xl border-l-2 border-[#007d6f] py-1 pl-5 text-base leading-8 text-[#52626c] sm:text-lg">
                {content.excerpt}
              </p>
            )}
          </div>
        </div>
      </header>

      <ContentMedia content={content} />

      <article className="site-gutter py-16 sm:py-20">
        <div className="grid gap-10 border-t border-[#9fa29d] pt-6 lg:grid-cols-[.42fr_1.58fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              01 / {['audio', 'video'].includes(content.content_type) ? 'Ringkasan pendamping' : 'Isi publikasi'}
            </span>
            <p className="mt-6 max-w-xs text-xs leading-6 text-[#617078]">
              Diterbitkan pada {formatDateIndonesian(content.created_at)} dalam kategori{' '}
              {mapContentType(content.content_type).toLowerCase()}.
            </p>
            <Link
              to="/kegiatan"
              className="mt-8 inline-flex items-center gap-3 border-b border-[#071f32] pb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#071f32] transition-colors hover:border-[#007d6f] hover:text-[#007d6f]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali ke arsip
            </Link>
          </aside>

          <div className="max-w-5xl">
            {renderStructuredArticleBody(content.body)}
            {content.transcript && (
              <section className="mt-12 border-t border-[#cfcac0] pt-8">
                <h2 className="text-2xl font-bold leading-tight text-[#071f32] sm:text-3xl">
                  Transkrip media
                </h2>
                <div className="mt-6 whitespace-pre-wrap text-sm leading-8 text-[#52626c] sm:text-base">
                  {content.transcript}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>

      {relatedItems.length > 0 && (
        <section className="site-gutter border-t border-[#cfcac0] bg-[#007d6f] py-16 text-white sm:py-20">
          <div className="grid gap-6 border-t border-white/35 pt-6 lg:grid-cols-[.42fr_1.58fr] lg:gap-16">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
              02 / Lanjut membaca
            </span>
            <h2 className="text-[clamp(2.35rem,3.8vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.05em]">
              Publikasi lain dari
              <span className="editorial-italic block text-[#d8f05c]">arsip MudaConnect.</span>
            </h2>
          </div>

          <div className="mt-12 border-b border-white/30">
            {relatedItems.map((item, index) => (
              <article
                key={item.id}
                className="grid gap-4 border-t border-white/30 py-6 transition-colors hover:bg-white/[0.05] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:px-3"
              >
                <span className="text-xs font-extrabold text-[#d8f05c]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/58">
                    {mapContentType(item.content_type)} · {formatDateIndonesian(item.created_at)}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                    <Link to={`/kegiatan/${item.slug}`} className="transition-colors hover:text-[#d8f05c]">
                      {item.title}
                    </Link>
                  </h3>
                </div>
                <Link
                  to={`/kegiatan/${item.slug}`}
                  className="inline-flex min-h-11 w-fit items-center gap-3 border border-white/40 px-5 text-xs font-extrabold uppercase tracking-[0.1em] transition-colors hover:border-[#d8f05c] hover:text-[#d8f05c]"
                >
                  Baca <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
