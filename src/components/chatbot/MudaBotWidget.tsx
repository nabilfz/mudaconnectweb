import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router';
import { X, Send, HelpCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  sendChatMessage,
  isChatbotConfigured,
  getChatSessionId,
} from '../../services/n8n/chat';
import { ChatSource } from '../../types';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { BrandLogo } from '../brand/BrandLogo';

interface MessageUI {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sources?: ChatSource[];
  usedFallback?: boolean;
  needsHumanSupport?: boolean;
  isError?: boolean;
  retryText?: string;
  timestamp: string;
}

export const MudaBotWidget: React.FC = () => {
  const isConfigured = isChatbotConfigured();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<MessageUI[]>(() =>
    isConfigured
      ? [
          {
            id: 'welcome-msg',
            sender: 'bot',
            text: 'Halo! Saya MudaBot, asisten informasi MudaConnect. Ada yang ingin kamu tanyakan mengenai program, kegiatan, atau cara pengisian formulir minat?',
            timestamp: new Date().toISOString(),
          },
        ]
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Program apa saja yang tersedia?',
    'Bagaimana cara mengisi form minat?',
    'Apakah program berbayar?',
    'Apa perbedaan form minat dan pendaftaran?',
    'Bagaimana menghubungi pengelola?',
  ]);
  const [cooldown, setCooldown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cooldownTimerRef = useRef<number | null>(null);
  const titleId = React.useId();
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, () => setIsOpen(false));
  const location = useLocation();

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current !== null) {
        window.clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading || cooldown) return;

    if (text.length > 500) {
      setValidationError('Pesan terlalu panjang. Maksimal 500 karakter.');
      return;
    }
    setValidationError(null);

    const sessionId = getChatSessionId();
    const userMsg: MessageUI = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    // Cooldown 1.5s to prevent rapid spamming
    setCooldown(true);
    if (cooldownTimerRef.current !== null) {
      window.clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = window.setTimeout(() => {
      setCooldown(false);
      cooldownTimerRef.current = null;
    }, 1500);

    try {
      const response = await sendChatMessage({
        sessionId,
        message: text,
        pageContext: location.pathname,
        timestamp: new Date().toISOString(),
      });

      const botMsg: MessageUI = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.answer,
        sources: response.sources,
        usedFallback: response.usedFallback,
        needsHumanSupport: response.needsHumanSupport,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
        setSuggestedQuestions(response.suggestedQuestions.slice(0, 3));
      }
    } catch {
      const errorMsg: MessageUI = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: 'Maaf, MudaBot sedang mengalami gangguan. Silakan coba kembali atau lihat halaman FAQ.',
        isError: true,
        retryText: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Branded Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center border border-[#071f32]/20 bg-[#fbfaf6] text-[#071f32] shadow-[0_10px_24px_rgba(7,31,50,.16)] transition-colors hover:bg-[#d8f05c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007d6f] sm:bottom-5 sm:right-5"
          aria-label="Buka MudaBot"
          aria-controls="mudabot-dialog"
          title="Tanya MudaBot"
        >
          <BrandLogo
            variant="icon"
            decorative
            className="h-6 w-6 shrink-0 object-contain"
          />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          id="mudabot-dialog"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden border border-[#cfcac0] bg-white font-sans shadow-[0_24px_70px_rgba(11,32,51,.24)] transition-all duration-200 sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[590px] sm:w-[390px] sm:rounded-[4px] md:w-[420px]"
        >
          {/* Header */}
          <div className="bg-[#0D1B3D] text-white p-4 flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <BrandLogo
                variant="icon"
                decorative
                className="h-7 w-7 rounded-[4px] bg-white/10 p-1 object-contain"
              />
              <div>
                <h3 id={titleId} className="font-bold text-sm leading-tight font-serif text-white">
                  MudaBot
                </h3>
                <p className="text-[11px] text-[#DFF5EF]/80 font-sans">Asisten Informasi MudaConnect</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-[4px] transition-colors cursor-pointer"
              aria-label="Tutup Chatbot"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Availability notice or active chat UI */}
          {!isConfigured ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-[#FAF8F3]">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h4 className="font-bold text-sm text-[#17212B] font-display">MudaBot Belum Aktif</h4>
                <p className="text-xs text-[#5E6872] leading-relaxed font-normal">
                  Layanan sementara tidak tersedia.
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-3">
                <Link
                  to="/faq"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-[#17324D] text-white text-xs font-semibold rounded-[8px] hover:bg-[#102133] transition-colors inline-block"
                >
                  Lihat FAQ
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-[#DEDCD6] text-[#17212B] text-xs font-semibold rounded-[8px] hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#F7F5F0] border-b border-[#DEDCD6] px-3 py-1.5 text-[11px] text-[#5E6872] flex items-center gap-1.5 shrink-0">
                <span>Jawaban berdasarkan informasi program dan FAQ MudaConnect.</span>
              </div>

              {/* Messages Container */}
              <div
                className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F7F5F0]/60"
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-[12px] px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#17324D] text-white rounded-br-none'
                          : 'bg-white text-[#17212B] border border-[#DEDCD6] rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Fallback Badge */}
                      {msg.usedFallback && (
                        <div className="mt-2 pt-1.5 border-t border-[#DEDCD6] flex items-center gap-1 text-[10px] text-[#5E6872]">
                          <RefreshCw className="w-3 h-3 text-[#E89A3D]" />
                          <span>Sistem cadangan digunakan</span>
                        </div>
                      )}

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-[#DEDCD6] space-y-1">
                          <p className="text-[10px] font-bold text-[#5E6872] uppercase tracking-wider">
                            Sumber Informasi:
                          </p>
                          {msg.sources.map((src, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] text-[#17324D] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#DEDCD6] flex items-center gap-1"
                            >
                              <HelpCircle className="w-3 h-3 shrink-0 text-[#2F6B5F]" />
                              <span className="truncate">{src.title}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Human Support CTA Buttons */}
                      {msg.needsHumanSupport && !msg.isError && (
                        <div className="mt-2.5 pt-2 border-t border-[#DEDCD6] flex flex-wrap gap-2">
                          <Link
                            to="/kontak"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#17324D] text-white text-[11px] font-semibold rounded hover:bg-[#102133] transition-colors"
                          >
                            Buka Halaman Kontak
                          </Link>
                          <Link
                            to="/faq"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-[#17212B] text-[11px] font-semibold rounded hover:bg-slate-200 transition-colors"
                          >
                            Lihat FAQ
                          </Link>
                        </div>
                      )}

                      {/* Error State Action Buttons */}
                      {msg.isError && (
                        <div className="mt-2.5 pt-2 border-t border-[#DEDCD6] flex flex-wrap items-center gap-2">
                          {msg.retryText && (
                            <button
                              type="button"
                              onClick={() => handleSendMessage(msg.retryText)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#17324D] text-white text-[11px] font-semibold rounded hover:bg-[#102133] transition-colors cursor-pointer"
                            >
                              Coba lagi
                            </button>
                          )}
                          <Link
                            to="/faq"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-[#17212B] text-[11px] font-semibold rounded hover:bg-slate-200 transition-colors"
                          >
                            Lihat FAQ
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#DEDCD6] rounded-[12px] rounded-bl-none px-3.5 py-2.5 text-xs text-[#5E6872] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#17324D] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#2F6B5F] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#E89A3D] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="ml-1 text-[11px]">Memproses jawaban...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {suggestedQuestions.length > 0 && !isLoading && (
                <div className="p-2 bg-white border-t border-[#DEDCD6] shrink-0">
                  <p className="text-[10px] font-medium text-[#5E6872] mb-1 px-1">
                    Pertanyaan Rekomendasi:
                  </p>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                    {suggestedQuestions.slice(0, 3).map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="px-2 py-0.5 bg-[#F7F5F0] hover:bg-[#17324D]/10 hover:text-[#17324D] text-[#17212B] text-[11px] font-medium rounded border border-[#DEDCD6] whitespace-nowrap transition-colors cursor-pointer shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Box */}
              <div className="p-3 bg-white border-t border-[#DEDCD6] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    aria-label="Pesan untuk MudaBot"
                    aria-invalid={Boolean(validationError)}
                    aria-describedby={validationError ? 'mudabot-input-error' : 'mudabot-input-hint'}
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Ketik pertanyaanmu di sini..."
                    maxLength={500}
                    disabled={isLoading}
                    className="flex-1 bg-[#F7F5F0] border border-[#DEDCD6] rounded px-3 py-1.5 text-xs text-[#17212B] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#17324D] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading || cooldown}
                    className="w-8 h-8 rounded bg-[#17324D] text-white flex items-center justify-center hover:bg-[#102133] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
                    aria-label="Kirim Pesan"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px]">
                  <span
                    id={validationError ? 'mudabot-input-error' : 'mudabot-input-hint'}
                    className={validationError ? 'font-semibold text-rose-700' : 'text-[#69747b]'}
                    role={validationError ? 'alert' : undefined}
                  >
                    {validationError ?? 'Hindari mengirim data pribadi atau sensitif.'}
                  </span>
                  <span className="shrink-0 text-[#69747b]" aria-hidden="true">
                    {inputMessage.length}/500
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
