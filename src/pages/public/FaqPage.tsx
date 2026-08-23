import React, { useState, useEffect, useMemo } from 'react';
import { getPublishedFaqs } from '../../services/supabase/faqs';
import { FAQ } from '../../types';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Search, HelpCircle, MessageSquare, X, Mail } from 'lucide-react';
import { Link } from 'react-router';

const FAQ_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'Umum', label: 'Umum' },
  { id: 'Program', label: 'Program' },
  { id: 'Pendaftaran', label: 'Pendaftaran' },
  { id: 'Persyaratan', label: 'Persyaratan' },
  { id: 'Jadwal', label: 'Jadwal' },
  { id: 'Biaya', label: 'Biaya' },
  { id: 'Sertifikat', label: 'Sertifikat' },
  { id: 'Kontak', label: 'Kontak' },
];

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadFaqs = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await getPublishedFaqs();
      setFaqs(data);
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchSearch =
        search === '' ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase()) ||
        f.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCategory === 'all' || f.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [faqs, search, selectedCategory]);

  const handleOpenMudaBot = () => {
    const chatBtn = document.querySelector('button[aria-label="Buka MudaBot"]') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  };

  return (
    <div className="grid min-h-[calc(100svh-72px)] bg-[#f1eee7] font-sans text-[#24323d] lg:grid-cols-[40%_60%]">
      <aside className="hero-copy bg-[#071f32] py-12 text-white sm:py-16 lg:sticky lg:top-[72px] lg:h-[calc(100svh-72px)] lg:overflow-y-auto">
        <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#d8f05c]">
          <span className="h-px w-10 bg-[#d8f05c]" aria-hidden="true" />
          Pusat FAQ / 01
        </div>
        <h1 className="mt-7 text-[clamp(3rem,4.5vw,5.4rem)] font-bold leading-[0.93] tracking-[-0.055em]">
          Jawaban sebelum kamu
          <span className="editorial-italic block text-[#d8f05c]">melangkah.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-white/68">
          Cari informasi tentang pendaftaran, persyaratan, jadwal, biaya, dan
          penggunaan platform.
        </p>

        <div className="mt-9 border-y border-white/25 py-6">
          <Input
            placeholder="Cari biaya, sertifikat, atau jadwal..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leftIcon={<Search className="h-4 w-4 text-[#617078]" />}
            className="rounded-none border-white/20 bg-white text-[#071f32]"
            rightIcon={
              search ? (
                <button type="button" onClick={() => setSearch('')} className="p-1" aria-label="Hapus pencarian">
                  <X className="h-4 w-4 text-[#617078]" aria-hidden="true" />
                </button>
              ) : undefined
            }
          />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {FAQ_CATEGORIES.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`min-h-9 border px-3 text-xs font-bold transition-colors ${
                  selectedCategory === category.id
                    ? 'border-[#d8f05c] bg-[#d8f05c] text-[#071f32]'
                    : 'border-white/25 text-white/70 hover:border-white/60 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/50">
            Belum menemukan jawaban?
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="accent"
              size="sm"
              leftIcon={<MessageSquare className="h-4 w-4" />}
              onClick={handleOpenMudaBot}
            >
              Tanya MudaBot
            </Button>
            <Button asChild variant="secondary" size="sm" leftIcon={<Mail className="h-4 w-4" />}>
              <Link to="/kontak" className="border-white/35 text-white hover:bg-white/10">
                Hubungi pengelola
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <section className="site-gutter bg-[#fbfaf6] py-12 sm:py-16">
        <div className="flex items-end justify-between gap-6 border-t border-[#9fa29d] pt-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              02 / Basis pengetahuan
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,3.3vw,4rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
              Pertanyaan yang sering muncul.
            </h2>
          </div>
          <span className="hidden text-5xl font-bold text-[#cfcac0] sm:block">
            {String(filteredFaqs.length).padStart(2, '0')}
          </span>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-[#e7e3db]" />
              <div className="h-16 bg-[#e7e3db]" />
              <div className="h-16 bg-[#e7e3db]" />
            </div>
          ) : hasError ? (
            <ErrorState onRetry={loadFaqs} />
          ) : filteredFaqs.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="h-8 w-8 text-[#617078]" />}
              title="Pertanyaan tidak ditemukan"
              description="Pertanyaan tersebut belum tersedia dalam basis pengetahuan FAQ kami."
              actionLabel="Tanya MudaBot"
              onAction={handleOpenMudaBot}
            />
          ) : (
            <Accordion className="border-t-0">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  defaultOpen={index === 0}
                  title={
                    <span className="grid grid-cols-[2.25rem_1fr] gap-3">
                      <span className="text-xs font-extrabold text-[#007d6f]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{faq.question}</span>
                    </span>
                  }
                >
                  <div className="ml-[3rem] space-y-3">
                    <p className="text-sm leading-7 text-[#52626c]">{faq.answer}</p>
                    <div className="border-t border-[#cfcac0] pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#617078]">
                      Kategori / <strong className="text-[#071f32]">{faq.category}</strong>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </div>
  );
};
