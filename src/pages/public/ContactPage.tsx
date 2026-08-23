import React from 'react';
import { ContactForm } from '../../components/forms/ContactForm';
import { Mail, MessageSquare, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const handleOpenMudaBot = () => {
    const chatBtn = document.querySelector('button[aria-label="Buka MudaBot"]') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  };

  return (
    <div className="grid min-h-[calc(100svh-72px)] bg-[#f1eee7] font-sans text-[#24323d] lg:grid-cols-[42%_58%]">
      <aside className="hero-copy bg-[#071f32] py-12 text-white sm:py-16 lg:py-20">
        <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#d8f05c]">
          <span className="h-px w-10 bg-[#d8f05c]" aria-hidden="true" />
          Layanan kontak / 01
        </div>
        <h1 className="mt-7 text-[clamp(3rem,4.7vw,5.7rem)] font-bold leading-[0.92] tracking-[-0.057em]">
          Bicarakan
          <span className="editorial-italic block text-[#d8f05c]">peluang, ide,</span>
          atau kendala.
        </h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-white/68 sm:text-base">
          Sampaikan pertanyaan program, saran pengembangan, atau potensi kemitraan
          melalui saluran komunikasi resmi.
        </p>

        <div className="mt-10 border-y border-white/25">
          {[
            {
              number: '01',
              title: 'Program & minat',
              description: 'Persyaratan, jadwal, dan status verifikasi minat peserta.',
            },
            {
              number: '02',
              title: 'Kemitraan komunitas',
              description: 'Kolaborasi program, publikasi, dan jejaring pemuda.',
            },
            {
              number: '03',
              title: 'Masukan & akses',
              description: 'Saran platform dan kendala penggunaan formulir digital.',
            },
          ].map((item) => (
            <div key={item.number} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/20 py-5 last:border-b-0">
              <span className="text-xs font-extrabold text-[#d8f05c]">{item.number}</span>
              <div>
                <h2 className="text-sm font-bold">{item.title}</h2>
                <p className="mt-1 text-xs leading-5 text-white/55">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-start gap-3 border border-white/25 p-4">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#d8f05c]" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold">Butuh jawaban singkat?</p>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Pertanyaan umum bisa ditanyakan lebih dulu melalui MudaBot.
            </p>
            <button
              type="button"
              onClick={handleOpenMudaBot}
              className="mt-3 text-xs font-extrabold text-[#d8f05c] hover:text-white"
            >
              Buka MudaBot <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          Pesan ditinjau oleh tim pengelola
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </aside>

      <section className="site-gutter bg-[#fbfaf6] py-12 sm:py-16 lg:py-20">
        <ContactForm />
      </section>
    </div>
  );
};
