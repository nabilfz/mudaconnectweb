import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllSubmissionsAdmin,
  updateSubmissionStatusAdmin,
  submitInterestDecisionAdmin,
} from '../../services/supabase/submissions';
import { Submission, SubmissionStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { DataTable, Column } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Alert } from '../../components/ui/Alert';
import { formatDateIndonesian } from '../../utils/formatters';
import { mapDecisionStatus, mapNotificationStatus } from '../../utils/enumMappers';
import {
  FileCheck,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'baru', label: 'Baru' },
  { value: 'ditinjau', label: 'Sudah Ditinjau' },
  { value: 'dihubungi', label: 'Sudah Dihubungi' },
  { value: 'ditolak', label: 'Selesai / Ditolak' },
];

export const AdminSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Drawer State
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Decision State & Confirmation Dialog
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    sub: Submission | null;
    decision: 'accepted' | 'rejected' | null;
  }>({
    isOpen: false,
    sub: null,
    decision: null,
  });

  const [decisionLoading, setDecisionLoading] = useState<{
    submissionId: string;
    decision: 'accepted' | 'rejected';
  } | null>(null);

  const [decisionFeedback, setDecisionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await getAllSubmissionsAdmin();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const openDetailDrawer = (sub: Submission) => {
    setSelectedSub(sub);
    setAdminNotes(sub.admin_notes || '');
    setDecisionFeedback(null);

    // Auto mark as reviewed if still 'new'
    if (sub.status === 'baru' || sub.status === ('new' as any)) {
      handleStatusChange(sub.id, 'ditinjau', sub.admin_notes);
    }
  };

  const handleStatusChange = async (id: string, newStatus: SubmissionStatus, notes?: string) => {
    setIsSavingNotes(true);
    try {
      const updated = await updateSubmissionStatusAdmin(id, newStatus, notes ?? adminNotes);
      if (updated && !(updated as any)._error) {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
        if (selectedSub?.id === id) {
          setSelectedSub((prev) => (prev ? { ...prev, ...updated } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update internal status:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSub) return;
    setIsSavingNotes(true);
    try {
      const updated = await updateSubmissionStatusAdmin(selectedSub.id, null, adminNotes);
      if (updated && !(updated as any)._error) {
        setSubmissions((prev) => prev.map((s) => (s.id === selectedSub.id ? { ...s, ...updated } : s)));
        setSelectedSub((prev) => (prev ? { ...prev, ...updated } : null));
        setDecisionFeedback({
          type: 'success',
          message: 'Catatan internal admin berhasil disimpan.',
        });
      } else {
        setDecisionFeedback({
          type: 'error',
          message: 'Perubahan belum berhasil disimpan. Periksa izin akses lalu coba kembali.',
        });
      }
    } catch (err) {
      setDecisionFeedback({
        type: 'error',
        message: 'Perubahan belum berhasil disimpan. Periksa izin akses lalu coba kembali.',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Open confirmation dialog before calling n8n decision webhook
  const handleInitiateDecision = (sub: Submission, decision: 'accepted' | 'rejected') => {
    setDecisionFeedback(null);
    setConfirmModal({
      isOpen: true,
      sub,
      decision,
    });
  };

  // Execute decision request via n8n webhook
  const handleConfirmDecision = async () => {
    if (!confirmModal.sub || !confirmModal.decision) return;

    const targetSub = confirmModal.sub;
    const targetDecision = confirmModal.decision;

    setDecisionLoading({
      submissionId: targetSub.id,
      decision: targetDecision,
    });
    setDecisionFeedback(null);

    try {
      const result = await submitInterestDecisionAdmin(targetSub.id, targetDecision);

      if (result.success) {
        setDecisionFeedback({
          type: 'success',
          message: result.message,
        });
        setConfirmModal({ isOpen: false, sub: null, decision: null });

        // Reload updated list from Supabase
        const freshList = await getAllSubmissionsAdmin();
        setSubmissions(freshList);

        // Update active drawer sub
        const updatedSub = freshList.find((s) => s.id === targetSub.id);
        if (updatedSub) {
          setSelectedSub(updatedSub);
        }
      } else {
        setDecisionFeedback({
          type: 'error',
          message: result.message,
        });
        setConfirmModal({ isOpen: false, sub: null, decision: null });
      }
    } catch (err) {
      setDecisionFeedback({
        type: 'error',
        message: 'Layanan keputusan peserta sementara tidak dapat diakses.',
      });
      setConfirmModal({ isOpen: false, sub: null, decision: null });
    } finally {
      setDecisionLoading(null);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.domicile.toLowerCase().includes(search.toLowerCase()) ||
        (s.program_title_snapshot && s.program_title_snapshot.toLowerCase().includes(search.toLowerCase()));

      const normalizedStatus = s.status === ('new' as any) ? 'baru' : s.status;
      const matchStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && new Date(s.created_at) >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(s.created_at) <= end;
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [submissions, search, statusFilter, startDate, endDate]);

  const columns: Column<Submission>[] = [
    {
      header: 'Nama Pemohon',
      accessor: (row) => (
        <div>
          <span className="font-bold text-[#102A43] text-xs block">{row.full_name}</span>
          <span className="text-[11px] text-slate-500 font-medium">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Program Minat',
      accessor: (row) => (
        <span className="text-xs font-semibold text-[#102A43]">
          {row.program_title_snapshot || row.program_title || '-'}
        </span>
      ),
    },
    {
      header: 'Domisili & Usia',
      accessor: (row) => `${row.domicile} (${row.age_range || '-'})`,
    },
    {
      header: 'Keputusan',
      accessor: (row) => {
        const ds = row.decision_status || 'pending';
        if (ds === 'accepted') {
          return (
            <Badge variant="success" size="sm">
              DITERIMA
            </Badge>
          );
        }
        if (ds === 'rejected') {
          return (
            <Badge variant="error" size="sm">
              DITOLAK
            </Badge>
          );
        }
        return (
          <Badge variant="slate" size="sm">
            BELUM DIPUTUSKAN
          </Badge>
        );
      },
    },
    {
      header: 'Status Internal',
      accessor: (row) => {
        const st = row.status;
        return (
          <Badge
            variant={
              st === 'baru' || st === ('new' as any)
                ? 'warning'
                : st === 'ditinjau' || st === ('reviewed' as any)
                ? 'primary'
                : st === 'dihubungi' || st === ('contacted' as any)
                ? 'success'
                : 'slate'
            }
            size="sm"
          >
            {st === 'baru' || st === ('new' as any)
              ? 'BARU'
              : st === 'ditinjau' || st === ('reviewed' as any)
              ? 'DITINJAU'
              : st === 'dihubungi' || st === ('contacted' as any)
              ? 'DIHUBUNGI'
              : 'SELESAI'}
          </Badge>
        );
      },
    },
    {
      header: 'Tanggal Kirim',
      accessor: (row) => formatDateIndonesian(row.created_at),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDetailDrawer(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Lihat Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#102A43] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#1D4E89]" />
            Kelola Pernyataan Minat Program
          </h1>
          <p className="text-xs text-slate-500">
            Tinjau data minat, ambil keputusan penerimaan/penolakan, dan kirim pemberitahuan otomatis.
          </p>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {decisionFeedback && !selectedSub && (
        <Alert
          type={decisionFeedback.type === 'success' ? 'success' : 'error'}
          title={decisionFeedback.type === 'success' ? 'Berhasil' : 'Kendala'}
          onClose={() => setDecisionFeedback(null)}
        >
          {decisionFeedback.message}
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[16px] border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Cari nama, email, domisili, atau program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div>
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <Input
            type="date"
            label="Dari Tanggal"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="Sampai Tanggal"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden shadow-xs">
        <DataTable
          columns={columns}
          data={filteredSubmissions}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada data pengajuan minat sesuai kriteria."
        />
      </div>

      {/* Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        title="Rincian Pernyataan Minat Peserta"
      >
        {selectedSub && (
          <div className="space-y-6">
            {/* Drawer Feedback Alert */}
            {decisionFeedback && (
              <Alert
                type={decisionFeedback.type === 'success' ? 'success' : 'error'}
                title={decisionFeedback.type === 'success' ? 'Berhasil' : 'Kendala'}
                onClose={() => setDecisionFeedback(null)}
              >
                {decisionFeedback.message}
              </Alert>
            )}

            {/* Status Keputusan & Notification Panel */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="font-extrabold text-xs text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#1D4E89]" />
                  Status Keputusan
                </span>
                {selectedSub.decision_status === 'accepted' ? (
                  <Badge variant="success" size="sm">
                    DITERIMA
                  </Badge>
                ) : selectedSub.decision_status === 'rejected' ? (
                  <Badge variant="error" size="sm">
                    DITOLAK
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    BELUM DIPUTUSKAN
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Hasil Keputusan:</span>
                  <span className="font-bold text-[#102A43]">
                    {mapDecisionStatus(selectedSub.decision_status)}
                  </span>
                </div>

                {selectedSub.decision_at && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Waktu Keputusan:</span>
                    <span className="font-medium">{formatDateIndonesian(selectedSub.decision_at)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-500">Pemberitahuan:</span>
                  <span
                    className={`font-bold ${
                      selectedSub.notification_status === 'sent'
                        ? 'text-emerald-700'
                        : selectedSub.notification_status === 'failed'
                        ? 'text-rose-700'
                        : selectedSub.notification_status === 'sending'
                        ? 'text-blue-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {mapNotificationStatus(selectedSub.notification_status)}
                  </span>
                </div>

                {selectedSub.notification_sent_at && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Email Terkirim Pada:</span>
                    <span className="font-medium">{formatDateIndonesian(selectedSub.notification_sent_at)}</span>
                  </div>
                )}

                {selectedSub.notification_status === 'failed' && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Pengiriman Email Sebelumnya Gagal</span>
                      <p className="text-[11px] mt-0.5">
                        Email pemberitahuan gagal dikirim. Keputusan belum disimpan dan dapat dicoba kembali.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Shown when decision_status === 'pending' or missing */}
              {(!selectedSub.decision_status || selectedSub.decision_status === 'pending') && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Tindakan Keputusan Admin:
                  </span>

                  {selectedSub.notification_status === 'sending' ||
                  (decisionLoading && decisionLoading.submissionId === selectedSub.id) ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {decisionLoading && decisionLoading.submissionId === selectedSub.id
                          ? 'Mengirim Keputusan...'
                          : 'Sedang mengirim pemberitahuan...'}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleInitiateDecision(selectedSub, 'accepted')}
                        disabled={Boolean(decisionLoading)}
                        isLoading={
                          decisionLoading?.submissionId === selectedSub.id &&
                          decisionLoading?.decision === 'accepted'
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-bold py-2.5"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Terima Peserta
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleInitiateDecision(selectedSub, 'rejected')}
                        disabled={Boolean(decisionLoading)}
                        isLoading={
                          decisionLoading?.submissionId === selectedSub.id &&
                          decisionLoading?.decision === 'rejected'
                        }
                        className="font-bold py-2.5"
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Tolak Peserta
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Internal Status Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Status Alur Kerja Internal:</label>
              <div className="flex flex-wrap gap-2">
                {(['baru', 'ditinjau', 'dihubungi', 'ditolak'] as SubmissionStatus[]).map((st) => {
                  const dbMapping: Record<string, string> = {
                    baru: 'new',
                    ditinjau: 'reviewed',
                    dihubungi: 'contacted',
                    ditolak: 'closed',
                  };
                  const isSelected = selectedSub.status === st || selectedSub.status === (dbMapping[st] as any);
                  return (
                    <button
                      type="button"
                      key={st}
                      onClick={() => handleStatusChange(selectedSub.id, st)}
                      disabled={isSavingNotes}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-[#1D4E89] text-white shadow-xs'
                          : 'bg-white text-slate-700 border hover:bg-slate-100'
                      }`}
                    >
                      {st === 'baru' ? 'BARU' : st === 'ditinjau' ? 'DITINJAU' : st === 'dihubungi' ? 'DIHUBUNGI' : 'SELESAI'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Applicant Personal Info */}
            <div className="space-y-3.5 text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Nama Lengkap</span>
                  <span className="text-sm font-bold text-[#102A43]">{selectedSub.full_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Alamat Email</span>
                  <a href={`mailto:${selectedSub.email}`} className="text-[#1D4E89] underline font-semibold">
                    {selectedSub.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Nomor Telepon / WA</span>
                  <a
                    href={`https://wa.me/${selectedSub.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline font-semibold"
                  >
                    {selectedSub.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Domisili & Usia</span>
                  <span>
                    {selectedSub.domicile} — Usia {selectedSub.age_range || '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Waktu Dikirim</span>
                  <span>{formatDateIndonesian(selectedSub.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold block text-slate-500">Persetujuan Privasi Data</span>
                  <span className="text-emerald-700 font-medium">Disetujui saat pengiriman form</span>
                </div>
              </div>
            </div>

            {/* Program & Motivation */}
            <div className="space-y-3">
              <span className="font-bold text-xs text-[#102A43] uppercase tracking-wider block">
                Program Pilihan Peserta
              </span>
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-bold text-[#1D4E89]">
                {selectedSub.program_title_snapshot || selectedSub.program_title || 'Program Umum'}
              </div>

              <span className="font-bold text-xs text-[#102A43] uppercase tracking-wider block pt-2">
                Motivasi & Harapan
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedSub.motivation || 'Tidak mengisi motivasi tambahan.'}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2 pt-4 border-t">
              <label className="text-xs font-bold text-[#102A43] block">
                Catatan Internal Admin (Catatan Follow-Up):
              </label>
              <Textarea
                rows={3}
                placeholder="Tuliskan catatan internal tim (misal: Sudah dihubungi via WA pada tgl...)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                isLoading={isSavingNotes}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Simpan Catatan Admin
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Decision Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, sub: null, decision: null })}
        onConfirm={handleConfirmDecision}
        title={confirmModal.decision === 'accepted' ? 'Terima Peserta' : 'Tolak Peserta'}
        message={
          confirmModal.decision === 'accepted'
            ? `Anda akan menerima ${confirmModal.sub?.full_name || 'peserta'} untuk program ${
                confirmModal.sub?.program_title_snapshot || confirmModal.sub?.program_title || 'pilihan'
              }. Email pemberitahuan diterima akan dikirim secara otomatis.`
            : `Anda akan menolak pengajuan ${confirmModal.sub?.full_name || 'peserta'} untuk program ${
                confirmModal.sub?.program_title_snapshot || confirmModal.sub?.program_title || 'pilihan'
              }. Email pemberitahuan penolakan akan dikirim secara otomatis.`
        }
        confirmLabel={confirmModal.decision === 'accepted' ? 'Ya, Terima Peserta' : 'Ya, Tolak Peserta'}
        cancelLabel="Batal"
        isDanger={confirmModal.decision === 'rejected'}
        isLoading={Boolean(decisionLoading)}
      />
    </div>
  );
};
