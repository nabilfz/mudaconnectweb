import React, { useState, useEffect } from 'react';
import {
  getChatbotStats,
  getChatSessionsAdmin,
  getChatSessionMessagesAdmin,
} from '../../services/supabase/chatbot';
import { getChatbotSettings, updateChatbotSettings } from '../../services/supabase/settings';
import { ChatSession, ChatMessage } from '../../types';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { DataTable, Column } from '../../components/ui/DataTable';
import { formatDateIndonesian } from '../../utils/formatters';
import {
  Bot,
  Save,
  Plus,
  X,
  Workflow,
  HelpCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  Settings,
  BarChart3,
} from 'lucide-react';

export const AdminChatbotPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'sessions' | 'settings'>('analytics');

  // Stats
  const [stats, setStats] = useState<{
    totalSessions: number;
    totalMessages: number;
    userMessagesCount: number;
    assistantMessagesCount: number;
    avgResponseTimeMs: number | null;
    primaryModelSuccessCount: number;
    fallbackUsedCount: number;
    knowledgeNotFoundCount: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [loadingSessionMessages, setLoadingSessionMessages] = useState(false);

  // Settings
  const [botName, setBotName] = useState('MudaBot');
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [fallbackAnswer, setFallbackAnswer] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQ, setNewQ] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      try {
        const data = await getChatbotStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load chatbot stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }

    async function loadSessions() {
      setLoadingSessions(true);
      try {
        const list = await getChatSessionsAdmin(50);
        setSessions(list);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    }

    async function loadSettings() {
      try {
        const data = await getChatbotSettings();
        setBotName(data.bot_name);
        setWelcomeMsg(data.welcome_message);
        setFallbackAnswer(data.fallback_answer);
        setQuestions(data.suggested_questions || []);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }

    loadStats();
    loadSessions();
    loadSettings();
  }, []);

  const openSessionDetail = async (session: ChatSession) => {
    setSelectedSession(session);
    setLoadingSessionMessages(true);
    try {
      const msgs = await getChatSessionMessagesAdmin(session.session_id);
      setSessionMessages(msgs);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    } finally {
      setLoadingSessionMessages(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSuccessMsg(null);

    const updated = await updateChatbotSettings({
      bot_name: botName,
      welcome_message: welcomeMsg,
      fallback_answer: fallbackAnswer,
      n8n_webhook_url: '/api/chat',
      suggested_questions: questions,
      is_enabled: true,
      model_name: 'gemini-1.5-flash',
    });

    setIsSavingSettings(false);
    if (updated) {
      setSuccessMsg('Pengaturan MudaBot berhasil diperbarui!');
    }
  };

  const sessionColumns: Column<ChatSession>[] = [
    {
      header: 'ID Sesi Anonim',
      accessor: (row) => {
        const idStr = row.session_id || row.id;
        const shortened = idStr.length > 16 ? `${idStr.substring(0, 6)}...${idStr.substring(idStr.length - 4)}` : idStr;
        return (
          <span className="font-mono text-xs font-bold text-[#102A43]">
            {shortened}
          </span>
        );
      },
    },
    {
      header: 'Konteks Halaman',
      accessor: (row) => row.page_context || 'Portal Utama',
    },
    {
      header: 'Mulai Sesi',
      accessor: (row) => formatDateIndonesian(row.created_at),
    },
    {
      header: 'Total Pesan',
      accessor: (row) => (
        <Badge variant="primary" size="sm">
          {row.message_count || 0} Pesan
        </Badge>
      ),
    },
    {
      header: 'Status Engine',
      accessor: (row) => (
        <Badge variant={row.used_fallback_count > 0 ? 'warning' : 'success'} size="sm">
          {row.used_fallback_count > 0 ? 'Menggunakan Fallback' : 'Model Utama (n8n)'}
        </Badge>
      ),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openSessionDetail(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Inspeksi Percakapan
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
            <Bot className="w-5 h-5 text-[#1D4E89]" />
            Analitik & Inspeksi MudaBot AI
          </h1>
          <p className="text-xs text-slate-500">
            Pantau statistik penggunaan, riwayat sesi percakapan anonim, dan atur respons bot.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#1D4E89] text-[#1D4E89]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Metrik & Analitik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'sessions'
              ? 'border-[#1D4E89] text-[#1D4E89]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Sesi Percakapan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#1D4E89] text-[#1D4E89]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Bot</span>
        </button>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sessions */}
            <Card className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Sesi Chatbot</span>
              <div className="text-2xl font-black text-[#102A43]">
                {loadingStats ? '...' : stats?.totalSessions || 0}
              </div>
              <span className="text-[11px] text-slate-500">Sesi percakapan terdaftar</span>
            </Card>

            {/* Total Messages */}
            <Card className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Pesan Pengguna & Asisten</span>
              <div className="text-2xl font-black text-[#102A43] flex items-center gap-2">
                {loadingStats ? '...' : stats?.totalMessages || 0}
              </div>
              <span className="text-[11px] text-slate-500">
                {stats?.userMessagesCount || 0} User / {stats?.assistantMessagesCount || 0} Asisten
              </span>
            </Card>

            {/* Model vs Fallback */}
            <Card className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Penggunaan Fallback</span>
              <div className="text-2xl font-black text-amber-600">
                {loadingStats ? '...' : stats?.fallbackUsedCount || 0}
              </div>
              <span className="text-[11px] text-slate-500">
                {stats?.primaryModelSuccessCount || 0} pesan dari model utama
              </span>
            </Card>

            {/* Response Time */}
            <Card className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Rata-rata Waktu Respons</span>
              <div className="text-2xl font-black text-[#102A43]">
                {loadingStats ? '...' : stats?.avgResponseTimeMs !== null && stats?.avgResponseTimeMs !== undefined ? `${stats.avgResponseTimeMs} ms` : 'Belum tercatat'}
              </div>
              <span className="text-[11px] text-slate-500">Waktu proses sistem</span>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[18px] border border-[#E2E8F0] space-y-2 shadow-xs">
              <h3 className="text-xs font-bold text-[#102A43] flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                RESPONS MODEL UTAMA
              </h3>
              <p className="text-2xl font-black text-emerald-700">
                {loadingStats ? '...' : stats?.primaryModelSuccessCount || 0}
              </p>
              <p className="text-xs text-slate-500">
                Telah diproses melalui webhook n8n atau model utama yang aktif.
              </p>
            </div>

            <div className="bg-white p-5 rounded-[18px] border border-[#E2E8F0] space-y-2 shadow-xs">
              <h3 className="text-xs font-bold text-[#102A43] flex items-center gap-2 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-rose-600" />
                Knowledge Base Tidak Ditemukan
              </h3>
              <p className="text-2xl font-black text-rose-600">
                {loadingStats ? '...' : stats?.knowledgeNotFoundCount || 0} Pertanyaan
              </p>
              <p className="text-xs text-slate-500">
                Pengguna menanyakan hal yang belum tercakup di FAQ atau database program.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden shadow-xs">
          <DataTable
            columns={sessionColumns}
            data={sessions}
            keyExtractor={(row) => row.id}
            isLoading={loadingSessions}
            emptyMessage="Belum ada sesi percakapan chatbot."
          />
        </div>
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-[22px] border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-xs">
          {successMsg && <Alert type="success">{successMsg}</Alert>}

          <div className="bg-[#102A43] text-white p-4 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Workflow className="w-4 h-4" />
              <span>Arsitektur Webhook MudaBot</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Integrasi MudaBot terhubung langsung ke webhook n8n yang dikonfigurasi melalui environment variable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Nama Asisten Chatbot"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Pesan Salam Pembuka"
            rows={3}
            value={welcomeMsg}
            onChange={(e) => setWelcomeMsg(e.target.value)}
            required
          />

          <Textarea
            label="Pesan Jawaban Cadangan (Fallback)"
            rows={3}
            value={fallbackAnswer}
            onChange={(e) => setFallbackAnswer(e.target.value)}
            required
          />

          <div className="space-y-3 pt-4 border-t">
            <label className="text-xs font-bold text-[#102A43] block">
              Daftar Pertanyaan Rekomendasi
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Tambah pertanyaan rekomendasi..."
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newQ.trim()) {
                    setQuestions([...questions, newQ.trim()]);
                    setNewQ('');
                  }
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Tambah
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {questions.map((q, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-300 flex items-center gap-2"
                >
                  {q}
                  <button
                    type="button"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    className="p-0.5 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSavingSettings}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Simpan Pengaturan MudaBot
            </Button>
          </div>
        </form>
      )}

      {/* Session Inspector Drawer */}
      <Drawer
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        title="Inspeksi Percakapan Sesi Chatbot"
      >
        {selectedSession && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold block text-slate-500">Session Key Anonim:</span>
              <span className="font-mono font-bold text-[#102A43]">{selectedSession.session_id}</span>
              <div className="text-[11px] text-slate-500 pt-1">
                Waktu Mulai: {formatDateIndonesian(selectedSession.created_at)}
              </div>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-xs text-[#102A43] uppercase tracking-wider block">
                Riwayat Pesan Kronologis
              </span>

              {loadingSessionMessages ? (
                <div className="space-y-2 py-4">
                  <div className="h-10 bg-slate-100 rounded animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : sessionMessages.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Belum ada rincian pesan dalam sesi ini.</p>
              ) : (
                <div className="space-y-3">
                  {sessionMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        msg.role === 'user'
                          ? 'bg-blue-50/70 border-blue-200 text-slate-800 ml-4'
                          : 'bg-slate-50 border-slate-200 text-slate-900 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>{msg.role === 'user' ? 'Pengguna' : 'MudaBot AI'}</span>
                        <span>{formatDateIndonesian(msg.created_at)}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.role !== 'user' && (
                        <div className="pt-1.5 flex flex-wrap gap-2 text-[10px] border-t border-slate-200/60 mt-2">
                          <span className="text-slate-500">Engine: {msg.used_fallback ? 'Fallback' : 'n8n/Model'}</span>
                          {msg.knowledge_found !== undefined && (
                            <span className={msg.knowledge_found ? 'text-emerald-700' : 'text-rose-600'}>
                              Knowledge: {msg.knowledge_found ? 'Ditemukan' : 'Tidak Ditemukan'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
