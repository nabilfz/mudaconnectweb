import type { ReactNode } from 'react';
import { Clock3, FileText } from 'lucide-react';

export interface LegalSection {
  id: string;
  number: string;
  title: string;
  content: ReactNode;
}

export interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  accentTitle: string;
  lead: string;
  lastUpdated: string;
  sections: LegalSection[];
  notice?: ReactNode;
}

export function LegalDocument({
  eyebrow,
  title,
  accentTitle,
  lead,
  lastUpdated,
  sections,
  notice,
}: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-[#f1eee7] text-[#24323d]">
      <header className="site-gutter border-b border-[#cfcac0] bg-[#071f32] py-14 text-white sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[.48fr_1.52fr] lg:gap-16">
          <div>
            <span className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {eyebrow}
            </span>
            <p className="mt-7 flex items-center gap-2 text-xs font-bold text-white/55">
              <Clock3 className="h-4 w-4 text-[#d8f05c]" aria-hidden="true" />
              Diperbarui {lastUpdated}
            </p>
          </div>
          <div>
            <h1 className="max-w-5xl text-[clamp(2.8rem,5vw,6rem)] font-bold leading-[0.92] tracking-[-0.058em]">
              {title}
              <span className="editorial-italic block text-[#d8f05c]">{accentTitle}</span>
            </h1>
            <p className="mt-7 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
              {lead}
            </p>
          </div>
        </div>
      </header>

      <div className="site-gutter grid gap-12 py-14 sm:py-20 lg:grid-cols-[.48fr_1.52fr] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
            Isi dokumen
          </p>
          <nav className="mt-5 border-t border-[#cfcac0]" aria-label="Daftar isi dokumen">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#cfcac0] py-3.5 text-xs font-bold text-[#52626c] transition-colors hover:text-[#007d6f]"
              >
                <span className="text-[#007d6f]">{section.number}</span>
                <span>{section.title}</span>
              </a>
            ))}
          </nav>
          {notice && (
            <div className="mt-7 border-l-2 border-[#007d6f] bg-[#dff3ea] p-5 text-xs leading-6 text-[#52626c]">
              {notice}
            </div>
          )}
        </aside>

        <article className="border-t border-[#9fa29d]">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-b border-[#cfcac0] py-8 sm:py-10"
            >
              <div className="grid gap-5 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-8">
                <span className="text-sm font-extrabold text-[#007d6f]">
                  {section.number}
                </span>
                <div>
                  <h2 className="text-2xl font-bold leading-tight text-[#071f32] sm:text-3xl">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-4 text-sm leading-7 text-[#52626c] sm:text-base sm:leading-8">
                    {section.content}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
