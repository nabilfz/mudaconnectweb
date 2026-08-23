import { supabase } from './client';
import { env } from './env';
import { Profile } from '../../types';
import { DEMO_PROFILES } from './demoData';

export async function getCurrentUserProfile(userId: string): Promise<Profile | null> {
  if (!env.isSupabaseConfigured) {
    return env.isDemoAdminEnabled ? DEMO_PROFILES[0] : null;
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_active')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      return null;
    }

    return {
      id: profile.id,
      email: userData.user?.email || '',
      full_name: profile.full_name,
      role: profile.role,
      is_active: profile.is_active,
    };
  } catch (err) {
    return null;
  }
}

export async function loginAdmin(
  emailVal: string,
  passVal: string
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  // Demo mode fallback when Supabase credentials are missing
  if (!env.isSupabaseConfigured) {
    if (!env.isDemoAdminEnabled) {
      return {
        success: false,
        error: 'Portal admin belum dikonfigurasi. Hubungkan Supabase untuk mengaktifkan akses pengelola.',
      };
    }

    if (
      emailVal.toLowerCase() === 'admin@mudaconnect.ai' &&
      (passVal === 'admin123' || passVal === 'demo123')
    ) {
      const demoProfile = DEMO_PROFILES[0];
      localStorage.setItem('mudaconnect_demo_admin_logged', 'true');
      return { success: true, profile: demoProfile };
    } else {
      return {
        success: false,
        error: 'Email atau kata sandi tidak valid.',
      };
    }
  }

  try {
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: emailVal,
      password: passVal,
    });

    if (authErr || !authData.user) {
      return {
        success: false,
        error: authErr?.message || 'Email atau kata sandi tidak sesuai.',
      };
    }

    const profile = await getCurrentUserProfile(authData.user.id);
    const roleNormalized = profile?.role ? profile.role.trim().toLowerCase() : '';

    if (!profile || !profile.is_active || (roleNormalized !== 'admin' && roleNormalized !== 'super_admin')) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Akun ini tidak memiliki akses ke dashboard pengelola.',
      };
    }

    return { success: true, profile };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat masuk.',
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem('mudaconnect_demo_admin_logged');
  if (env.isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }
}

export async function requestPasswordReset(
  emailVal: string
): Promise<{ success: boolean; message: string }> {
  const genericSuccessMessage =
    'Jika email tersebut terdaftar, tautan pemulihan telah dikirim. Periksa kotak masuk dan folder spam.';

  const trimmedEmail = emailVal.trim();

  if (env.isSupabaseConfigured && trimmedEmail) {
    try {
      const redirectTo = `${window.location.origin}/admin/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      if (error) {
        // Log internally without exposing internal details or whether email exists
        console.error('Password reset request error:', error.message);
      }
    } catch (err) {
      console.error('Unexpected password reset error');
    }
  }

  // Always display the same response to avoid account enumeration
  return {
    success: true,
    message: genericSuccessMessage,
  };
}

export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!env.isSupabaseConfigured) {
    return {
      success: false,
      error: 'Pemulihan kata sandi belum tersedia karena Supabase belum dikonfigurasi.',
    };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: 'Gagal memperbarui password. Silakan minta tautan pemulihan baru.',
      };
    }

    // Sign out recovery session
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: 'Terjadi kesalahan saat memperbarui password. Silakan coba lagi.',
    };
  }
}
