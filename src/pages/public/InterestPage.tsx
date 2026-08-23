import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { getPublishedPrograms } from '../../services/supabase/programs';
import { Program } from '../../types';
import { InterestForm } from '../../components/forms/InterestForm';
import { ErrorState } from '../../components/ui/ErrorState';
import { ShieldCheck } from 'lucide-react';

export const InterestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultProgramId = searchParams.get('program') || '';
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchPrograms = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await getPublishedPrograms();
      setPrograms(data);
    } catch (err) {
      console.warn('Failed to load programs for interest form:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <div className="grid min-h-screen bg-[#f1eee7] font-sans text-[#24323d] lg:grid-cols-[38%_62%]">
      <aside className="hero-copy bg-[#007d6f] py-12 text-white sm:py-16 lg:py-20">
        <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#d8f05c]">
          <span className="h-px w-10 bg-[#d8f05c]" aria-hidden="true" />
          Partisipasi / 01
        </div>
        <h1 className="mt-7 text-[clamp(3rem,4.6vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.057em]">
          Mulai dengan
          <span className="editorial-italic block text-[#d8f05c]">menyatakan minat.</span>
        </h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
          Pilih program dan ceritakan alasanmu. Informasi ini membantu pengelola
          memahami minat awal sebelum proses berikutnya.
        </p>
        <div className="mt-10 border-y border-white/30 py-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#d8f05c]" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">Data ditinjau oleh pengelola.</p>
              <p className="mt-2 text-xs leading-6 text-white/60">
                Formulir ini merupakan pernyataan minat awal dan bukan konfirmasi
                penerimaan resmi.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <section className="site-gutter bg-[#fbfaf6] py-12 sm:py-16 lg:py-20">
        <div className="border-t border-[#9fa29d] pt-6">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
            Formulir / 02
          </span>
          <h2 className="mt-4 text-[clamp(2.3rem,3.7vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
            Lengkapi data minatmu.
          </h2>
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-6 w-1/3 bg-[#e7e3db]" />
            <div className="h-10 w-full bg-[#e7e3db]" />
          </div>
        ) : loadError ? (
          <ErrorState
            className="mt-8"
            title="Daftar program belum dapat dimuat"
            message="Formulir belum ditampilkan agar pilihan program tidak keliru. Periksa koneksi lalu coba lagi."
            onRetry={fetchPrograms}
          />
        ) : (
          <div className="mt-8">
            <InterestForm programs={programs} defaultProgramId={defaultProgramId} />
          </div>
        )}
      </section>
    </div>
  );
};
