import { supabase } from '../../services/supabase/client';
import { env } from '../../services/supabase/env';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getAllContentsAdmin,
  createContentAdmin,
  updateContentAdmin,
  deleteContentAdmin,
} from '../../services/supabase/contents';
import { uploadMediaFile } from '../../services/supabase/storage';
import { ContentItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDateIndonesian } from '../../utils/formatters';
import { FileText, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { mapContentType } from '../../utils/enumMappers';

export const AdminContentsPage: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentType, setContentType] = useState('article');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [mediaPath, setMediaPath] = useState('');
  const [thumbnailPath, setThumbnailPath] = useState('');
  const [captionPath, setCaptionPath] = useState('');
  const [transcript, setTranscript] = useState('');
  const [altText, setAltText] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('draft');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm Delete
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadContents = async () => {
    setIsLoading(true);
    try {
      const data = await getAllContentsAdmin();
      setContents(data);
    } catch (err) {
      console.error('Failed to load contents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setSlug('');
    setContentType('article');
    setExcerpt('');
    setBody('');
    setMediaPath('');
    setThumbnailPath('');
    setCaptionPath('');
    setTranscript('');
    setAltText('');
    setStatus('draft');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setContentType(item.content_type || 'article');
    setExcerpt(item.excerpt || '');
    setBody(item.body || '');
    setMediaPath(item.media_path || '');
    setThumbnailPath(item.thumbnail_path || '');
    setCaptionPath(item.caption_path || '');
    setTranscript(item.transcript || '');
    setAltText(item.alt_text || '');
    setStatus(item.status);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const submissionInFlightRef = useRef(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionInFlightRef.current) return;
    if (!title.trim() || !excerpt.trim()) return;

    const startTime = Date.now();
    console.info("[ContentCreate] stage", "submit-started", `${Date.now() - startTime}ms`);

    let finalMediaPath: string | null = null;

    if (!selectedFile && mediaPath.trim()) {
      finalMediaPath = mediaPath.trim();
    }

    const urlsToValidate = [
      { value: finalMediaPath, label: 'URL media' },
      { value: thumbnailPath.trim(), label: 'URL thumbnail' },
      { value: captionPath.trim(), label: 'URL takarir', extension: '.vtt' },
    ];
    for (const item of urlsToValidate) {
      if (!item.value) continue;
      try {
        const url = new URL(item.value);
        const isLocal = ['localhost', '127.0.0.1'].includes(url.hostname);
        if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
          throw new Error('Invalid protocol');
        }
        if (item.extension && !url.pathname.toLowerCase().endsWith(item.extension)) {
          throw new Error('Invalid extension');
        }
      } catch {
        alert(`${item.label} tidak valid. Gunakan HTTPS${item.extension ? ` dan berkas ${item.extension}` : ''}.`);
        return;
      }
    }

    console.info("[ContentCreate] stage", "validation-completed", `${Date.now() - startTime}ms`);

    submissionInFlightRef.current = true;
    setIsSaving(true);

    try {
      if (selectedFile) {
        const uploadRes = await uploadMediaFile(selectedFile, { folder: 'contents' });
        if (!uploadRes.success) {
          throw { code: '403', message: uploadRes.error };
        }
        if (uploadRes.publicUrl) {
          finalMediaPath = uploadRes.publicUrl;
        }
      }

      console.info("[ContentCreate] stage", "upload-skipped-or-completed", `${Date.now() - startTime}ms`);
      console.info("[ContentCreate] stage", "insert-started", `${Date.now() - startTime}ms`);

      if (env.isSupabaseConfigured) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          alert('Sesi pengelola telah berakhir. Silakan masuk kembali.');
          return;
        }
      }

      const payload: Partial<ContentItem> = {
        title,
        slug: slug || (title || 'konten').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content_type: contentType,
        excerpt,
        body,
        media_path: finalMediaPath,
        thumbnail_path: thumbnailPath || null,
        caption_path: captionPath || null,
        transcript: transcript || null,
        alt_text: altText || null,
        status,
      };

      const result = editingItem
        ? await updateContentAdmin(editingItem.id, payload)
        : await createContentAdmin(payload);

      console.info("[ContentCreate] stage", "insert-completed", `${Date.now() - startTime}ms`);

      if (result) {
        console.info("[ContentCreate] stage", "ui-success-completed", `${Date.now() - startTime}ms`);

        if (editingItem) {
          setContents((prev) => prev.map((c) => (c.id === editingItem.id ? (result as ContentItem) : c)));
        } else {
          setContents((prev) => [(result as ContentItem), ...prev]);
        }
        alert('Konten berhasil disimpan.');
        setIsModalOpen(false);
      } else {
        alert('Konten tidak berhasil tersimpan. Periksa izin akses pengelola.');
      }
    } catch (err: any) {
      console.error('Error saving content:', err);
      const code = err?.code;
      if (err?.message === 'TIMEOUT' || err?.name === 'AbortError' || err?.message?.includes('AbortError')) {
        alert('Penyimpanan konten memerlukan waktu terlalu lama. Silakan coba kembali.');
      } else if (err?.message === 'CONTENT_INSERT_RETURNED_NO_ROW') {
        alert('Konten tidak berhasil tersimpan. Periksa izin akses pengelola.');
      } else if (code === '42501') {
        alert('Akun pengelola belum memiliki izin menyimpan konten.');
      } else if (code === '23505') {
        alert('Slug konten sudah digunakan. Ubah judul atau slug.');
      } else if (code === '42703') {
        alert('Kolom konten yang dikirim belum sesuai dengan database.');
      } else if (err?.message === 'FetchError' || err?.message?.includes('Failed to fetch')) {
        alert('Koneksi ke database terganggu. Silakan coba kembali.');
      } else {
        alert('Konten belum berhasil disimpan.');
      }
    } finally {
      setIsSaving(false);
      submissionInFlightRef.current = false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await deleteContentAdmin(deleteTarget.id);
      if (success) {
        setContents((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      }
    } catch (err) {
      console.error('Error deleting content:', err);
      alert('Terjadi kesalahan saat menghapus konten.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredContents = useMemo(() => {
    return contents.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.content_type || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [contents, search]);

  const columns: Column<ContentItem>[] = [
    {
      header: 'Judul Konten',
      accessor: (row) => (
        <div className="space-y-1 max-w-sm">
          <span className="font-bold text-[#102A43] text-xs block leading-snug">
            {row.title}
          </span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{row.excerpt}</span>
        </div>
      ),
    },
    {
      header: 'Tipe',
      accessor: (row) => <Badge variant="primary" size="sm">{mapContentType(row.content_type)}</Badge>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'published' ? 'success' : 'slate'} size="sm">
          {row.status === 'published' ? 'Publik' : row.status === 'archived' ? 'Diarsipkan' : 'Draf'}
        </Badge>
      ),
    },
    {
      header: 'Tanggal Dibuat',
      accessor: (row) => formatDateIndonesian(row.created_at),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
            leftIcon={<Edit className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Hapus Konten"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#102A43] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1D4E89]" />
            Kelola Konten & Media Kegiatan
          </h1>
          <p className="text-xs text-slate-500">
            Publikasikan artikel, galeri foto, audio, video, dan kampanye sosial.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Buat Konten Baru
        </Button>
      </div>

      <div className="bg-white p-4 rounded-[16px] border border-[#E2E8F0] shadow-xs">
        <Input
          placeholder="Cari judul konten..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      <div className="bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden shadow-xs">
        <DataTable
          columns={columns}
          data={filteredContents}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada konten."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Konten' : 'Buat Konten Baru'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Judul Konten"
              placeholder="Judul artikel atau kegiatan..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#17324D]">
                Tipe Konten
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-[12px] border border-[#DEDCD6] bg-[#FAF8F3] focus:border-[#17324D] focus:ring-1 focus:ring-[#17324D] transition-all duration-200"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                required
              >
                <option value="article">Artikel</option>
                <option value="campaign">Kampanye</option>
                <option value="image">Foto / Galeri</option>                
                <option value="audio">Audio / Podcast</option>
                <option value="video">Video</option>
                <option value="activity">Kegiatan</option>
              </select>
            </div>
          </div>
          
          <Textarea
            label="Ringkasan Singkat (Excerpt)"
            placeholder="Ringkasan 1-2 kalimat..."
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
          />
          <Textarea
            label="Isi Konten Lengkap"
            placeholder="Tuliskan isi artikel / narasi kegiatan..."
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#17324D]">
                Unggah Berkas Media
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept={
                  contentType === 'audio'
                    ? 'audio/*'
                    : contentType === 'video'
                      ? 'video/*'
                      : 'image/*'
                }
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1D4E89] file:text-white hover:file:bg-[#102A43] transition-all"
              />
              <p className="text-xs text-slate-500">
                {contentType === 'audio'
                  ? 'Pilih berkas audio.'
                  : contentType === 'video'
                    ? 'Pilih berkas video.'
                    : 'Pilih gambar utama publikasi.'}
              </p>
            </div>
            
            <Input
              label="Atau URL Media Eksternal"
              placeholder="https://..."
              value={mediaPath}
              onChange={(e) => setMediaPath(e.target.value)}
              disabled={Boolean(selectedFile)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Thumbnail (opsional)"
              placeholder="https://..."
              value={thumbnailPath}
              onChange={(e) => setThumbnailPath(e.target.value)}
            />
            <Input
              label="Alt Text Gambar (opsional)"
              placeholder="Deskripsi untuk pembaca layar..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>

          {['audio', 'video'].includes(contentType) && (
            <div className="grid grid-cols-1 gap-4 border-l-2 border-[#1D4E89] bg-slate-50 p-4 sm:grid-cols-2">
              <Input
                label="URL Takarir WebVTT (opsional)"
                placeholder="https://.../takarir.vtt"
                value={captionPath}
                onChange={(e) => setCaptionPath(e.target.value)}
                helperText="Gunakan berkas .vtt untuk takarir yang sinkron dengan media."
              />
              <Textarea
                label="Transkrip Media (opsional)"
                placeholder="Tuliskan transkrip atau ringkasan aksesibel..."
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-6 pt-2">
            <Checkbox
              label="Publikasikan ke Galeri Website"
              checked={status === 'published'}
              onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
              Simpan Konten
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Konten?"
        message={`Apakah Anda yakin ingin menghapus konten "${deleteTarget?.title}"?`}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
