import React from 'react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router';
import type { ContentItem } from '../../types';
import { mapContentType } from '../../utils/enumMappers';
import { formatDateIndonesian } from '../../utils/formatters';
import { getContentImage } from '../../utils/programImages';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80';

export interface ContentCardProps {
  content: ContentItem;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content }) => (
  <article className="h-full">
    <Link
      to={`/kegiatan/${content.slug}`}
      className="group flex h-full flex-col border-t-2 border-[#071f32] bg-transparent transition-colors duration-300 hover:border-[#007d6f]"
      aria-label={`Baca ${content.title}`}
    >
      <div className="relative mt-4 aspect-[4/3] overflow-hidden bg-[#e7e3db]">
        <img
          src={getContentImage(content)}
          alt={content.alt_text || ''}
          width="900"
          height="560"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover saturate-[.88] transition-all duration-500 group-hover:scale-[1.025] group-hover:saturate-100"
        />
        <span className="absolute left-3 top-3 bg-[#fbfaf6] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#071f32]">
          {mapContentType(content.content_type)}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <span className="flex items-center gap-2 text-xs font-semibold text-[#617078]">
          <CalendarDays className="h-4 w-4 text-[#007d6f]" aria-hidden="true" />
          {formatDateIndonesian(content.created_at)}
        </span>
        <h3 className="mt-4 text-2xl font-bold leading-[1.08] text-[#071f32] transition-colors group-hover:text-[#007d6f]">
          {content.title}
        </h3>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#617078]">
          {content.excerpt}
        </p>
        <span className="mt-auto flex items-center justify-between border-t border-[#cfcac0] pt-5 text-sm font-extrabold text-[#071f32]">
          Baca selengkapnya
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  </article>
);
