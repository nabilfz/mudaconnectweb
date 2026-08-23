import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, ContactFormValues } from '../../schemas/formSchemas';
import { submitContactForm } from '../../services/n8n/contact';
import { env } from '../../services/supabase/env';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Send } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formStartedAt] = useState(() => new Date().toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      subject: '',
      message: '',
      consentPrivacy: false,
      website: '',
      formStartedAt,
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await submitContactForm({
        fullName: data.fullName,
        email: data.email,
        subject: data.subject,
        message: data.message,
        consentPrivacy: data.consentPrivacy,
        website: data.website || '',
        formStartedAt: data.formStartedAt,
        source: 'website',
      });

      if (result.success) {
        setSuccessMsg(result.message);
        reset({
          fullName: '',
          email: '',
          subject: '',
          message: '',
          consentPrivacy: false,
          website: '',
          formStartedAt: new Date().toISOString(),
        });
      } else {
        setErrorMsg(result.message || 'Pesan belum berhasil dikirim. Silakan coba kembali.');
      }
    } catch {
      setErrorMsg('Koneksi sedang terganggu. Pesan belum terkirim; silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-t border-[#9fa29d] pt-6">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#007d6f]">
          Formulir / 02
        </span>
        <h2 className="mt-4 text-[clamp(2.3rem,3.7vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#071f32]">
          Kirim pesan langsung.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#617078]">
          Lengkapi detail pesan agar tim dapat meneruskannya ke pengelola yang tepat.
        </p>
      </div>

      {!env.isN8nContactConfigured && (
        <Alert type="warning">
          Formulir kontak belum aktif karena integrasi n8n sedang disiapkan.
        </Alert>
      )}

      {successMsg && (
        <Alert type="success" title="Pesan Terkirim">
          <p className="font-medium text-[#2E7D57]">{successMsg}</p>
        </Alert>
      )}

      {errorMsg && <Alert type="error">{errorMsg}</Alert>}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 border-t border-[#cfcac0] pt-7"
        noValidate
      >
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

        <Input
          label="Subjek Pesan"
          placeholder="Contoh: Pertanyaan seputar pendaftaran atau kemitraan"
          required
          error={errors.subject?.message}
          {...register('subject')}
        />

        <Textarea
          label="Pesan Anda"
          placeholder="Tuliskan pesan, saran, atau pertanyaanmu secara detail..."
          rows={5}
          required
          error={errors.message?.message}
          {...register('message')}
        />

        <Checkbox
          label={
            <span className="text-xs text-[#5E6872] leading-snug">
              Saya menyetujui data saya diproses untuk keperluan komunikasi dan balasan
              pesan sesuai{' '}
              <a
                href="/privasi"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#17324D] underline"
              >
                Kebijakan Privasi
              </a>
              .
            </span>
          }
          error={errors.consentPrivacy?.message}
          {...register('consentPrivacy')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={!env.isN8nContactConfigured || isSubmitting}
            className="min-w-[180px] w-full sm:w-auto"
            rightIcon={<Send className="w-4 h-4" />}
          >
            Kirim Pesan
          </Button>
        </div>
      </form>
    </div>
  );
};
