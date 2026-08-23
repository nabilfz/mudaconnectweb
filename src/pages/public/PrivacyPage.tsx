import { Link } from 'react-router';
import { LegalDocument, type LegalSection } from '../../components/legal/LegalDocument';

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'data',
    number: '01',
    title: 'Data yang dikumpulkan',
    content: (
      <>
        <p>
          Formulir Minat dapat meminta nama, email, nomor WhatsApp, domisili, rentang
          usia, program pilihan, dan motivasi. Formulir Kontak dapat meminta nama,
          email, subjek, dan isi pesan.
        </p>
        <p>
          Sistem juga dapat mencatat informasi teknis terbatas seperti waktu
          pengiriman, halaman asal, identitas sesi acak MudaBot, serta status
          pemrosesan untuk keamanan dan operasional.
        </p>
      </>
    ),
  },
  {
    id: 'tujuan',
    number: '02',
    title: 'Tujuan penggunaan',
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>meninjau dan menindaklanjuti minat terhadap program;</li>
        <li>menjawab pertanyaan, keluhan, atau usulan kemitraan;</li>
        <li>menjalankan MudaBot dan memperbaiki basis pengetahuan;</li>
        <li>mencegah spam, penyalahgunaan, dan akses tidak sah; serta</li>
        <li>menyusun statistik operasional yang tidak ditujukan untuk mengenali individu.</li>
      </ul>
    ),
  },
  {
    id: 'persetujuan',
    number: '03',
    title: 'Persetujuan dan pilihanmu',
    content: (
      <p>
        Data formulir hanya dikirim setelah kamu mencentang persetujuan secara aktif.
        Kamu dapat membatalkan sebelum menekan tombol kirim. Jangan masukkan kata
        sandi, nomor identitas, data kesehatan, atau informasi finansial ke formulir
        maupun MudaBot.
      </p>
    ),
  },
  {
    id: 'anak',
    number: '04',
    title: 'Pengguna di bawah 18 tahun',
    content: (
      <p>
        Jika kamu belum berusia 18 tahun, diskusikan pengiriman data dengan orang tua
        atau wali. Pengelola dapat meminta persetujuan atau verifikasi tambahan
        sebelum menindaklanjuti program tertentu.
      </p>
    ),
  },
  {
    id: 'pemroses',
    number: '05',
    title: 'Penyimpanan dan penyedia layanan',
    content: (
      <p>
        Data dapat diproses melalui layanan basis data, otomatisasi alur kerja,
        pengiriman email, dan hosting yang digunakan MudaConnect. Akses dibatasi
        sesuai kebutuhan operasional. MudaConnect tidak menjual data pribadi untuk
        kepentingan periklanan.
      </p>
    ),
  },
  {
    id: 'retensi',
    number: '06',
    title: 'Penyimpanan dan penghapusan',
    content: (
      <p>
        Data disimpan selama masih diperlukan untuk peninjauan program, komunikasi,
        pencatatan operasional, atau penyelesaian sengketa. Data dapat dihapus atau
        dianonimkan ketika tujuan tersebut berakhir, kecuali penyimpanan lebih lama
        diperlukan untuk kewajiban yang berlaku.
      </p>
    ),
  },
  {
    id: 'hak',
    number: '07',
    title: 'Akses, koreksi, dan permintaan penghapusan',
    content: (
      <p>
        Kamu dapat meminta informasi, koreksi, atau penghapusan data yang pernah
        dikirim dengan menghubungi tim melalui halaman{' '}
        <Link className="font-bold text-[#007d6f] underline" to="/kontak">
          Kontak
        </Link>
        . Sertakan alamat email yang digunakan dan konteks formulir agar permintaan
        dapat diverifikasi.
      </p>
    ),
  },
  {
    id: 'keamanan',
    number: '08',
    title: 'Keamanan dan perubahan kebijakan',
    content: (
      <p>
        Pengelola menggunakan kontrol akses dan langkah pengamanan teknis yang wajar,
        tetapi tidak ada sistem daring yang bebas risiko sepenuhnya. Kebijakan ini
        dapat diperbarui ketika fitur, penyedia layanan, atau kebutuhan operasional
        berubah. Tanggal pembaruan selalu ditampilkan di bagian atas dokumen.
      </p>
    ),
  },
];

export function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Dokumen / Privasi"
      title="Data kamu."
      accentTitle="Dipakai seperlunya."
      lead="Penjelasan ringkas tentang data yang dikumpulkan, tujuan pemrosesan, penyimpanan, dan pilihan yang kamu miliki."
      lastUpdated="26 Juli 2026"
      sections={PRIVACY_SECTIONS}
      notice={
        <p>
          Persetujuan pada formulir tidak dicentang otomatis. Kamu tetap memegang
          pilihan sebelum data dikirim.
        </p>
      }
    />
  );
}
