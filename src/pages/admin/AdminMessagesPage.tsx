import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllMessagesAdmin,
  updateMessageStatusAdmin,
  sendContactReplyAdmin,
  getContactReplyHistoryAdmin,
} from '../../services/supabase/messages';
import { Message, MessageStatus, ContactReplyEmail } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Alert } from '../../components/ui/Alert';
import { formatDateIndonesian } from '../../utils/formatters';
import { mapReplyStatus } from '../../utils/enumMappers';
import {
  MessageSquare,
  Search,
  Eye,
  Mail,
  User,
  Calendar,
  Save,
  ShieldCheck,
  Send,
  History,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'baru', label: 'Baru' },
  { value: 'dibaca', label: 'Dibaca' },
  { value: 'dibalas', label: 'Dibalas' },
  { value: 'diarsipkan', label: 'Diarsipkan' },
];

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Drawer & Detail State
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [replyHistory, setReplyHistory] = useState<ContactReplyEmail[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Reply Modal State
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyValidationError, setReplyValidationError] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Feedback Alert
  const [feedbackAlert, setFeedbackAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMessagesAdmin();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const fetchHistoryForMessage = async (msgId: string) => {
    setIsLoadingHistory(true);
    try {
      const history = await getContactReplyHistoryAdmin(msgId);
      setReplyHistory(history);
    } catch (err) {
      console.warn('Failed to load reply history:', err);
      setReplyHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openDrawer = (msg: Message) => {
    setSelectedMsg(msg);
    setAdminNotes(msg.admin_notes || '');
    setFeedbackAlert(null);
    fetchHistoryForMessage(msg.id);

    // Auto mark as read if new/unread
    if (msg.status === 'baru' || msg.status === ('unread' as any)) {
      handleStatusChange(msg.id, 'dibaca', msg.admin_notes);
    }
  };

  const handleStatusChange = async (id: string, newStatus: MessageStatus, notes?: string) => {
    setIsSavingNotes(true);
    try {
      const updated = await updateMessageStatusAdmin(id, newStatus, notes ?? adminNotes);
      if (updated && !(updated as any)._error) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
        if (selectedMsg?.id === id) {
          setSelectedMsg((prev) => (prev ? { ...prev, ...updated } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update internal status:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMsg) return;
    setIsSavingNotes(true);
    try {
      const updated = await updateMessageStatusAdmin(selectedMsg.id, null, adminNotes);
      if (updated && !(updated as any)._error) {
        setMessages((prev) => prev.map((m) => (m.id === selectedMsg.id ? { ...m, ...updated } : m)));
        setSelectedMsg((prev) => (prev ? { ...prev, ...updated } : null));
        setFeedbackAlert({
          type: 'success',
          message: 'Catatan admin berhasil disimpan.',
        });
      } else {
        setFeedbackAlert({
          type: 'error',
          message: 'Perubahan belum berhasil disimpan. Periksa izin akses lalu coba kembali.',
        });
      }
    } catch (err) {
      setFeedbackAlert({
        type: 'error',
        message: 'Perubahan belum berhasil disimpan. Periksa izin akses lalu coba kembali.',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Open Reply Modal
  const openReplyModal = () => {
    if (!selectedMsg) return;
    const defaultSubject = selectedMsg.subject.startsWith('Re:')
      ? selectedMsg.subject
      : `Re: ${selectedMsg.subject}`;
    setReplySubject(defaultSubject);
    setReplyBody('');
    setReplyValidationError('');
    setFeedbackAlert(null);
    setIsReplyModalOpen(true);
  };

  // Submit Reply
  const handleSendReply = async () => {
    if (!selectedMsg) return;

    const trimmedSubject = replySubject.trim();
    const trimmedBody = replyBody.trim();

    if (!trimmedSubject) {
      setReplyValidationError('Subjek balasan wajib diisi.');
      return;
    }
    if (trimmedSubject.length < 3 || trimmedSubject.length > 300) {
      setReplyValidationError('Subjek balasan harus antara 3 hingga 300 karakter.');
      return;
    }

    if (!trimmedBody) {
      setReplyValidationError('Isi balasan wajib diisi.');
      return;
    }
    if (trimmedBody.length < 5 || trimmedBody.length > 5000) {
      setReplyValidationError('Isi balasan harus antara 5 hingga 5.000 karakter.');
      return;
    }

    setReplyValidationError('');
    setIsSubmittingReply(true);

    try {
      const res = await sendContactReplyAdmin(selectedMsg.id, trimmedSubject, trimmedBody);

      if (res.success) {
        setIsReplyModalOpen(false);
        setReplySubject('');
        setReplyBody('');

        setFeedbackAlert({
          type: 'success',
          message: res.message,
        });

        // Refetch fresh messages list from Supabase
        const freshList = await getAllMessagesAdmin();
        setMessages(freshList);

        // Update active sub in drawer
        const updatedMsg = freshList.find((m) => m.id === selectedMsg.id);
        if (updatedMsg) {
          setSelectedMsg(updatedMsg);
        } else {
          setSelectedMsg((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'dibalas' as any,
                  reply_status: 'sent',
                  last_replied_at: new Date().toISOString(),
                }
              : null
          );
        }

        // Refetch reply history
        fetchHistoryForMessage(selectedMsg.id);
      } else {
        setReplyValidationError(res.message);
      }
    } catch (err) {
      setReplyValidationError('Layanan balasan pesan sementara tidak dapat diakses.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchSearch =
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase());

      const normalizedStatus = m.status === ('unread' as any) ? 'baru' : m.status;
      const matchStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [messages, search, statusFilter]);

  const columns: Column<Message>[] = [
    {
      header: 'Pengirim',
      accessor: (row) => (
        <div>
          <span className="font-bold text-[#102A43] text-xs block">{row.full_name}</span>
          <span className="text-[11px] text-slate-500 font-medium">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Subjek Pesan',
      accessor: (row) => (
        <span className="text-xs font-semibold text-[#102A43] line-clamp-1">
          {row.subject}
        </span>
      ),
    },
    {
      header: 'Status Balasan',
      accessor: (row) => {
        const rs = row.reply_status || 'not_sent';
        if (rs === 'sent') {
          return (
            <Badge variant="success" size="sm">
              BALASAN TERKIRIM
            </Badge>
          );
        }
        if (rs === 'failed') {
          return (
            <Badge variant="error" size="sm">
              PENGIRIMAN GAGAL
            </Badge>
          );
        }
        if (rs === 'sending') {
          return (
            <Badge variant="primary" size="sm">
              SEDANG MENGIRIM
            </Badge>
          );
        }
        if (rs === 'pending') {
          return (
            <Badge variant="warning" size="sm">
              MENUNGGU PENGIRIMAN
            </Badge>
          );
        }
        return (
          <Badge variant="slate" size="sm">
            BELUM DIBALAS
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
              st === 'baru' || st === ('unread' as any)
                ? 'warning'
                : st === 'dibaca' || st === ('read' as any)
                ? 'primary'
                : st === 'dibalas' || st === ('replied' as any)
                ? 'success'
                : 'slate'
            }
            size="sm"
          >
            {st === 'baru' || st === ('unread' as any)
              ? 'BARU'
              : st === 'dibaca' || st === ('read' as any)
              ? 'DIBACA'
              : st === 'dibalas' || st === ('replied' as any)
              ? 'DIBALAS'
              : 'DIARSIPKAN'}
          </Badge>
        );
      },
    },
    {
      header: 'Tanggal Diterima',
      accessor: (row) => formatDateIndonesian(row.created_at),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDrawer(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Baca Pesan
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
            <MessageSquare className="w-5 h-5 text-[#1D4E89]" />
            Pesan Masuk Kontak Publik
          </h1>
          <p className="text-xs text-slate-500">
            Kelola pertanyaan publik, kirim balasan email resmi, dan pantau riwayat tanggapan.
          </p>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedbackAlert && !selectedMsg && (
        <Alert
          type={feedbackAlert.type === 'success' ? 'success' : 'error'}
          title={feedbackAlert.type === 'success' ? 'Berhasil' : 'Kendala'}
          onClose={() => setFeedbackAlert(null)}
        >
          {feedbackAlert.message}
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[16px] border border-[#E2E8F0] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            placeholder="Cari nama pengirim, email, subjek, atau isi pesan..."
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

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden shadow-xs">
        <DataTable
          columns={columns}
          data={filteredMessages}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada pesan masuk."
        />
      </div>

      {/* Drawer Detail */}
      <Drawer
        isOpen={Boolean(selectedMsg)}
        onClose={() => setSelectedMsg(null)}
        title="Rincian Pesan Masuk & Balasan"
      >
        {selectedMsg && (
          <div className="space-y-6">
            {/* Drawer Alert */}
            {feedbackAlert && (
              <Alert
                type={feedbackAlert.type === 'success' ? 'success' : 'error'}
                title={feedbackAlert.type === 'success' ? 'Berhasil' : 'Kendala'}
                onClose={() => setFeedbackAlert(null)}
              >
                {feedbackAlert.message}
              </Alert>
            )}

            {/* Status Balasan Email Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-extrabold text-xs text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#1D4E89]" />
                  Status Balasan Email
                </span>
                {selectedMsg.reply_status === 'sent' ? (
                  <Badge variant="success" size="sm">
                    BALASAN TERKIRIM
                  </Badge>
                ) : selectedMsg.reply_status === 'failed' ? (
                  <Badge variant="error" size="sm">
                    PENGIRIMAN GAGAL
                  </Badge>
                ) : selectedMsg.reply_status === 'sending' ? (
                  <Badge variant="primary" size="sm">
                    SEDANG MENGIRIM
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    BELUM DIBALAS
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Status Balasan:</span>
                  <span className="font-bold text-[#102A43]">
                    {mapReplyStatus(selectedMsg.reply_status)}
                  </span>
                </div>

                {selectedMsg.last_replied_at && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Terakhir Dibalas Pada:</span>
                    <span className="font-medium">{formatDateIndonesian(selectedMsg.last_replied_at)}</span>
                  </div>
                )}

                {selectedMsg.reply_status === 'failed' && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Pengiriman Balasan Sebelumnya Gagal</span>
                      <p className="text-[11px] mt-0.5">
                        Balasan belum berhasil dikirim. Silakan coba kembali.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Balas melalui Email */}
              <div className="pt-2 border-t border-slate-200">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-bold py-2.5"
                  onClick={openReplyModal}
                  disabled={selectedMsg.reply_status === 'sending' || isSubmittingReply}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {selectedMsg.reply_status === 'sending' || isSubmittingReply
                    ? 'Sedang mengirim balasan...'
                    : 'Balas melalui Email'}
                </Button>
              </div>
            </div>

            {/* Internal Status Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Status Pelacakan Internal Admin:</label>
              <div className="flex flex-wrap gap-2">
                {(['baru', 'dibaca', 'dibalas', 'diarsipkan'] as MessageStatus[]).map((st) => {
                  const dbMapping: Record<string, string> = {
                    baru: 'unread',
                    dibaca: 'read',
                    dibalas: 'replied',
                    diarsipkan: 'archived',
                  };
                  const isSelected = selectedMsg.status === st || selectedMsg.status === (dbMapping[st] as any);
                  return (
                    <button
                      type="button"
                      key={st}
                      onClick={() => handleStatusChange(selectedMsg.id, st)}
                      disabled={isSavingNotes}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-[#1D4E89] text-white shadow-xs'
                          : 'bg-white text-slate-700 border hover:bg-slate-100'
                      }`}
                    >
                      {st === 'baru' ? 'BARU' : st === 'dibaca' ? 'DIBACA' : st === 'dibalas' ? 'DIBALAS' : 'DIARSIPKAN'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sender Info */}
            <div className="space-y-3.5 text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Pengirim</span>
                  <span className="text-sm font-bold text-[#102A43]">{selectedMsg.full_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Alamat Email</span>
                  <a href={`mailto:${selectedMsg.email}`} className="text-[#1D4E89] underline font-semibold">
                    {selectedMsg.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#1D4E89]" />
                <div>
                  <span className="font-bold block text-slate-500">Tanggal Terkirim</span>
                  <span>{formatDateIndonesian(selectedMsg.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold block text-slate-500">Persetujuan Privasi Data</span>
                  <span className="text-emerald-700 font-medium">Persetujuan data dikonfirmasi</span>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-[#102A43] uppercase tracking-wider block">
                Subjek: {selectedMsg.subject}
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedMsg.message}
              </div>
            </div>

            {/* Reply History Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#1D4E89]" />
                  Riwayat Balasan
                </span>
                {replyHistory.length > 0 && (
                  <span className="text-[11px] font-bold text-slate-500">
                    {replyHistory.length} kali dibalas
                  </span>
                )}
              </div>

              {isLoadingHistory ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1D4E89]" />
                  <span>Memuat riwayat balasan...</span>
                </div>
              ) : replyHistory.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  Belum ada riwayat balasan.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {replyHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-[#102A43] truncate max-w-[200px]">
                          {item.reply_subject}
                        </span>
                        <Badge
                          variant={
                            item.delivery_status === 'sent'
                              ? 'success'
                              : item.delivery_status === 'failed'
                              ? 'error'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {mapReplyStatus(item.delivery_status)}
                        </Badge>
                      </div>

                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {item.reply_body}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDateIndonesian(item.sent_at || item.created_at)}
                        </span>
                        {item.sent_by && (
                          <span className="truncate max-w-[150px]">Oleh: {item.sent_by}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2 pt-4 border-t">
              <label className="text-xs font-bold text-[#102A43] block">
                Catatan Internal Admin:
              </label>
              <Textarea
                rows={3}
                placeholder="Catatan tindak lanjut tim..."
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

      {/* Reply Modal */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => {
          if (!isSubmittingReply) setIsReplyModalOpen(false);
        }}
        title="Balas Pesan Kontak"
        maxWidth="lg"
      >
        {selectedMsg && (
          <div className="space-y-4 text-xs">
            {/* Validation Error Alert */}
            {replyValidationError && (
              <Alert
                type="error"
                title="Gagal Mengirim Balasan"
                onClose={() => setReplyValidationError('')}
              >
                {replyValidationError}
              </Alert>
            )}

            {/* Context Info Box (Read Only) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold text-slate-500 block">Pengirim:</span>
                  <span className="font-bold text-[#102A43]">{selectedMsg.full_name}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Email:</span>
                  <span className="font-bold text-[#1D4E89] truncate block">{selectedMsg.email}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-500 block">Subjek Awal:</span>
                <span className="font-bold text-[#102A43]">{selectedMsg.subject}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-500 block">Pesan Asli:</span>
                <p className="text-slate-600 line-clamp-3 italic mt-0.5">
                  "{selectedMsg.message}"
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="font-bold text-[#102A43] block mb-1">
                  Subjek Balasan <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder="Subjek balasan email..."
                  disabled={isSubmittingReply}
                />
              </div>

              <div>
                <label className="font-bold text-[#102A43] block mb-1">
                  Isi Balasan <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  rows={6}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Tuliskan tanggapan dari tim MudaConnect..."
                  disabled={isSubmittingReply}
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsReplyModalOpen(false)}
                disabled={isSubmittingReply}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSendReply}
                isLoading={isSubmittingReply}
                disabled={isSubmittingReply}
                leftIcon={<Send className="w-4 h-4" />}
                className="font-bold"
              >
                {isSubmittingReply ? 'Mengirim Balasan...' : 'Kirim Balasan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
