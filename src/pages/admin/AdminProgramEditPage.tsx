import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { programSchema, ProgramFormValues } from '../../schemas/formSchemas';
import {
  getProgramByIdAdmin,
  createProgramAdmin,
  updateProgramAdmin,
} from '../../services/supabase/programs';
import { uploadFileToBucket } from '../../services/supabase/storage';
import {
  deliveryModeOptions,
  registrationStatusOptions,
  normalizeDeliveryMode,
  normalizeRegistrationStatus,
  normalizeContentStatus,
} from '../../utils/enumMappers';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { FileUploader } from '../../components/ui/FileUploader';
import { Alert } from '../../components/ui/Alert';
import { ArrowLeft, Save, X } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'Pendidikan', label: 'Pendidikan' },
  { value: 'Keterampilan Digital', label: 'Keterampilan Digital' },
  { value: 'Kepemudaan', label: 'Kepemudaan' },
  { value: 'Sosial', label: 'Sosial' },
  { value: 'Kewirausahaan', label: 'Kewirausahaan' },
  { value: 'Pengembangan Diri', label: 'Pengembangan Diri' },
];

export const AdminProgramEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id && id !== 'new');

  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Array inputs state
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObj, setNewObj] = useState('');

  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBen, setNewBen] = useState('');

  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReq, setNewReq] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: 'Pendidikan',
      delivery_mode: 'online',
      location: 'Online via Zoom',
      short_description: '',
      description: '',
      target_audience: 'Pemuda usia 18-30 tahun',
      fee_information: 'Gratis tanpa dipungut biaya',
      contact_information: 'WhatsApp Center / Email Info',
      registration_status: 'interest_open',
      is_published: false,
      is_featured: false,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      cover_image_path: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    },
  });

  const coverImagePath = watch('cover_image_path');

  useEffect(() => {
    if (isEditMode && id) {
      async function loadProgramData() {
        setIsLoadingData(true);
        try {
          const program = await getProgramByIdAdmin(id!);
          if (program) {
            reset({
              title: program.title,
              slug: program.slug,
              category: program.category,
              delivery_mode: normalizeDeliveryMode(program.delivery_mode),
              location: program.location,
              short_description: program.short_description,
              description: program.description,
              target_audience: program.target_audience,
              fee_information: program.fee_information,
              contact_information: program.contact_information,
              registration_status: normalizeRegistrationStatus(program.registration_status),
              is_published: program.is_published,
              is_featured: program.is_featured,
              start_date: program.start_date.split('T')[0],
              end_date: program.end_date.split('T')[0],
              cover_image_path: program.cover_image_path,
            });
            setObjectives(program.objectives || []);
            setBenefits(program.benefits || []);
            setRequirements(program.requirements || []);
          } else {
            setErrorMsg('Program tidak ditemukan.');
          }
        } catch (err: any) {
          console.error('Error loading program data:', err);
          setErrorMsg('Gagal memuat data program.');
        } finally {
          setIsLoadingData(false);
        }
      }
      loadProgramData();
    }
  }, [id, isEditMode, reset]);

  const handleFileUpload = async (file: File) => {
    const result = await uploadFileToBucket('program-covers', 'covers', file);
    if (result.success && result.publicUrl) {
      setValue('cover_image_path', result.publicUrl);
    } else {
      alert(`Gagal mengunggah gambar: ${result.error}`);
    }
  };

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const normalizedDeliveryMode = normalizeDeliveryMode(data.delivery_mode);
      const normalizedRegistrationStatus = normalizeRegistrationStatus(data.registration_status);
      const normalizedContentStatus = normalizeContentStatus(undefined, data.is_published);

      const ALLOWED_DELIVERY_MODES = ['online', 'offline', 'hybrid'];
      const ALLOWED_REGISTRATION_STATUSES = ['interest_open', 'coming_soon', 'ongoing', 'completed', 'closed'];
      const ALLOWED_CONTENT_STATUSES = ['draft', 'published', 'archived'];

      if (!ALLOWED_DELIVERY_MODES.includes(normalizedDeliveryMode)) {
        setErrorMsg('Nilai format pelaksanaan tidak valid. Silakan pilih kembali opsi yang tersedia.');
        return;
      }

      if (!ALLOWED_REGISTRATION_STATUSES.includes(normalizedRegistrationStatus)) {
        setErrorMsg('Nilai status pendaftaran tidak valid. Silakan pilih kembali opsi yang tersedia.');
        return;
      }

      if (!ALLOWED_CONTENT_STATUSES.includes(normalizedContentStatus)) {
        setErrorMsg('Nilai status publikasi tidak valid. Silakan pilih kembali opsi yang tersedia.');
        return;
      }

      const payload = {
        ...data,
        delivery_mode: normalizedDeliveryMode,
        registration_status: normalizedRegistrationStatus,
        status: normalizedContentStatus,
        objectives,
        benefits,
        requirements,
      };

      let result;
      if (isEditMode && id) {
        result = await updateProgramAdmin(id, payload);
      } else {
        result = await createProgramAdmin(payload);
      }

      if (result) {
        navigate('/admin/programs');
      } else {
        setErrorMsg('Gagal menyimpan program. Silakan periksa kembali data Anda.');
      }
    } catch (error: any) {
      console.error('Program submission error details:', error);
      if (
        error?.code === '22P02' ||
        error?.message?.includes('22P02') ||
        error?.message?.includes('enum') ||
        error?.message?.includes('invalid input value for enum')
      ) {
        setErrorMsg('Nilai format pelaksanaan atau status program tidak valid. Silakan pilih kembali opsi yang tersedia.');
      } else {
        setErrorMsg(error?.message || 'Gagal menyimpan program. Silakan periksa koneksi Supabase Anda.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-[22px] border animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded w-full" />
        <div className="h-10 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/programs')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Kembali ke Daftar Program
        </Button>
        <h1 className="text-lg font-bold text-[#102A43]">
          {isEditMode ? 'Edit Program Kepemudaan' : 'Buat Program Kepemudaan Baru'}
        </h1>
      </div>

      {errorMsg && <Alert type="error">{errorMsg}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[22px] border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Basic Metadata */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#102A43] border-b pb-2 uppercase tracking-wider text-slate-500">
            Informasi Utama Program
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Judul Program"
              placeholder="Contoh: Akademi Pemimpin Muda 2026"
              required
              error={errors.title?.message}
              {...register('title')}
            />

            <Input
              label="Slug URL (Opsional/Otomatis)"
              placeholder="akademi-pemimpin-muda-2026"
              error={errors.slug?.message}
              {...register('slug')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Kategori Program"
              options={CATEGORY_OPTIONS}
              required
              error={errors.category?.message}
              {...register('category')}
            />

            <Select
              label="Format Pelaksanaan"
              options={deliveryModeOptions}
              required
              error={errors.delivery_mode?.message}
              {...register('delivery_mode')}
            />

            <Select
              label="Status Pendaftaran"
              options={registrationStatusOptions}
              required
              error={errors.registration_status?.message}
              {...register('registration_status')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lokasi Pelaksanaan"
              placeholder="Contoh: Zoom Meeting / Gedung Kepemudaan Bandung"
              required
              error={errors.location?.message}
              {...register('location')}
            />

            <Input
              label="Target Peserta"
              placeholder="Contoh: Mahasiswa & Pemuda usia 18-30 tahun"
              required
              error={errors.target_audience?.message}
              {...register('target_audience')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              required
              error={errors.start_date?.message}
              {...register('start_date')}
            />

            <Input
              label="Tanggal Selesai"
              type="date"
              required
              error={errors.end_date?.message}
              {...register('end_date')}
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-sm font-bold text-[#102A43] border-b pb-2 uppercase tracking-wider text-slate-500">
            Deskripsi & Rincian Program
          </h2>

          <Textarea
            label="Ringkasan Singkat (Muncul di Kartu Katalog)"
            placeholder="Tuliskan 1-2 kalimat ringkasan program..."
            rows={2}
            required
            error={errors.short_description?.message}
            {...register('short_description')}
          />

          <Textarea
            label="Deskripsi Lengkap Program"
            placeholder="Jelaskan secara rinci tentang latar belakang, kurikulum, dan aktivitas program..."
            rows={6}
            required
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-3 pt-4 border-t">
          <h2 className="text-sm font-bold text-[#102A43] border-b pb-2 uppercase tracking-wider text-slate-500">
            Gambar Sampul (Cover)
          </h2>

          <Input
            label="URL Gambar Sampul"
            placeholder="https://..."
            error={errors.cover_image_path?.message}
            {...register('cover_image_path')}
          />

          <FileUploader
            label="Atau Unggah Gambar Sampul Baru (Max 5MB)"
            accept="image/png, image/jpeg, image/webp"
            onUpload={handleFileUpload}
          />

          {coverImagePath && (
            <div className="mt-2 h-36 w-full max-w-xs rounded-xl overflow-hidden border">
              <img src={coverImagePath} alt="Preview cover" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Array Tags: Objectives, Benefits, Requirements */}
        <div className="space-y-6 pt-4 border-t">
          <h2 className="text-sm font-bold text-[#102A43] border-b pb-2 uppercase tracking-wider text-slate-500">
            Poin Tujuan, Manfaat & Persyaratan
          </h2>

          {/* Objectives */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#102A43]">Tujuan Program</label>
            <div className="flex gap-2">
              <Input
                placeholder="Tambah poin tujuan program..."
                value={newObj}
                onChange={(e) => setNewObj(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newObj.trim()) {
                    setObjectives([...objectives, newObj.trim()]);
                    setNewObj('');
                  }
                }}
              >
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {objectives.map((item, idx) => (
                <span key={idx} className="bg-blue-50 text-[#1D4E89] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1.5">
                  {item}
                  <button type="button" onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}>
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#102A43]">Manfaat Peserta</label>
            <div className="flex gap-2">
              <Input
                placeholder="Tambah poin manfaat peserta..."
                value={newBen}
                onChange={(e) => setNewBen(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newBen.trim()) {
                    setBenefits([...benefits, newBen.trim()]);
                    setNewBen('');
                  }
                }}
              >
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {benefits.map((item, idx) => (
                <span key={idx} className="bg-amber-50 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                  {item}
                  <button type="button" onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}>
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#102A43]">Persyaratan Peserta</label>
            <div className="flex gap-2">
              <Input
                placeholder="Tambah poin persyaratan..."
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newReq.trim()) {
                    setRequirements([...requirements, newReq.trim()]);
                    setNewReq('');
                  }
                }}
              >
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {requirements.map((item, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-300 flex items-center gap-1.5">
                  {item}
                  <button type="button" onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}>
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status Checkboxes */}
        <div className="flex items-center gap-6 pt-4 border-t">
          <Checkbox
            label="Publikasikan ke Katalog Website"
            {...register('is_published')}
          />

          <Checkbox
            label="Tampilkan sebagai Program Unggulan di Beranda"
            {...register('is_featured')}
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/programs')}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Program
          </Button>
        </div>
      </form>
    </div>
  );
};
