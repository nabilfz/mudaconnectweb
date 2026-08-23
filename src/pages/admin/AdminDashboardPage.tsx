import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { env } from '../../services/supabase/env';
import { supabase } from '../../services/supabase/client';
import { getAllProgramsAdmin } from '../../services/supabase/programs';
import { getAllContentsAdmin } from '../../services/supabase/contents';
import { getAllSubmissionsAdmin } from '../../services/supabase/submissions';
import { getAllMessagesAdmin } from '../../services/supabase/messages';
import { getChatbotStats, getChatSessionsAdmin } from '../../services/supabase/chatbot';
import { Submission, Message, ChatSession } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDateIndonesian } from '../../utils/formatters';
import {
  FolderKanban,
  FileText,
  UserCheck,
  Mail,
  Bot,
  AlertTriangle,
  HelpCircle,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

// Independent Stat Card Component with Skeleton & Error State
interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  fetcher: () => Promise<{ main: number | string; sub?: string }>;
  linkTo: string;
  linkLabel: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, fetcher, linkTo, linkLabel }) => {
  const [data, setData] = useState<{ main: number | string; sub?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const loadStat = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcherRef.current();
      setData(res);
    } catch (err: any) {
      console.error(`Stat error (${title}):`, err);
      setError('Data gagal dimuat');
    } finally {
      setLoading(false);
    }
  }, [title]);

  useEffect(() => {
    void loadStat();
  }, [loadStat]);

  return (
    <Card className="space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-[#1D4E89]">{icon}</div>
        </div>

        {loading ? (
          <div className="space-y-1 py-1">
            <div className="h-7 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-xs py-1">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={loadStat}
              className="ml-auto p-1 text-slate-400 hover:text-slate-600"
              title="Coba lagi"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#102A43]">{data?.main}</div>
            {data?.sub && <div className="text-[11px] text-slate-500">{data.sub}</div>}
          </div>
        )}
      </div>

      <Link to={linkTo} className="text-[11px] text-[#1D4E89] font-bold hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
        <span>{linkLabel}</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </Card>
  );
};

