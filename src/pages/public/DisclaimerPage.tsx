import { Link } from 'react-router';
import { LegalDocument, type LegalSection } from '../../components/legal/LegalDocument';

const DISCLAIMER_SECTIONS: LegalSection[] = [
  {
    id: 'informasi',
    number: '01',
    title: 'Sifat informasi',
    content: (
      <>
        <p>
          MudaConnect membantu merangkum informasi program, kegiatan, dan materi
          edukasi agar lebih mudah dipahami. Ringkasan di website bukan pengganti
          pengumuman resmi dari penyelenggara.
        </p>
        <p>
          Jika terdapat perbedaan informasi, ketentuan terbaru dari pengelola atau
          penyelenggara program yang menjadi acuan.
        </p>
      </>
    ),
  },
  {
    id: 'program',
    number: '02',
    title: 'Pendaftaran dan keputusan program',
    content: (
      <p>
        Pengiriman Formulir Minat tidak menjamin penerimaan, tempat peserta, beasiswa,
        sertifikat, atau manfaat lain. Verifikasi persyaratan, seleksi, dan keputusan
        akhir dilakukan oleh tim manusia yang bertanggung jawab atas program.
      </p>
    ),
  },
  {
    id: 'otomatisasi',
    number: '03',
    title: 'Jawaban otomatis dan MudaBot',
    content: (
      <p>
        MudaBot memberi jawaban awal berdasarkan informasi yang tersedia. Jawaban
        otomatis dapat kurang lengkap atau tidak lagi sesuai dengan pembaruan terbaru.
        Untuk keputusan penting, konfirmasikan melalui halaman{' '}
        <Link className="font-bold text-[#007d6f] underline" to="/kontak">
          Kontak
        </Link>
        .
      </p>
    ),
  },
  {
    id: 'pihak-ketiga',
    number: '04',
    title: 'Tautan dan layanan pihak ketiga',
    content: (
      <p>
        Website dapat memuat tautan menuju penyelenggara, platform konferensi, media,
        atau layanan lain. Kebijakan, keamanan, ketersediaan, dan isi layanan tersebut
        berada di luar kendali MudaConnect.
      </p>
    ),
  },
  {
    id: 'media',
    number: '05',
    title: 'Media dan hak penggunaan',
    content: (
      <p>
        Gambar, audio, video, logo, dan materi publikasi digunakan sesuai hak atau izin
        yang tersedia bagi pengelola. Jangan menyalin atau menggunakan kembali materi
        bermerek tanpa memastikan izin dari pemegang hak terkait.
      </p>
    ),
  },
  {
    id: 'perubahan',
    number: '06',
    title: 'Pembaruan dan koreksi',
    content: (
      <p>
        Informasi dapat diperbarui, dikoreksi, atau ditarik tanpa pemberitahuan
        terpisah apabila program berubah, telah berakhir, atau ditemukan data yang
        tidak akurat. Laporkan koreksi melalui halaman Kontak dengan menyertakan
        tautan halaman terkait.
      </p>
    ),
  },
];

export function DisclaimerPage() {
  return (
    <LegalDocument
      eyebrow="Dokumen / Disclaimer"
      title="Baca informasinya."
      accentTitle="Konfirmasi keputusannya."
      lead="Batas penggunaan informasi MudaConnect, layanan otomatis, media, dan program pihak ketiga."
      lastUpdated="26 Juli 2026"
      sections={DISCLAIMER_SECTIONS}
      notice={
        <p>
          Dokumen ini menjelaskan batas layanan secara umum. Jika kamu menemukan
          informasi yang meragukan, jangan mengirim data sensitif sebelum memperoleh
          konfirmasi resmi.
        </p>
      }
    />
  );
}
