import React, { useState } from 'react';
import { Link } from 'react-router';
import { requestPasswordReset } from '../../services/supabase/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { AdminSeo } from '../../components/seo/AdminSeo';
import { ShieldCheck, Mail, ArrowLeft, Send } from 'lucide-react';

export const AdminForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg('Silakan masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestPasswordReset(trimmedEmail);
      setIsLoading(false);
      setSuccessMsg(result.message);
    } catch (err) {
      setIsLoading(false);
      // Fallback generic message to prevent account enumeration
      setSuccessMsg(
        'Jika email tersebut terdaftar, tautan pemulihan telah dikirim. Periksa kotak masuk dan folder spam.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
      <AdminSeo title="Pemulihan kata sandi admin" />
      <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-8 space-y-6 border border-[#DEDCD6]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded bg-[#1D4E89] text-white flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-[#17212B]">
            Lupa Password Admin
          </h1>
          <p className="text-xs text-[#5E6872]">
            Masukkan email terdaftar Anda untuk menerima tautan pemulihan kata sandi.
          </p>
        </div>

        {errorMsg && <Alert type="error">{errorMsg}</Alert>}
        {successMsg && <Alert type="success">{successMsg}</Alert>}

        {!successMsg ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Alamat Email Admin"
              type="email"
              placeholder="admin@mudaconnect.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              leftIcon={<Mail className="w-4 h-4 text-[#5E6872]" />}
            />

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Kirim Tautan Pemulihan
              </Button>

              <div className="text-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4E89] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Login</span>
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-2">
            <Button asChild variant="outline" size="lg" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              <Link to="/admin/login" className="block">
                Kembali ke Halaman Login
              </Link>
            </Button>
          </div>
        )}

        <div className="text-center text-[11px] text-[#5E6872] pt-2 border-t border-[#DEDCD6]">
          MudaConnect &copy; 2026
        </div>
      </div>
    </div>
  );
};
