import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../services/supabase/client';
import { env } from '../services/supabase/env';
import { Profile } from '../types';
import { DEMO_PROFILES } from '../services/supabase/demoData';

export type AuthStatus =
  | 'LOADING'
  | 'SLOW_CONNECTION'
  | 'UNAUTHENTICATED'
  | 'SESSION_ERROR'
  | 'PROFILE_QUERY_ERROR'
  | 'PROFILE_MISSING'
  | 'PROFILE_INACTIVE'
  | 'UNAUTHORIZED_ROLE'
  | 'AUTHORIZED';

interface AuthContextType {
  status: AuthStatus;
  userProfile: Profile | null;
  sessionError: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  retryCheck: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('LOADING');
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const authRequestIdRef = React.useRef(0);

  const checkAuth = useCallback(async (isMounted: () => boolean, requestId: number) => {
    if (!isMounted() || requestId !== authRequestIdRef.current) return;
    setStatus('LOADING');
    setSessionError(null);

    const startTime = performance.now();

    if (import.meta.env.DEV) {
      console.info('[AdminAuth] initialization started');
    }

    // Demo Mode Handler
    if (!env.isSupabaseConfigured) {
      if (!env.isDemoAdminEnabled) {
        setUserProfile(null);
        setStatus('UNAUTHENTICATED');
        return;
      }

      const isLoggedDemo = localStorage.getItem('mudaconnect_demo_admin_logged') === 'true';
      if (!isMounted() || requestId !== authRequestIdRef.current) return;
      if (isLoggedDemo) {
        const demoProfile = DEMO_PROFILES[0];
        setUserProfile(demoProfile);
        setStatus('AUTHORIZED');
        if (import.meta.env.DEV) {
          console.info('[AdminAuth] session available: true (demo)');
          console.info('[AdminAuth] profile result: found (demo)');
          console.info('[AdminAuth] initialization completed', {
            durationMs: Math.round(performance.now() - startTime),
            result: 'AUTHORIZED'
          });
        }
      } else {
        setUserProfile(null);
        setStatus('UNAUTHENTICATED');
        if (import.meta.env.DEV) {
          console.info('[AdminAuth] session available: false (demo)');
          console.info('[AdminAuth] initialization completed', {
            durationMs: Math.round(performance.now() - startTime),
            result: 'UNAUTHENTICATED'
          });
        }
      }
      return;
    }

    try {
      // 1. Initial Session Check (Fast Restoration)
      const sessionStartTime = performance.now();
      const { data: sessionData, error: sessErr } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (import.meta.env.DEV) {
        console.info('[AdminAuth] getSession completed', {
          durationMs: Math.round(performance.now() - sessionStartTime),
          hasSession: Boolean(session),
        });
      }

      if (sessErr) {
        if (!isMounted() || requestId !== authRequestIdRef.current) return;
        console.error('[AdminAuth] session error:', sessErr.message);
        setSessionError('Gagal memverifikasi sesi autentikasi. Silakan masuk kembali.');
        setStatus('SESSION_ERROR');
        return;
      }

      if (!session || !session.user) {
        if (!isMounted() || requestId !== authRequestIdRef.current) return;
        setUserProfile(null);
        setStatus('UNAUTHENTICATED');
        if (import.meta.env.DEV) {
          console.info('[AdminAuth] initialization completed', {
            durationMs: Math.round(performance.now() - startTime),
            result: 'UNAUTHENTICATED'
          });
        }
        return;
      }

      // 2. Fresh User Verification via getUser()
      const userStartTime = performance.now();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (import.meta.env.DEV) {
        console.info('[AdminAuth] getUser completed', {
          durationMs: Math.round(performance.now() - userStartTime),
          hasUser: Boolean(user),
          errorCode: userError?.code ?? null,
        });
      }

      if (userError) {
        if (!isMounted() || requestId !== authRequestIdRef.current) return;
        // Do NOT immediately sign out on getUser network errors. It might be a temporary latency.
        // Instead, we just show a SLOW_CONNECTION error or SESSION_ERROR for them to try again.
        console.warn('[AdminAuth] getUser failed, preserving local session for retry:', userError?.message);
        setSessionError('Koneksi autentikasi sedang lambat.');
        setStatus('SESSION_ERROR'); // They can retry.
        return;
      }

      if (!user) {
        if (!isMounted() || requestId !== authRequestIdRef.current) return;
        await supabase.auth.signOut();
        setUserProfile(null);
        setStatus('UNAUTHENTICATED');
        return;
      }

      // 3. Admin Profile Query using maybeSingle() without email
      const profileStartTime = performance.now();
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, is_active')
        .eq('id', user.id)
        .maybeSingle();

      if (import.meta.env.DEV) {
        console.info('[AdminAuth] profile completed', {
          durationMs: Math.round(performance.now() - profileStartTime),
          found: Boolean(profile),
          errorCode: profileError?.code ?? null,
        });
      }

      if (!isMounted() || requestId !== authRequestIdRef.current) return;

      if (profileError) {
        console.error('[AdminAuth] profile query error:', profileError.message);
        setSessionError('Profil pengelola gagal dimuat.');
        setStatus('PROFILE_QUERY_ERROR');
        if (import.meta.env.DEV) {
          console.info('[AdminAuth] initialization completed', {
            durationMs: Math.round(performance.now() - startTime),
            result: 'PROFILE_QUERY_ERROR'
          });
        }
        return;
      }

      if (!profile) {
        setUserProfile(null);
        setSessionError('Profil pengelola belum terhubung dengan akun Auth ini.');
        setStatus('PROFILE_MISSING');
        if (import.meta.env.DEV) {
          console.info('[AdminAuth] initialization completed', {
            durationMs: Math.round(performance.now() - startTime),
            result: 'PROFILE_MISSING'
          });
        }
        return;
      }

      // Construct Profile with email from Supabase Auth user.email
      const userProfileObj: Profile = {
        id: profile.id,
        email: user.email || '',
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
      };

      setUserProfile(userProfileObj);

      // Check account activity
      if (!profile.is_active) {
        setStatus('PROFILE_INACTIVE');
        if (import.meta.env.DEV) {
          console.info('[AdminAuth] initialization completed', {
            durationMs: Math.round(performance.now() - startTime),
            result: 'PROFILE_INACTIVE'
          });
        }
        return;
      }

      // Check role authorization
      const roleNormalized = profile.role ? profile.role.trim().toLowerCase() : '';
      if (roleNormalized !== 'admin' && roleNormalized !== 'super_admin') {
        setStatus('UNAUTHORIZED_ROLE');
        if (import.meta.env.DEV) {
          console.info('[AdminAuth] initialization completed', {
            durationMs: Math.round(performance.now() - startTime),
            result: 'UNAUTHORIZED_ROLE'
          });
        }
        return;
      }

      // All checks passed!
      setStatus('AUTHORIZED');
      if (import.meta.env.DEV) {
        console.info('[AdminAuth] initialization completed', {
          durationMs: Math.round(performance.now() - startTime),
          result: 'AUTHORIZED'
        });
      }
    } catch (err: any) {
      if (!isMounted() || requestId !== authRequestIdRef.current) return;
      console.error('[AdminAuth] unexpected auth error:', err);
      setSessionError('Terjadi kesalahan saat memeriksa akses autentikasi.');
      setStatus('SESSION_ERROR');
    }
  }, []);

