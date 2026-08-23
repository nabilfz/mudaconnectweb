import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  getAllProgramsAdmin,
  toggleProgramPublication,
  deleteProgramAdmin,
} from '../../services/supabase/programs';
import { Program } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getStatusBadgeVariant, formatDateIndonesian } from '../../utils/formatters';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderKanban,
  ExternalLink,
} from 'lucide-react';

export const AdminProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProgramsAdmin();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to load admin programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [programs, search]);

  const handleTogglePublish = async (program: Program) => {
    const updated = await toggleProgramPublication(program.id, !program.is_published);
    if (updated) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? { ...p, is_published: !p.is_published } : p))
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const success = await deleteProgramAdmin(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (success) {
      setPrograms((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } else {
      alert('Gagal menghapus program.');
    }
  };

  const columns: Column<Program>[] = [
    {
      header: 'Judul Program',
      accessor: (row) => (
        <div className="space-y-1">
          <div className="font-bold text-[#102A43] text-xs flex items-center gap-2">
            <span>{row.title}</span>
            {row.is_featured && <Badge variant="accent" size="sm">Unggulan</Badge>}
          </div>
          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
            Slug: {row.slug}
          </span>
        </div>
      ),
    },
    {
      header: 'Kategori',
      accessor: (row) => <Badge variant="primary" size="sm">{row.category}</Badge>,
    },
    {
      header: 'Status Pendaftaran',
      accessor: (row) => {
        const badge = getStatusBadgeVariant(row.registration_status);
        return (
          <span
            className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${badge.bg} ${badge.color}`}
          >
            {row.registration_status}
          </span>
        );
      },
    },
    {
      header: 'Publikasi',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => handleTogglePublish(row)}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-colors ${
            row.is_published
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {row.is_published ? 'Publik (Aktif)' : 'Draf (Disembunyikan)'}
        </button>
      ),
    },
    {
      header: 'Jadwal Mulai',
      accessor: (row) => formatDateIndonesian(row.start_date),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/programs/${row.id}/edit`)}
            leftIcon={<Edit className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          <Link
            to={`/program/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-[#1D4E89] hover:bg-slate-100 rounded-lg"
            aria-label={`Pratinjau ${row.title} di tab baru`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
            aria-label={`Hapus ${row.title}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
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
            <FolderKanban className="w-5 h-5 text-[#1D4E89]" />
            Kelola Program Kepemudaan
          </h1>
          <p className="text-xs text-slate-500">
            Tambah, sunting, ubah status pendaftaran, atau sembunyikan program dari katalog publik.
          </p>
        </div>

        <Button asChild variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
          <Link to="/admin/programs/new">
            Buat Program Baru
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[16px] border border-[#E2E8F0] shadow-xs">
        <Input
          placeholder="Cari judul atau kategori program..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden shadow-xs">
        <DataTable
          columns={columns}
          data={filteredPrograms}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada program kepemudaan."
        />
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Program Kepemudaan?"
        message={`Apakah Anda yakin ingin menghapus program "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