export const AdminDashboardPage: React.FC = () => {
  // Recent activities states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [errorSubmissions, setErrorSubmissions] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [errorMessages, setErrorMessages] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [errorSessions, setErrorSessions] = useState(false);

  useEffect(() => {
    // Independent fetchers for recent lists
    async function loadRecentSubmissions() {
      setLoadingSubmissions(true);
      try {
        const data = await getAllSubmissionsAdmin();
        setSubmissions(data.slice(0, 5));
      } catch (err) {
        setErrorSubmissions(true);
      } finally {
        setLoadingSubmissions(false);
      }
    }

    async function loadRecentMessages() {
      setLoadingMessages(true);
      try {
        const data = await getAllMessagesAdmin();
        setMessages(data.slice(0, 5));
      } catch (err) {
        setErrorMessages(true);
      } finally {
        setLoadingMessages(false);
      }
    }

    async function loadRecentSessions() {
      setLoadingSessions(true);
      try {
        const data = await getChatSessionsAdmin(5);
        setSessions(data.slice(0, 5));
      } catch (err) {
        setErrorSessions(true);
      } finally {
        setLoadingSessions(false);
      }
    }

    loadRecentSubmissions();
    loadRecentMessages();
    loadRecentSessions();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-extrabold text-[#102A43]">
            Ringkasan Platform Admin
          </h1>
          <p className="text-xs text-slate-500">
            Pemantauan real-time status program, pengajuan minat, pesan kontak, dan interaksi chatbot MudaBot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            <Link to="/admin/programs">
              Tambah Program Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Connection Status Banner */}
      <div className="bg-[#17324D] text-white p-4 rounded-[16px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 font-bold text-xs text-white">
            <span>Status Supabase Backend:</span>
            {env.isSupabaseConfigured ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Terhubung (Live SQL)
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Mode Demo Data Fallback
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Status Integrasi Webhook n8n: {env.isN8nInterestConfigured || env.isN8nContactConfigured || env.isN8nChatConfigured ? 'Dikonfigurasi' : 'Belum dikonfigurasi'}
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          <Link to="/admin/settings">
            Atur Pengaturan Platform
          </Link>
        </Button>
      </div>

      {/* 7 Required Independent Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Published Programs */}
        <StatCard
          title="Program Dipublikasi"
          icon={<FolderKanban className="w-4 h-4" />}
          fetcher={async () => {
            if (!env.isSupabaseConfigured) {
              const list = await getAllProgramsAdmin();
              const pub = list.filter((p) => p.is_published || p.status === 'published').length;
              return { main: pub, sub: `dari ${list.length} total program` };
            }

            const { count: pubCount, error: pubErr } = await supabase
              .from('programs')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'published');

            const { count: totalCount, error: totalErr } = await supabase
              .from('programs')
              .select('*', { count: 'exact', head: true });

            console.info("[AdminDashboard] query result", {
              resource: "programs",
              rowCount: pubCount,
              errorCode: pubErr?.code || totalErr?.code || null,
              errorMessage: pubErr?.message || totalErr?.message || null,
            });

            if (pubErr || totalErr) {
              throw pubErr || totalErr;
            }

            return {
              main: typeof pubCount === 'number' ? pubCount : 0,
              sub: `dari ${typeof totalCount === 'number' ? totalCount : 0} total program`
            };
          }}
          linkTo="/admin/programs"
          linkLabel="Kelola Program"
        />

        {/* 2. Published Content */}
        <StatCard
          title="Konten Dipublikasi"
          icon={<FileText className="w-4 h-4" />}
          fetcher={async () => {
            if (!env.isSupabaseConfigured) {
              const list = await getAllContentsAdmin();
              const pub = list.filter((c) => c.status === 'published').length;
              return { main: pub, sub: `dari ${list.length} total konten` };
            }

            const { count: pubCount, error: pubErr } = await supabase
              .from('content_items')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'published');

            const { count: totalCount, error: totalErr } = await supabase
              .from('content_items')
              .select('*', { count: 'exact', head: true });

            console.info("[AdminDashboard] query result", {
              resource: "content_items",
              rowCount: pubCount,
              errorCode: pubErr?.code || totalErr?.code || null,
              errorMessage: pubErr?.message || totalErr?.message || null,
            });

            if (pubErr || totalErr) {
              throw pubErr || totalErr;
            }

            return {
              main: typeof pubCount === 'number' ? pubCount : 0,
              sub: `dari ${typeof totalCount === 'number' ? totalCount : 0} total konten`
            };
          }}
          linkTo="/admin/contents"
          linkLabel="Kelola Konten"
        />

        {/* 3. New Submissions */}
        <StatCard
          title="Form Minat Baru"
          icon={<UserCheck className="w-4 h-4" />}
          fetcher={async () => {
            if (!env.isSupabaseConfigured) {
              const list = await getAllSubmissionsAdmin();
              const newCount = list.filter((s) => s.status === 'baru' || s.status === 'new').length;
              return { main: newCount, sub: `dari ${list.length} total pengajuan` };
            }

            const { data: newInterestRows, error: newInterestError } = await supabase
              .from("interest_submissions")
              .select("id")
              .eq("submission_status", "new");

            const { count: totalCount, error: totalErr } = await supabase
              .from('interest_submissions')
              .select('*', { count: 'exact', head: true });

            if (newInterestError || totalErr) {
              const queryError = newInterestError || totalErr;
              console.error("[AdminDashboard] query result", {
                resource: "interest_submissions",
                errorCode: queryError?.code || null,
                errorMessage: queryError?.message || null,
              });
              throw queryError;
            }

            const newInterestCount = Array.isArray(newInterestRows) ? newInterestRows.length : 0;

            return {
              main: newInterestCount,
              sub: `dari ${typeof totalCount === 'number' ? totalCount : 0} total pengajuan`
            };
          }}
          linkTo="/admin/submissions"
          linkLabel="Tinjau Form Minat"
        />

        {/* 4. Unread Messages */}
        <StatCard
          title="Pesan Kontak Baru"
          icon={<Mail className="w-4 h-4" />}
          fetcher={async () => {
            if (!env.isSupabaseConfigured) {
              const list = await getAllMessagesAdmin();
              const unread = list.filter((m) => m.status === 'baru' || m.status === 'unread').length;
              return { main: unread, sub: `dari ${list.length} total pesan` };
            }

            const { data: unreadContactRows, error: unreadContactError } = await supabase
              .from("contact_messages")
              .select("id")
              .eq("message_status", "unread");

            const { count: totalCount, error: totalErr } = await supabase
              .from('contact_messages')
              .select('*', { count: 'exact', head: true });

            if (unreadContactError || totalErr) {
              const queryError = unreadContactError || totalErr;
              console.error("[AdminDashboard] query result", {
                resource: "contact_messages",
                errorCode: queryError?.code || null,
                errorMessage: queryError?.message || null,
              });
              throw queryError;
            }

            const unreadContactCount = Array.isArray(unreadContactRows) ? unreadContactRows.length : 0;

            return {
              main: unreadContactCount,
              sub: `dari ${typeof totalCount === 'number' ? totalCount : 0} total pesan`
            };
          }}
          linkTo="/admin/messages"
          linkLabel="Baca Pesan Masuk"
        />

        {/* 5. Total Chatbot Sessions */}
        <StatCard
          title="Session Chatbot"
          icon={<Bot className="w-4 h-4" />}
          fetcher={async () => {
            const stats = await getChatbotStats();
            return { main: stats.totalSessions, sub: `${stats.totalMessages} total pesan tercatat` };
          }}
          linkTo="/admin/chatbot"
          linkLabel="Analitik MudaBot"
        />

        {/* 6. Chatbot Fallback Usage */}
        <StatCard
          title="MudaBot Fallback Digunakan"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          fetcher={async () => {
            const stats = await getChatbotStats();
            return { main: stats.fallbackUsedCount, sub: `${stats.primaryModelSuccessCount} sukses model utama` };
          }}
          linkTo="/admin/chatbot"
          linkLabel="Detail Respons Bot"
        />

        {/* 7. Knowledge Not Found */}
        <StatCard
          title="Pertanyaan Tanpa Jawaban"
          icon={<HelpCircle className="w-4 h-4 text-rose-600" />}
          fetcher={async () => {
            const stats = await getChatbotStats();
            return { main: stats.knowledgeNotFoundCount, sub: 'Knowledge base tidak ditemukan' };
          }}
          linkTo="/admin/chatbot"
          linkLabel="Evaluasi Knowledge Base"
        />
      </div>

      {/* Recent Activity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Latest Interest Submissions */}
        <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1D4E89]" />
                5 Form Minat Terbaru
              </h2>
            </div>

            {loadingSubmissions ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : errorSubmissions ? (
              <p className="text-xs text-rose-500 py-2">Gagal memuat pengajuan minat terbaru.</p>
            ) : submissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Belum ada pengajuan minat.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <div key={sub.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#102A43] block truncate">{sub.full_name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{sub.program_title_snapshot}</span>
                    </div>
                    <Badge variant={(sub.status || 'baru') === 'baru' || (sub.status || '') === 'new' ? 'warning' : 'slate'} size="sm">
                      {((sub.status || '') === 'new' ? 'BARU' : ((sub.status || '') === 'reviewed' ? 'DITINJAU' : ((sub.status || '') === 'contacted' ? 'DIHUBUNGI' : (sub.status || 'baru')))).toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/admin/submissions" className="text-xs text-[#1D4E89] font-bold hover:underline block text-center pt-2 border-t">
            Lihat Semua Form Minat &rarr;
          </Link>
        </div>

        {/* 2. Latest Contact Messages */}
        <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1D4E89]" />
                5 Pesan Kontak Terbaru
              </h2>
            </div>

            {loadingMessages ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : errorMessages ? (
              <p className="text-xs text-rose-500 py-2">Gagal memuat pesan kontak terbaru.</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Belum ada pesan kontak.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <div key={msg.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#102A43] block truncate">{msg.full_name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{msg.subject}</span>
                    </div>
                    <Badge variant={(msg.status || 'baru') === 'baru' || (msg.status || '') === 'unread' ? 'error' : 'slate'} size="sm">
                      {((msg.status || '') === 'unread' ? 'BARU' : ((msg.status || '') === 'read' ? 'DIBACA' : ((msg.status || '') === 'replied' ? 'DIBALAS' : (msg.status || 'baru')))).toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/admin/messages" className="text-xs text-[#1D4E89] font-bold hover:underline block text-center pt-2 border-t">
            Lihat Semua Pesan &rarr;
          </Link>
        </div>

        {/* 3. Latest Chatbot Sessions */}
        <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#1D4E89]" />
                5 Sesi Chatbot Terbaru
              </h2>
            </div>

            {loadingSessions ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : errorSessions ? (
              <p className="text-xs text-rose-500 py-2">Gagal memuat sesi chatbot terbaru.</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Belum ada sesi chatbot tercatat.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <div key={sess.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#102A43] block truncate">
                        Sesi: {sess.session_id ? sess.session_id.substring(0, 16) : 'Anonim'}...
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {formatDateIndonesian(sess.created_at)}
                      </span>
                    </div>
                    <Badge variant={sess.used_fallback_count > 0 ? 'warning' : 'primary'} size="sm">
                      {sess.message_count || 0} Pesan
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/admin/chatbot" className="text-xs text-[#1D4E89] font-bold hover:underline block text-center pt-2 border-t">
            Inspeksi Sesi MudaBot &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
