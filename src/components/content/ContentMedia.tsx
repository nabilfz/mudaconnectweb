import { ExternalLink, Headphones, PlaySquare } from 'lucide-react';
import type { ContentItem } from '../../types';
import { getContentImage } from '../../utils/programImages';

export interface ContentMediaProps {
  content: ContentItem;
}

export function ContentMedia({ content }: ContentMediaProps) {
  const image = getContentImage(content);
  const mediaUrl = content.media_path?.trim() || '';
  const captionUrl = content.caption_path?.trim() || '';
  const isAudio = content.content_type === 'audio';
  const isVideo = content.content_type === 'video';

  if (isAudio) {
    return (
      <section className="grid border-b border-[#cfcac0] bg-[#071f32] text-white lg:grid-cols-[42%_58%]">
        <figure className="relative min-h-[320px] overflow-hidden bg-[#214657] sm:min-h-[420px]">
          <img
            src={image}
            alt={content.alt_text || `Sampul audio ${content.title}`}
            width="1200"
            height="900"
            className="absolute inset-0 h-full w-full object-cover saturate-[.86]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#071f32]/75 via-transparent to-transparent"
            aria-hidden="true"
          />
          <figcaption className="absolute bottom-5 left-5 right-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75 sm:bottom-7 sm:left-7">
            Sampul audio / MudaConnect
          </figcaption>
        </figure>
        <div className="site-gutter flex flex-col justify-center py-12 sm:py-16">
          <span className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
            <Headphones className="h-4 w-4" aria-hidden="true" />
            Pemutar audio
          </span>
          <h2 className="mt-6 max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">
            Dengarkan langsung dari halaman ini.
          </h2>
          {mediaUrl ? (
            <>
              <audio
                className="mt-8 w-full max-w-3xl"
                controls
                preload="metadata"
                src={mediaUrl}
              >
                {captionUrl && (
                  <track kind="captions" src={captionUrl} srcLang="id" label="Bahasa Indonesia" />
                )}
                Browser kamu belum mendukung pemutar audio.
              </audio>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-fit items-center gap-2 border-b border-white/40 pb-1 text-xs font-bold text-white/70 hover:border-[#d8f05c] hover:text-[#d8f05c]"
              >
                Buka audio di tab baru
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </>
          ) : (
            <p className="mt-7 text-sm leading-7 text-white/60">
              Berkas audio belum tersedia. Ringkasan episode tetap dapat dibaca di
              bawah.
            </p>
          )}
          <p className="mt-7 max-w-2xl border-l-2 border-[#d8f05c] pl-4 text-xs leading-6 text-white/55">
            {content.transcript
              ? 'Transkrip pendamping tersedia pada bagian isi publikasi.'
              : 'Ringkasan pendamping tersedia pada bagian isi publikasi.'}
          </p>
        </div>
      </section>
    );
  }

  if (isVideo) {
    return (
      <section className="border-b border-[#cfcac0] bg-[#071f32] px-[var(--page-gutter)] py-10 text-white sm:py-14">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
              <PlaySquare className="h-4 w-4" aria-hidden="true" />
              Pemutar video
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
              Ringkasan tersedia di bawah
            </span>
          </div>
          {mediaUrl ? (
            <video
              className="aspect-video w-full bg-black object-contain shadow-[0_30px_80px_rgba(0,0,0,.28)]"
              controls
              preload="metadata"
              poster={image}
              src={mediaUrl}
              aria-describedby={!captionUrl ? 'video-caption-notice' : undefined}
            >
              {captionUrl && (
                <track
                  default
                  kind="captions"
                  src={captionUrl}
                  srcLang="id"
                  label="Bahasa Indonesia"
                />
              )}
              Browser kamu belum mendukung pemutar video.
            </video>
          ) : (
            <div className="relative aspect-video overflow-hidden bg-[#214657]">
              <img
                src={image}
                alt={content.alt_text || content.title}
                className="h-full w-full object-cover opacity-55"
              />
              <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm font-bold">
                Berkas video belum tersedia.
              </p>
            </div>
          )}
          {!captionUrl && mediaUrl && (
            <p
              id="video-caption-notice"
              className="mt-4 border-l-2 border-[#d8f05c] pl-4 text-xs leading-6 text-white/60"
            >
              Takarir sinkron belum tersedia. Gunakan ringkasan
              {content.transcript ? ' dan transkrip' : ''} di bagian berikutnya.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <figure className="relative min-h-[380px] overflow-hidden border-b border-[#cfcac0] bg-[#d9d4ca] sm:min-h-[520px] lg:h-[min(68vh,720px)]">
      <img
        src={content.content_type === 'image' && mediaUrl ? mediaUrl : image}
        alt={content.alt_text || content.title}
        width="1600"
        height="1000"
        className="absolute inset-0 h-full w-full object-cover saturate-[.9]"
      />
      <figcaption className="absolute bottom-0 right-0 max-w-sm bg-[#071f32] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75 sm:px-7">
        Dokumentasi / MudaConnect
      </figcaption>
    </figure>
  );
}
