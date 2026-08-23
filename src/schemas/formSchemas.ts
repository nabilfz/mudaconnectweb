import { z } from 'zod';

export const interestFormSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z.string().email('Alamat email tidak valid'),
  phone: z
    .string()
    .min(8, 'Nomor WhatsApp minimal 8 digit')
    .max(24, 'Nomor WhatsApp terlalu panjang')
    .regex(/^[0-9+\-\s]+$/, 'Nomor telepon hanya boleh berisi angka, tanda plus, atau strip')
    .refine((value) => {
      const digitCount = value.replace(/\D/g, '').length;
      return digitCount >= 8 && digitCount <= 16;
    }, 'Nomor WhatsApp harus berisi 8 sampai 16 digit'),
  domicile: z
    .string()
    .min(2, 'Kota/Kabupaten domisili wajib diisi')
    .max(100, 'Domisili maksimal 100 karakter'),
  ageRange: z.string().min(1, 'Rentang usia wajib dipilih'),
  programId: z.string().min(1, 'Program pilihan wajib dipilih'),
  motivation: z
    .string()
    .min(10, 'Motivasi minimal 10 karakter')
    .max(1000, 'Motivasi maksimal 1.000 karakter'),
  consentPrivacy: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui kebijakan privasi dan pemrosesan data',
  }),
  website: z.string().optional(),
  formStartedAt: z.string(),
});

export type InterestFormValues = z.infer<typeof interestFormSchema>;

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z.string().email('Alamat email tidak valid'),
  subject: z
    .string()
    .min(3, 'Subjek pesan minimal 3 karakter')
    .max(160, 'Subjek pesan maksimal 160 karakter'),
  message: z
    .string()
    .min(10, 'Pesan minimal 10 karakter')
    .max(2000, 'Pesan maksimal 2.000 karakter'),
  consentPrivacy: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui kebijakan privasi',
  }),
  website: z.string().optional(),
  formStartedAt: z.string(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const programSchema = z.object({
  title: z.string().min(3, 'Judul program minimal 3 karakter'),
  slug: z.string().optional(),
  short_description: z.string().min(10, 'Deskripsi singkat minimal 10 karakter'),
  description: z.string().min(20, 'Deskripsi lengkap minimal 20 karakter'),
  category: z.enum([
    'Pendidikan',
    'Keterampilan Digital',
    'Kepemudaan',
    'Sosial',
    'Kewirausahaan',
    'Pengembangan Diri',
  ]),
  target_audience: z.string().min(3, 'Target peserta wajib diisi'),
  delivery_mode: z.string().min(1, 'Format pelaksanaan wajib dipilih'),
  location: z.string().min(2, 'Lokasi wajib diisi'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().min(1, 'Tanggal selesai wajib diisi'),
  registration_status: z.string().min(1, 'Status pendaftaran wajib dipilih'),
  fee_information: z.string().min(2, 'Informasi biaya wajib diisi'),
  contact_information: z.string().min(2, 'Kontak program wajib diisi'),
  cover_image_path: z.string().min(5, 'Cover image URL wajib ada'),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

export type ProgramFormValues = z.infer<typeof programSchema>;
