import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { AdminSeo } from '../../components/seo/AdminSeo';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { loginAdmin } from '../../services/supabase/auth';
import { env } from '../../services/supabase/env';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isPortalReady = env.isSupabaseConfigured || env.isDemoAdminEnabled;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const result = await loginAdmin(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setErrorMsg(result.error || 'Email atau kata sandi tidak valid.');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@mudaconnect.ai');
    setPassword('demo123');
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#eef4f0] p-4 sm:p-6">
      <AdminSeo title="Masuk portal pengelola" />
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#d8ed80]/50 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#087f72]/18 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative grid w-full max-w-[980px] overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(11,32,51,.16)] lg:grid-cols-[.9fr_1.1fr]">
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#0b2033] p-10 text-white lg:flex">
          <div className="surface-grid pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#087f72] blur-[90px]"
            aria-hidden="true"
          />

          <Link to="/" className="relative w-fit rounded-xl" aria-label="Kembali ke MudaConnect">
            <BrandLogo inverse className="h-auto w-[180px] object-contain" />
          </Link>

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d8ed80]/25 bg-[#d8ed80]/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d8ed80]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Ruang kerja pengelola
            </span>
            <h2 className="text-balance mt-6 text-4xl font-bold leading-tight">
              Kelola peluang dengan data yang lebih rapi.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/62">
              Tinjau program, formulir minat, pesan, konten, dan MudaBot dari satu
              dashboard terpadu.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs font-semibold text-white/48">
            <ShieldCheck className="h-4 w-4 text-[#d8ed80]" aria-hidden="true" />
            Akses khusus pengelola terverifikasi
          </div>
        </section>

        <section className="flex min-h-[650px] flex-col justify-center p-6 sm:p-10 lg:p-12">
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-2 text-xs font-bold text-[#63717b] hover:text-[#087f72] lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke situs
          </Link>

          <div className="mx-auto w-full max-w-md">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3ea] text-[#087f72]">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.15em] text-[#087f72]">
                Portal admin
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#0b2033]">Selamat datang kembali.</h1>
              <p className="mt-3 text-sm leading-6 text-[#63717b]">
                Masuk dengan akun pengelola MudaConnect.
              </p>
            </div>

            <div className="mt-7 space-y-4">
              {env.isDemoAdminEnabled && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
                  <div className="flex items-center gap-2 font-extrabold">
                    <Info className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    Mode demo lokal
                  </div>
                  <p className="mt-2 leading-5 text-amber-900/75">
                    Gunakan akun demo hanya untuk menguji antarmuka di perangkat ini.
                  </p>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="mt-3 font-extrabold text-[#0b2033] underline decoration-amber-400 underline-offset-4"
                  >
                    Isi kredensial demo
                  </button>
                </div>
              )}

              {!env.isSupabaseConfigured && !env.isDemoAdminEnabled && (
                <Alert type="warning" title="Portal admin belum aktif">
                  Hubungkan Supabase melalui konfigurasi lingkungan. Mode demo sengaja
                  dibatasi hanya untuk pengembangan lokal.
                </Alert>
              )}

              {errorMsg && <Alert type="error">{errorMsg}</Alert>}
            </div>

            <form onSubmit={handleLogin} className="mt-7 space-y-5">
              <Input
                label="Alamat email"
                type="email"
                autoComplete="username"
                placeholder="admin@organisasi.id"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={!isPortalReady}
                leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
              />

              <div>
                <Input
                  label="Kata sandi"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={!isPortalReady}
                  leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
                />
                {env.isSupabaseConfigured && (
                  <div className="mt-2 flex justify-end">
                    <Link
                      to="/admin/forgot-password"
                      className="text-xs font-extrabold text-[#087f72] hover:text-[#0b2033]"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!isPortalReady}
                className="w-full rounded-2xl"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Masuk ke dashboard
              </Button>
            </form>

            <p className="mt-8 border-t border-[#e8eeea] pt-5 text-center text-[11px] leading-5 text-[#84918a]">
              Dengan masuk, Anda menyatakan memiliki wewenang untuk mengelola data
              MudaConnect.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
