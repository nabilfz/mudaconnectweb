import React, { useState, useEffect } from 'react';
import { getGeneralSettings, updateGeneralSettings } from '../../services/supabase/settings';
import { env } from '../../services/supabase/env';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Settings, Save, Database, Workflow } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [siteName, setSiteName] = useState('MudaConnect');
  const [siteTagline, setSiteTagline] = useState('Platform Informasi dan Partisipasi Pemuda');
  const [announcementText, setAnnouncementText] = useState('');
  const [disclaimerText, setDisclaimerText] = useState('');
  const [contactEmail, setContactEmail] = useState('info@mudaconnect.ai');
  const [contactPhone, setContactPhone] = useState('0812-3456-7890');
  const [contactAddress, setContactAddress] = useState('Bandung & Jakarta, Indonesia');

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const data = await getGeneralSettings();
        setSiteName(data.site_name || 'MudaConnect');
        setSiteTagline(data.site_tagline || 'Platform Informasi dan Partisipasi Pemuda');
        setAnnouncementText(data.announcement_text || '');
        setDisclaimerText(data.disclaimer_text || '');
        setContactEmail(data.contact_email || '');
        setContactPhone(data.contact_phone || '');
        setContactAddress(data.contact_address || '');
      } catch {
        setErrorMsg('Pengaturan gagal dimuat. Silakan muat ulang halaman.');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await updateGeneralSettings({
        site_name: siteName,
        site_tagline: siteTagline,
        announcement_text: announcementText,
        disclaimer_text: disclaimerText,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_address: contactAddress,
      });

      if (updated) {
        setSuccessMsg('Pengaturan umum platform berhasil diperbarui!');
      } else {
        setErrorMsg('Pengaturan gagal disimpan. Periksa koneksi dan coba kembali.');
      }
    } catch {
      setErrorMsg('Pengaturan gagal disimpan. Periksa koneksi dan coba kembali.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-[22px] border animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#102A43] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1D4E89]" />
          Pengaturan Umum Platform
        </h1>
        <p className="text-xs text-slate-500">
          Atur nama website, teks pengumuman atas, informasi kontak, dan status koneksi backend.
        </p>
      </div>

      {/* Backend Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Database Supabase</span>
          </div>
          <p className="text-xs text-slate-500">
            Status: {env.isSupabaseConfigured ? 'Terhubung (Environment Valid)' : 'Menggunakan Mode Demo Data Fallback'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
            <Workflow className="w-4 h-4 text-amber-600" />
            <span>Webhook Integrasi n8n</span>
          </div>
          <p className="text-xs text-slate-500">
            Status Integrasi n8n: {env.isN8nInterestConfigured || env.isN8nContactConfigured || env.isN8nChatConfigured ? 'Dikonfigurasi' : 'Belum dikonfigurasi'}
          </p>
        </div>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}
      {errorMsg && <Alert type="error">{errorMsg}</Alert>}

      <form onSubmit={handleSave} className="bg-white rounded-[22px] border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-2">
            Identitas Website & Pengumuman
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Website"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />

            <Input
              label="Tagline Website"
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Teks Banner Pengumuman Atas (Announcement Bar)"
            rows={2}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          />

          <Textarea
            label="Teks Disclaimer Resmi"
            rows={2}
            value={disclaimerText}
            onChange={(e) => setDisclaimerText(e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-2">
            Informasi Kontak Publik
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Email Kontak"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />

            <Input
              label="Nomor WhatsApp / Telepon"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />

            <Input
              label="Alamat / Sekretariat"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Pengaturan General
          </Button>
        </div>
      </form>
    </div>
  );
};
