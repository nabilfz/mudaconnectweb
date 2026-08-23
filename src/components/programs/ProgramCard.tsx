import React from 'react';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import type { Program } from '../../types';
import { mapDeliveryMode, mapRegistrationStatus } from '../../utils/enumMappers';
import { formatDateRange } from '../../utils/formatters';
import { getProgramImage } from '../../utils/programImages';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80';

export interface ProgramCardProps {
  program: Program;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => (
  <article className="h-full">
    <Link
      to={`/program/${program.slug}`}
      className="group flex h-full flex-col border-t-2 border-[#071f32] bg-transparent transition-colors duration-300 hover:border-[#007d6f]"
      aria-label={`Lihat detail program ${program.title}`}
    >
      <div className="relative mt-4 aspect-[4/3] overflow-hidden bg-[#e7e3db]">
        <img
          src={getProgramImage(program)}
          alt=""
          width="900"
          height="560"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover saturate-[.88] transition-all duration-500 group-hover:scale-[1.025] group-hover:saturate-100"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#071f32]/45 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="bg-[#fbfaf6] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#071f32]">
            {program.category}
          </span>
          <span className="bg-[#071f32] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            {mapDeliveryMode(program.delivery_mode)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <span className="w-fit text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#007d6f]">
          {mapRegistrationStatus(program.registration_status)}
        </span>

        <h3 className="mt-4 text-2xl font-bold leading-[1.08] text-[#071f32] transition-colors group-hover:text-[#007d6f]">
          {program.title}
        </h3>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#617078]">
          {program.short_description}
        </p>

        <div className="mt-6 space-y-2.5 border-t border-[#cfcac0] pt-4 text-xs text-[#617078]">
          <span className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#007d6f]" aria-hidden="true" />
            {formatDateRange(program.start_date, program.end_date)}
          </span>
          <span className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#007d6f]" aria-hidden="true" />
            <span className="line-clamp-1">
              {program.location || 'Lokasi belum dipublikasikan'}
            </span>
          </span>
        </div>

        <span className="mt-auto flex items-center justify-between pt-6 text-sm font-extrabold text-[#071f32]">
          Lihat detail
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  </article>
);
