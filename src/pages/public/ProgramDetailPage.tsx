import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getProgramBySlug, getPublishedPrograms } from '../../services/supabase/programs';
import { getPublishedFaqs } from '../../services/supabase/faqs';
import { Program, FAQ } from '../../types';
import { Button } from '../../components/ui/Button';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDateRange } from '../../utils/formatters';
import { mapRegistrationStatus, mapDeliveryMode } from '../../utils/enumMappers';
import { getProgramImage } from '../../utils/programImages';
import { Seo } from '../../components/seo/Seo';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Users,
} from 'lucide-react';

export const ProgramDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<Program[]>([]);
  const [relatedFaqs, setRelatedFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!slug) return;
      setIsLoading(true);
      setHasError(false);

      try {
        const prog = await getProgramBySlug(slug);
        setProgram(prog);

        if (prog) {
          const [allProgs, allFaqs] = await Promise.all([
            getPublishedPrograms(),
            getPublishedFaqs(),
          ]);

          setRelatedPrograms(
            allProgs
              .filter((item) => item.id !== prog.id && item.category === prog.category)
              .slice(0, 3)
          );
          setRelatedFaqs(
            allFaqs
              .filter((item) => item.program_id === prog.id || item.category === 'Program')
              .slice(0, 4)
          );
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
      <div className="min-h-screen bg-[#f1eee7]">
        <div className="site-gutter grid animate-pulse gap-8 py-12 lg:grid-cols-2">
          <div className="min-h-[420px] bg-[#d9d4ca]" />
          <div className="space-y-6 py-6">
            <div className="h-3 w-36 bg-[#cfcac0]" />
            <div className="h-16 w-full bg-[#d9d4ca]" />
            <div className="h-5 w-4/5 bg-[#e2ded6]" />
            <div className="h-32 w-full bg-[#e2ded6]" />
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !program) {
    return (
      <div className="site-gutter min-h-[70vh] bg-[#f1eee7] py-16 font-sans">
        <ErrorState
          title="Program Tidak Ditemukan"
          message="Program yang kamu cari tidak ditemukan atau telah diarsipkan."
        />
        <div className="mt-6">
          <Button asChild variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/program">Kembali ke indeks program</Link>
          </Button>
        </div>
      </div>
    );
  }

  const detailItems = [
    {
      label: 'Jadwal',
      value: formatDateRange(program.start_date, program.end_date),
      icon: Calendar,
    },
    {
      label: 'Lokasi & format',
      value: `${program.location || 'Lokasi akan diinformasikan'} · ${mapDeliveryMode(program.delivery_mode)}`,
      icon: MapPin,
    },
    ...(program.fee_information
      ? [{ label: 'Biaya', value: program.fee_information, icon: CreditCard }]
      : []),
    ...(program.contact_information
      ? [{ label: 'Kontak', value: program.contact_information, icon: Mail }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f1eee7] font-sans text-[#24323d]">
      <Seo
        title={program.title}
        description={program.short_description}
        path={`/program/${program.slug}`}
        image={getProgramImage(program)}
      />
      <nav
        className="site-gutter flex min-h-12 items-center gap-2 overflow-hidden border-b border-[#cfcac0] bg-[#fbfaf6] text-[11px] font-bold text-[#617078]"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="shrink-0 transition-colors hover:text-[#007d6f]">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9fa29d]" aria-hidden="true" />
        <Link to="/program" className="shrink-0 transition-colors hover:text-[#007d6f]">
          Program
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9fa29d]" aria-hidden="true" />
        <span className="truncate text-[#071f32]">{program.title}</span>
      </nav>

      <section className="grid border-b border-[#cfcac0] lg:min-h-[680px] lg:grid-cols-[48%_52%]">
        <div className="relative min-h-[420px] overflow-hidden bg-[#d9d4ca] lg:min-h-0">
          <img
            src={getProgramImage(program)}
            alt={program.title}
            className="absolute inset-0 h-full w-full object-cover saturate-[.9]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#071f32]/55 via-transparent to-transparent"
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-white sm:p-7">
            <span>Program / {program.category}</span>
            <span>{mapDeliveryMode(program.delivery_mode)}</span>
          </div>
        </div>

        <div className="hero-copy flex flex-col justify-center bg-[#071f32] py-12 text-white sm:py-16 lg:py-20">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
            <span>{mapRegistrationStatus(program.registration_status)}</span>
            <span className="h-px w-8 bg-[#d8f05c]" aria-hidden="true" />
            <span>{program.category}</span>
          </div>

          <h1 className="mt-7 text-[clamp(3rem,5.2vw,6.6rem)] font-bold leading-[0.9] tracking-[-0.06em] text-white">
            {program.title}
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            {program.short_description}
          </p>

          <dl className="mt-9 grid border-y border-white/24 sm:grid-cols-2">
            {detailItems.map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`py-5 ${
                  index < detailItems.length - 1 ? 'border-b border-white/18' : ''
                } ${
                  index % 2 === 0
                    ? 'sm:border-r sm:border-white/18 sm:pr-5'
                    : 'sm:pl-5'
                } ${index >= detailItems.length - 2 ? 'sm:border-b-0' : ''}`}
              >
                <dt className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#d8f05c]">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-2 text-xs leading-6 text-white/75">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to={`/minat?program=${program.id}`}
              className="inline-flex min-h-12 items-center gap-3 bg-[#d8f05c] px-6 text-sm font-extrabold text-[#071f32] transition-colors hover:bg-white"
            >
              Isi form minat <Send className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="inline-flex min-h-12 items-center gap-3 border border-white/35 px-6 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10"
              onClick={() => {
                const chatButton = document.querySelector(
                  'button[aria-label="Buka MudaBot"]'
                ) as HTMLButtonElement;
                chatButton?.click();
              }}
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Tanya MudaBot
            </button>
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
            Form minat bukan konfirmasi penerimaan peserta.
          </p>
        </div>
      </section>

      <section className="site-gutter py-16 sm:py-20">
        <div className="grid gap-10 border-t border-[#9fa29d] pt-6 lg:grid-cols-[.44fr_1.56fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              01 / Ringkasan
            </span>
            <div className="mt-8 border-y border-[#cfcac0] py-6">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#007d6f]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#071f32]">
                    Untuk siapa
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#617078]">
                    {program.target_audience || 'Informasi peserta akan segera dipublikasikan.'}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <h2 className="text-[clamp(2.5rem,4.3vw,5rem)] font-bold leading-[0.96] tracking-[-0.052em] text-[#071f32]">
              Tentang program
              <span className="editorial-italic block text-[#007d6f]">dan hasil yang dituju.</span>
            </h2>
            <div className="mt-8 max-w-5xl whitespace-pre-line text-base leading-8 text-[#52626c]">
              {program.description || 'Informasi lengkap program akan segera dipublikasikan.'}
            </div>

            <div className="mt-12 grid border-y border-[#cfcac0] md:grid-cols-2">
              <section className="border-b border-[#cfcac0] py-8 md:border-b-0 md:border-r md:pr-9">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#007d6f]">
                  Tujuan / {String(program.objectives?.length || 0).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-2xl font-bold leading-tight text-[#071f32]">
                  Kompetensi yang dibangun
                </h3>
                {program.objectives?.length ? (
                  <ul className="mt-6 divide-y divide-[#cfcac0]">
                    {program.objectives.map((objective) => (
                      <li key={objective} className="flex gap-3 py-4 text-sm leading-6 text-[#52626c]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#007d6f]" aria-hidden="true" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-[#617078]">Informasi akan segera hadir.</p>
                )}
              </section>

              <section className="py-8 md:pl-9">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#007d6f]">
                  Manfaat / {String(program.benefits?.length || 0).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-2xl font-bold leading-tight text-[#071f32]">
                  Bekal yang kamu bawa pulang
                </h3>
                {program.benefits?.length ? (
                  <ul className="mt-6 divide-y divide-[#cfcac0]">
                    {program.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3 py-4 text-sm leading-6 text-[#52626c]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#007d6f]" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-[#617078]">Informasi akan segera hadir.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>

      <section className="site-gutter border-y border-[#cfcac0] bg-[#fbfaf6] py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.44fr_1.56fr] lg:gap-16">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              02 / Persyaratan
            </span>
            <h2 className="mt-5 text-[clamp(2.2rem,3.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
              Cek kesiapanmu sebelum mengisi minat.
            </h2>
          </div>

          <div className="border-b border-[#cfcac0]">
            {program.requirements?.length ? (
              program.requirements.map((requirement, index) => (
                <div
                  key={requirement}
                  className="grid gap-4 border-t border-[#cfcac0] py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start"
                >
                  <span className="text-xs font-extrabold text-[#007d6f]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm leading-7 text-[#52626c]">{requirement}</p>
                </div>
              ))
            ) : (
              <p className="border-t border-[#cfcac0] py-6 text-sm text-[#617078]">
                Persyaratan akan segera dipublikasikan.
              </p>
            )}
          </div>
        </div>
      </section>

      {relatedFaqs.length > 0 && (
        <section className="site-gutter py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[.44fr_1.56fr] lg:gap-16">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
                03 / Tanya jawab
              </span>
              <h2 className="mt-5 text-[clamp(2.2rem,3.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
                Hal yang biasanya ditanyakan peserta.
              </h2>
            </div>
            <Accordion className="border-t border-[#9fa29d]">
              {relatedFaqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  title={
                    <span className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                      <span className="text-[#007d6f]">{String(index + 1).padStart(2, '0')}</span>
                      <span>{faq.question}</span>
                    </span>
                  }
                >
                  <div className="pl-11">{faq.answer}</div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {relatedPrograms.length > 0 && (
        <section className="site-gutter border-t border-[#cfcac0] bg-[#071f32] py-16 text-white sm:py-20">
          <div className="grid gap-6 border-t border-white/30 pt-6 lg:grid-cols-[.44fr_1.56fr] lg:gap-16">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
              04 / Program sejenis
            </span>
            <h2 className="text-[clamp(2.35rem,3.8vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.05em]">
              Pilihan lain untuk
              <span className="editorial-italic block text-[#d8f05c]">kamu pertimbangkan.</span>
            </h2>
          </div>

          <div className="mt-12 border-b border-white/25">
            {relatedPrograms.map((item, index) => (
              <article
                key={item.id}
                className="grid gap-4 border-t border-white/25 py-6 transition-colors hover:bg-white/[0.04] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:px-3"
              >
                <span className="text-xs font-extrabold text-[#d8f05c]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/55">
                    {item.category} · {mapDeliveryMode(item.delivery_mode)}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                    <Link to={`/program/${item.slug}`} className="transition-colors hover:text-[#d8f05c]">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
                    {item.short_description}
                  </p>
                </div>
                <Link
                  to={`/program/${item.slug}`}
                  className="inline-flex min-h-11 w-fit items-center gap-3 border border-white/35 px-5 text-xs font-extrabold uppercase tracking-[0.1em] transition-colors hover:border-[#d8f05c] hover:text-[#d8f05c]"
                >
                  Buka detail <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