  const retryCheck = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    
    authRequestIdRef.current += 1;
    const currentRequestId = authRequestIdRef.current;

    // Timeout: 20 seconds transition to SLOW_CONNECTION if still LOADING
    const timer = setTimeout(() => {
      if (mounted && currentRequestId === authRequestIdRef.current) {
        setStatus((prevStatus) => {
          if (prevStatus === 'LOADING') {
            console.warn('[AdminAuth] initialization slow after 20 seconds');
            return 'SLOW_CONNECTION';
          }
          return prevStatus;
        });
      }
    }, 20000);

    checkAuth(isMounted, currentRequestId);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [checkAuth, retryCount]);

  useEffect(() => {
    // Single Supabase auth listener (separated from checkAuth effect)
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (env.isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT') {
          // Increment request ID to cancel any pending initialization
          authRequestIdRef.current += 1;
          setUserProfile(null);
          setStatus('UNAUTHENTICATED');
        } else if (event === 'PASSWORD_RECOVERY') {
          if (import.meta.env.DEV) {
            console.info('[AdminAuth] PASSWORD_RECOVERY event received');
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Trigger a re-check by incrementing retryCount
          setRetryCount(c => c + 1);
        }
      });
      authSubscription = authListener.subscription;
    }

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    localStorage.removeItem('mudaconnect_demo_admin_logged');
    setUserProfile(null);
    setStatus('UNAUTHENTICATED');
    if (env.isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
  };

  const isLoading = status === 'LOADING';
  const isAuthenticated = status === 'AUTHORIZED';

  return (
    <AuthContext.Provider
      value={{
        status,
        userProfile,
        sessionError,
        isLoading,
        isAuthenticated,
        retryCheck,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
