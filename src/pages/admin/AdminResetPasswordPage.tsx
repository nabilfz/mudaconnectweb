import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../services/supabase/client';
import { env } from '../../services/supabase/env';
import { updatePassword } from '../../services/supabase/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { AdminSeo } from '../../components/seo/AdminSeo';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, RefreshCw, LogIn } from 'lucide-react';

export const AdminResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isValidRecoverySession, setIsValidRecoverySession] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let recoveryEventTriggered = false;

    // Check URL query/hash parameters
    const hash = window.location.hash;
    const search = window.location.search;
    const hasRecoveryParams =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      search.includes('code=');

    // In demo mode when Supabase credentials aren't configured
    if (!env.isSupabaseConfigured) {
      if (isMounted) {
        setIsValidRecoverySession(true);
        setIsCheckingSession(false);
      }
      return;
    }

    // Register auth state listener for PASSWORD_RECOVERY
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryEventTriggered = true;
        if (isMounted) {
          setIsValidRecoverySession(true);
          setIsCheckingSession(false);
        }
      } else if (session && hasRecoveryParams) {
        recoveryEventTriggered = true;
        if (isMounted) {
          setIsValidRecoverySession(true);
          setIsCheckingSession(false);
        }
      }
    });

    // Verify current session
    async function verifyRecoverySession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          if (data.session && (recoveryEventTriggered || hasRecoveryParams)) {
            setIsValidRecoverySession(true);
          } else if (!recoveryEventTriggered) {
            setIsValidRecoverySession(false);
          }
        }
      } catch (err) {
        if (isMounted) setIsValidRecoverySession(false);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    const timer = setTimeout(() => {
      verifyRecoverySession();
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    const result = await updatePassword(newPassword);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      // Ensure session is signed out so user must log in again
      if (env.isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } else {
      setErrorMsg(result.error || 'Gagal memperbarui password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
      <AdminSeo title="Atur ulang kata sandi admin" />
      <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-8 space-y-6 border border-[#DEDCD6]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded bg-[#1D4E89] text-white flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-[#17212B]">
            Setel Ulang Password Admin
          </h1>
          <p className="text-xs text-[#5E6872]">
            MudaConnect Pemulihan Kata Sandi Akun Admin
          </p>
        </div>

        {/* 1. Loading State */}
        {isCheckingSession && (
          <div className="py-8 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#1D4E89] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#5E6872]">
              Memverifikasi sesi pemulihan kata sandi...
            </p>
          </div>
        )}

        {/* 2. Invalid or Expired Session State */}
        {!isCheckingSession && !isValidRecoverySession && (
          <div className="space-y-4 text-center">
            <Alert type="error">
              Tautan pemulihan tidak valid atau telah kedaluwarsa.
            </Alert>
            <p className="text-xs text-[#5E6872] leading-relaxed">
              Silakan minta tautan pemulihan baru atau kembali ke halaman masuk.
            </p>
            <div className="space-y-2 pt-2">
              <Button asChild variant="primary" size="lg" className="w-full" leftIcon={<RefreshCw className="w-4 h-4" />}>
                <Link to="/admin/forgot-password" className="block">
                  Kirim Ulang Tautan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
                <Link to="/admin/login" className="block">
                  Kembali ke Login
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* 3. Valid Session - Password Update Success State */}
        {!isCheckingSession && isValidRecoverySession && isSuccess && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-800">
                Password berhasil diperbarui. Silakan masuk kembali.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/admin/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Ke Halaman Login Admin
              </Button>
            </div>
          </div>
        )}

        {/* 4. Valid Session - Password Form */}
        {!isCheckingSession && isValidRecoverySession && !isSuccess && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {errorMsg && <Alert type="error">{errorMsg}</Alert>}

            {/* New Password Input */}
            <div className="relative">
              <Input
                label="Password Baru"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMsg(null);
                }}
                required
                disabled={isLoading}
                leftIcon={<Lock className="w-4 h-4 text-[#5E6872]" />}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
                title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Input
                label="Konfirmasi Password Baru"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMsg(null);
                }}
                required
                disabled={isLoading}
                leftIcon={<Lock className="w-4 h-4 text-[#5E6872]" />}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
                title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-[11px] text-[#5E6872] space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-700">Ketentuan Password:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                <li className={newPassword.length >= 8 ? 'text-emerald-700 font-bold' : ''}>
                  Minimal 8 karakter
                </li>
                <li className={confirmPassword && newPassword === confirmPassword ? 'text-emerald-700 font-bold' : ''}>
                  Konfirmasi password harus cocok
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Simpan Password Baru
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-[11px] text-[#5E6872] pt-2 border-t border-[#DEDCD6]">
          MudaConnect &copy; 2026
        </div>
      </div>
    </div>
  );
};
