import React from 'react';
import { Link } from 'react-router';
import { ArrowDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  const principles = [
    {
      number: '01',
      title: 'Terbuka untuk lebih banyak orang',
      desc: 'Informasi disusun dengan bahasa yang jelas serta dilengkapi kategori, format, jadwal, dan status agar dapat dipahami tanpa harus berada di lingkaran tertentu.',
    },
    {
      number: '02',
      title: 'Teknologi seperlunya',
      desc: 'Pencarian, filter, formulir, dan jawaban awal membantu proses. Komunikasi penting, penilaian peserta, dan keputusan akhir tetap ditangani manusia.',
    },
    {
      number: '03',
      title: 'Informasi yang bisa ditindaklanjuti',
      desc: 'Setiap publikasi diarahkan pada langkah nyata: memahami persyaratan, menyatakan minat, atau menghubungi pengelola melalui kanal resmi.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Kami menemukan',
      desc: 'Informasi program dihimpun dari penyelenggara, komunitas, dan kanal publik yang relevan.',
    },
    {
      step: '02',
      title: 'Kami merapikan',
      desc: 'Detail penting diringkas ke dalam struktur yang konsisten agar mudah dibaca dan dibandingkan.',
    },
    {
      step: '03',
      title: 'Kamu membandingkan',
      desc: 'Program dapat ditelusuri menurut kategori, format, dan status sebelum kamu menentukan langkah.',
    },
    {
      step: '04',
      title: 'Pengelola menindaklanjuti',
      desc: 'Pernyataan minat diteruskan untuk ditinjau dan direspons melalui jalur komunikasi resmi.',
    },
  ];

  const heroSignals = [
    { number: '01', label: 'Mudah dicari' },
    { number: '02', label: 'Jelas dibaca' },
    { number: '03', label: 'Nyata ditindaklanjuti' },
  ];

  return (
    <div className="bg-[#f1eee7] font-sans text-[#24323d]">
      <section className="grid border-b border-[#cfcac0] lg:min-h-[660px] lg:grid-cols-[59%_41%]">
        <div className="site-gutter flex flex-col justify-between border-[#cfcac0] py-14 sm:py-16 lg:border-r lg:py-20">
          <div>
            <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#007d6f]">
              <span className="h-px w-10 bg-[#007d6f]" aria-hidden="true" />
              01 / Tentang MudaConnect
            </div>
            <h1 className="mt-9 text-[clamp(3.35rem,5.35vw,6.45rem)] font-bold leading-[0.91] tracking-[-0.062em] text-[#071f32]">
              <span className="block">Kami merapikan</span>
              <span className="block">jalan menuju</span>
              <span className="block text-[#007d6f]">peluang.</span>
            </h1>
            <p className="mt-9 max-w-2xl border-t border-[#cfcac0] pt-6 text-base leading-8 text-[#52626c] sm:text-lg">
              MudaConnect adalah katalog peluang kepemudaan: satu tempat untuk
              memahami program, membandingkan detail penting, dan menemukan
              langkah berikutnya tanpa harus menyisir banyak kanal.
            </p>
          </div>
          <div className="mt-12 grid gap-6 border-t border-[#cfcac0] pt-6 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-10">
            <a
              href="#cara-kerja"
              className="inline-flex w-fit items-center gap-3 text-sm font-extrabold text-[#071f32] underline decoration-[#007d6f] decoration-2 underline-offset-8"
            >
              Lihat cara kami bekerja
              <ArrowDown className="h-4 w-4 text-[#007d6f]" aria-hidden="true" />
            </a>
            <p className="max-w-md text-xs leading-5 text-[#617078] sm:justify-self-end sm:text-right">
              Dirancang sebagai pintu masuk informasi—bukan pengganti penyelenggara
              atau proses seleksi.
            </p>
          </div>
        </div>

        <figure className="grid min-h-[560px] grid-rows-[1fr_auto] overflow-hidden bg-[#d9d4ca]">
          <div className="relative min-h-[430px]">
            <img
              src="https://images.pexels.com/photos/17293357/pexels-photo-17293357.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Sekelompok perempuan muda mengikuti lokakarya kreatif"
              className="absolute inset-0 h-full w-full object-cover object-center saturate-[.82]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#071f32]/65 via-transparent to-transparent"
              aria-hidden="true"
            />
            <figcaption className="absolute bottom-6 left-6 right-6 max-w-sm text-xs leading-5 text-white/85 sm:bottom-8 sm:left-8">
              Ilustrasi kolaborasi dalam ruang belajar dan pengembangan diri.
            </figcaption>
          </div>
          <div className="grid grid-cols-3 bg-[#007d6f] text-white">
            {heroSignals.map((signal) => (
              <div
                key={signal.number}
                className="border-r border-white/25 px-4 py-5 last:border-r-0 sm:px-6 sm:py-6"
              >
                <span className="text-[10px] font-extrabold text-[#d8f05c]">
                  {signal.number}
                </span>
                <p className="mt-2 text-[11px] font-bold leading-4 sm:text-xs">
                  {signal.label}
                </p>
              </div>
            ))}
          </div>
        </figure>
      </section>

      <section className="site-gutter border-b border-[#cfcac0] py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.48fr_1.52fr] lg:gap-16">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
              02 / Masalah yang kami lihat
            </span>
            <h2 className="mt-5 max-w-lg text-[clamp(2.2rem,3.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
              Informasi ada. Jalannya belum selalu jelas.
            </h2>
          </div>
          <div className="grid gap-8 xl:grid-cols-[1.08fr_.92fr]">
            <div className="text-sm leading-7 text-[#52626c] sm:text-base">
              <p className="text-[clamp(1.65rem,2.3vw,2.7rem)] font-bold leading-[1.12] tracking-[-0.04em] text-[#071f32]">
                Peluang sering datang sebagai potongan: poster, unggahan media
                sosial, pesan grup, atau tautan yang cepat tenggelam.
              </p>
              <p className="mt-7">
                Akibatnya, akses pengembangan diri masih bergantung pada siapa yang
                dikenal dan kanal apa yang diikuti. MudaConnect menyusun potongan
                itu menjadi informasi yang lebih utuh, sehingga orang dapat
                memutuskan dengan tenang.
              </p>
            </div>
            <blockquote className="flex min-h-[250px] flex-col justify-between bg-[#071f32] p-7 text-white sm:p-9">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
                Peran MudaConnect
              </span>
              <p className="mt-10 text-2xl font-bold leading-tight sm:text-3xl">
                “Bukan menggantikan penyelenggara. Kami merapikan pintu masuknya.”
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="site-gutter border-b border-[#cfcac0] bg-[#fbfaf6] py-16 sm:py-20">
        <div className="grid gap-6 border-t border-[#9fa29d] pt-6 lg:grid-cols-[.48fr_1.52fr]">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
            03 / Komitmen kami
          </span>
          <h2 className="max-w-5xl text-[clamp(2.4rem,4.1vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.052em] text-[#071f32]">
            Membuat informasi terasa lebih dekat, bukan lebih rumit.
          </h2>
        </div>
        <div className="mt-12 border-t border-[#cfcac0]">
          {principles.map((principle) => (
            <article
              key={principle.number}
              className="grid gap-5 border-b border-[#cfcac0] py-7 sm:py-8 lg:grid-cols-[.22fr_.63fr_1.15fr] lg:items-start lg:gap-10"
            >
              <span className="text-3xl font-bold tracking-[-0.05em] text-[#007d6f]">
                {principle.number}
              </span>
              <h3 className="text-xl font-bold leading-tight text-[#071f32] sm:text-2xl">
                {principle.title}
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-[#617078] sm:text-base">
                {principle.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="cara-kerja" className="site-gutter scroll-mt-24 bg-[#071f32] py-16 text-white sm:py-20">
        <div className="grid gap-6 border-t border-white/30 pt-6 lg:grid-cols-[.48fr_1.52fr]">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8f05c]">
            04 / Alur kerja
          </span>
          <h2 className="max-w-5xl text-[clamp(2.4rem,4vw,4.7rem)] font-bold leading-[0.97] tracking-[-0.05em]">
            Empat langkah dari informasi menuju tindakan.
          </h2>
        </div>
        <ol className="mt-12 border-t border-white/30">
          {workflowSteps.map((item) => (
            <li
              key={item.step}
              className="grid gap-5 border-b border-white/25 py-7 sm:py-8 lg:grid-cols-[.22fr_.63fr_1.15fr] lg:items-start lg:gap-10"
            >
              <span className="text-3xl font-bold tracking-[-0.05em] text-[#d8f05c]">
                {item.step}
              </span>
              <h3 className="text-xl font-bold leading-tight sm:text-2xl">{item.title}</h3>
              <p className="max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
                {item.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="site-gutter grid gap-8 border-b border-[#cfcac0] bg-[#dff3ea] py-12 lg:grid-cols-[.48fr_1.52fr] lg:items-start">
        <div className="flex items-center gap-3 text-[#007d6f]">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
            Catatan transparansi
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#071f32]">
            Keputusan akhir tetap berada pada manusia.
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#52626c]">
            Informasi program disusun dari data pengelola dan diperbarui secara
            berkala. Fitur otomatis hanya membantu pencarian dan jawaban awal;
            verifikasi, komunikasi penting, serta keputusan kepesertaan tetap
            dilakukan oleh tim pengelola.
          </p>
        </div>
      </section>

      <section className="site-gutter grid gap-8 bg-[#d8f05c] py-14 lg:grid-cols-[.48fr_1.52fr] lg:items-end">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#00685d]">
          05 / Langkah berikutnya
        </span>
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <h2 className="max-w-4xl text-[clamp(2.4rem,4vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[#071f32]">
            Temukan program yang cocok dengan arah tumbuhmu.
          </h2>
          <Button asChild variant="secondary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            <Link to="/program">Jelajahi program</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
