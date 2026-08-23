import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import {
  Clock,
  RefreshCw,
  LogOut,
  Home,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { status, sessionError, retryCheck, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const goToHome = () => {
    navigate('/');
  };

  const goToLogin = () => {
    navigate('/admin/login');
  };

  // 1. Loading State
  if (status === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-8 h-8 border-4 border-[#2F6B5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Memeriksa sesi pengelola…
          </span>
        </div>
      </div>
    );
  }

  // 2. Slow Connection State
  if (status === 'SLOW_CONNECTION') {
    return (
      <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-6 space-y-4 border border-[#DEDCD6] text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#17212B]">
            Pemeriksaan sesi memerlukan waktu lebih lama dari biasanya.
          </h2>
          <p className="text-xs text-[#5E6872]">
            Koneksi ke server lambat. Anda dapat menunggu, atau mencoba lagi.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={retryCheck}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Coba Lagi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLogin}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali ke Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Session Error or Profile Query Error State
  if (status === 'SESSION_ERROR' || status === 'PROFILE_QUERY_ERROR') {
    return (
      <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-6 space-y-4 border border-[#DEDCD6] text-center">
          <Alert type="error">
            {sessionError || (status === 'PROFILE_QUERY_ERROR' ? 'Profil pengelola gagal dimuat.' : 'Terjadi kesalahan saat memeriksa sesi autentikasi.')}
          </Alert>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={retryCheck}
              className="w-full"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Coba Lagi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLogin}
              className="w-full"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali ke Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Missing Profile State
  if (status === 'PROFILE_MISSING') {
    return (
      <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-6 space-y-4 border border-[#DEDCD6] text-center">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#17212B]">Profil Pengelola Tidak Ditemukan</h2>
          <p className="text-xs text-[#5E6872] leading-relaxed">
            {sessionError || 'Profil pengelola belum terhubung dengan akun Auth ini.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4 text-rose-600" />}
            >
              Keluar
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={goToHome}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Kembali ke Halaman Utama
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Inactive Account State
  if (status === 'PROFILE_INACTIVE') {
    return (
      <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-6 space-y-4 border border-[#DEDCD6] text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#17212B]">Akun Pengelola Tidak Aktif</h2>
          <p className="text-xs text-[#5E6872] leading-relaxed">
            Akun pengelola sedang tidak aktif.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4 text-rose-600" />}
            >
              Keluar
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={goToHome}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Kembali ke Halaman Utama
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Unauthorized Role State
  if (status === 'UNAUTHORIZED_ROLE') {
    return (
      <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-6 space-y-4 border border-[#DEDCD6] text-center">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#17212B]">Akses Ditolak</h2>
          <p className="text-xs text-[#5E6872] leading-relaxed">
            Akun ini tidak memiliki akses ke dashboard pengelola.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4 text-rose-600" />}
            >
              Keluar
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={goToHome}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Kembali ke Halaman Utama
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 7. Unauthenticated State -> Redirect to Login
  if (status === 'UNAUTHENTICATED') {
    return <Navigate to="/admin/login" replace />;
  }

  // 8. Authorized State
  return <Outlet />;
};

