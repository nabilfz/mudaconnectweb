import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { interestFormSchema, InterestFormValues } from '../../schemas/formSchemas';
import { submitInterestForm } from '../../services/n8n/webhooks';
import { env } from '../../services/supabase/env';
import { Program } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Send, ShieldAlert } from 'lucide-react';

export interface InterestFormProps {
  programs: Program[];
  defaultProgramId?: string;
}

const AGE_RANGES = [
  { value: '', label: 'Pilih Rentang Usia' },
  { value: 'di-bawah-18', label: 'Di bawah 18 tahun' },
  { value: '18-24', label: '18 - 24 tahun' },
  { value: '25-30', label: '25 - 30 tahun' },
  { value: 'di-atas-30', label: 'Di atas 30 tahun' },
];

export const InterestForm: React.FC<InterestFormProps> = ({
  programs,
  defaultProgramId = '',
}) => {
  const [formStartedAt] = useState(() => new Date().toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const programOptions = [
    { value: '', label: 'Pilih Program yang Diminati' },
    ...programs.map((p) => ({
      value: p.id,
      label: `${p.title} (${p.category})`,
    })),
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InterestFormValues>({
    resolver: zodResolver(interestFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      domicile: '',
      ageRange: '',
      programId: defaultProgramId,
      motivation: '',
      consentPrivacy: false,
      website: '',
      formStartedAt,
    },
  });

  useEffect(() => {
    if (defaultProgramId) {
      reset((prev) => ({ ...prev, programId: defaultProgramId }));
    }
  }, [defaultProgramId, reset]);

  const onSubmit = async (data: InterestFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const selectedProg = programs.find((p) => p.id === data.programId);
      const result = await submitInterestForm(
        {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          domicile: data.domicile,
          ageRange: data.ageRange,
          programId: data.programId,
          motivation: data.motivation,
          consentPrivacy: data.consentPrivacy,
          website: data.website || '',
          formStartedAt: data.formStartedAt,
          source: 'website',
        },
        selectedProg?.title
      );

      if (result.success) {
        setSuccessMsg(result.message);
        reset({
          fullName: '',
          email: '',
          phone: '',
          domicile: '',
          ageRange: '',
          programId: '',
          motivation: '',
          consentPrivacy: false,
          website: '',
          formStartedAt: new Date().toISOString(),
        });
      } else {
        setErrorMsg(result.message || 'Formulir belum berhasil dikirim. Silakan coba kembali.');
      }
    } catch {
      setErrorMsg('Koneksi sedang terganggu. Data belum terkirim; silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 border-t border-[#cfcac0] pt-7 font-sans">
      {/* Notice Banner */}
      {!env.isN8nInterestConfigured ? (
        <Alert type="warning">
          Formulir minat belum aktif karena integrasi n8n sedang disiapkan.
        </Alert>
      ) : (
        <div className="bg-[#DFF5EF]/30 border border-[#009D8F]/20 rounded-[4px] p-4 text-xs text-[#2B2F36] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#009D8F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#0D1B3D]">Pemberitahuan Penting:</p>
            <p className="leading-relaxed text-[#2B2F36]/80">
              Formulir ini berfungsi untuk menyampaikan pernyataan minat awal. Pengisian formulir ini <strong>bukan konfirmasi penerimaan atau pendaftaran resmi</strong>. Tim MudaConnect akan menghubungi kandidat terpilih.
            </p>
          </div>
        </div>
      )}

      {successMsg && (
        <Alert type="success" title="Pernyataan Minat Terkirim">
          <p className="font-medium text-[#2E7D57]">{successMsg}</p>
        </Alert>
      )}

      {errorMsg && <Alert type="error">{errorMsg}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="hidden" aria-hidden="true">
          <input type="text" {...register('website')} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nomor WhatsApp"
            placeholder="Contoh: 081234567890"
            required
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Kota/Kabupaten Domisili"
            placeholder="Contoh: Bandung"
            required
            error={errors.domicile?.message}
            {...register('domicile')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Rentang Usia"
            options={AGE_RANGES}
            required
            error={errors.ageRange?.message}
            {...register('ageRange')}
          />

          <Select
            label="Program Pilihan"
            options={programOptions}
            required
            error={errors.programId?.message}
            {...register('programId')}
          />
        </div>

        <Textarea
          label="Motivasi Mengikuti Program"
          placeholder="Jelaskan secara singkat alasan dan harapanmu mengikuti program ini (Maksimal 1.000 karakter)..."
          rows={4}
          required
          error={errors.motivation?.message}
          {...register('motivation')}
        />

        <Checkbox
          label={
            <span className="text-xs text-[#5E6872] leading-snug">
              Saya menyetujui pemrosesan data diri untuk keperluan peninjauan minat program sesuai dengan{' '}
              <a href="/privasi" target="_blank" rel="noopener noreferrer" className="text-[#17324D] underline font-semibold">
                Kebijakan Privasi
              </a>.
            </span>
          }
          error={errors.consentPrivacy?.message}
          {...register('consentPrivacy')}
        />

        <div className="pt-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={!env.isN8nInterestConfigured || isSubmitting}
            className="w-full sm:w-auto min-w-[200px]"
            rightIcon={<Send className="w-4 h-4" />}
          >
            Kirim Formulir Minat
          </Button>
        </div>
      </form>
    </div>
  );
};
