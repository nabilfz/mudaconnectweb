import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllFaqsAdmin,
  createFaqAdmin,
  updateFaqAdmin,
  deleteFaqAdmin,
} from '../../services/supabase/faqs';
import { FAQ, FaqCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { HelpCircle, Plus, Search, Edit, Trash2, Sparkles } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'Umum', label: 'Umum' },
  { value: 'Program', label: 'Program' },
  { value: 'Pendaftaran', label: 'Pendaftaran' },
  { value: 'Persyaratan', label: 'Persyaratan' },
  { value: 'Jadwal', label: 'Jadwal' },
  { value: 'Biaya', label: 'Biaya' },
  { value: 'Sertifikat', label: 'Sertifikat' },
  { value: 'Kontak', label: 'Kontak' },
];

export const AdminFaqsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<FaqCategory>('Umum');
  const [keywords, setKeywords] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Confirm Delete
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllFaqsAdmin();
      setFaqs(data);
    } catch (err) {
      console.error('Failed to load faqs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCategory('Umum');
    setKeywords('');
    setIsPopular(false);
    setIsPublished(false);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setKeywords(faq.keywords ? faq.keywords.join(', ') : '');
    setIsPopular(faq.is_popular);
    setIsPublished(faq.is_published);
    setIsModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setIsSaving(true);
    const keywordsArr = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      question,
      answer,
      category,
      keywords: keywordsArr,
      is_popular: isPopular,
      is_published: isPublished,
    };

    if (editingFaq) {
      const updated = await updateFaqAdmin(editingFaq.id, payload);
      if (updated) {
        setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? updated : f)));
      }
    } else {
      const created = await createFaqAdmin(payload);
      if (created) {
        setFaqs((prev) => [created, ...prev]);
      }
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const success = await deleteFaqAdmin(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (success) {
      setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    }
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [faqs, search]);

  const columns: Column<FAQ>[] = [
    {
      header: 'Pertanyaan',
      accessor: (row) => (
        <div className="space-y-1 max-w-md">
          <span className="font-bold text-[#102A43] text-xs block leading-snug">
            {row.question}
          </span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{row.answer}</span>
        </div>
      ),
    },
    {
      header: 'Kategori',
      accessor: (row) => <Badge variant="slate" size="sm">{row.category}</Badge>,
    },
    {
      header: 'Atribut',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.is_popular && (
            <Badge variant="accent" size="sm">
              <Sparkles className="w-3 h-3" /> Populer
            </Badge>
          )}
          <Badge variant={row.is_published ? 'success' : 'slate'} size="sm">
            {row.is_published ? 'Publik' : 'Draf'}
          </Badge>
        </div>
      ),
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
            title="Hapus FAQ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#102A43] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#1D4E89]" />
            Kelola Basis FAQ
          </h1>
          <p className="text-xs text-slate-500">
            Pertanyaan FAQ pada halaman ini digunakan sebagai referensi oleh MudaBot Chatbot AI.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Tambah FAQ Baru
        </Button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-[16px] border border-[#E2E8F0] shadow-xs">
        <Input
          placeholder="Cari pertanyaan, jawaban, atau kategori FAQ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden shadow-xs">
        <DataTable
          columns={columns}
          data={filteredFaqs}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada data FAQ."
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? 'Edit FAQ' : 'Buat FAQ Baru'}
        size="lg"
      >
        <form onSubmit={handleSaveFaq} className="space-y-4">
          <Input
            label="Pertanyaan FAQ"
            placeholder="Contoh: Apakah program ini berbayar?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />

          <Textarea
            label="Jawaban Lengkap"
            placeholder="Tuliskan jawaban yang jelas dan tepat..."
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kategori FAQ"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(e) => setCategory(e.target.value as FaqCategory)}
              required
            />

            <Input
              label="Kata Kunci / Sinonim (Pisahkan dengan Koma)"
              placeholder="biaya, gratis, bayar, pendaftaran"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <Checkbox
              label="Tandai sebagai FAQ Populer di Beranda"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
            />

            <Checkbox
              label="Publikasikan FAQ"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          </div>

          <div className="pt-4 border-t flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan FAQ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus FAQ?"
        message={`Apakah Anda yakin ingin menghapus pertanyaan "${deleteTarget?.question}"?`}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
