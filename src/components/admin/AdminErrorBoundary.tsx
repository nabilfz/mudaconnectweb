import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[AdminDashboard] runtime error", {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error),
        componentStack: errorInfo?.componentStack ?? null,
      });
    }
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoToLogin = () => {
    window.location.href = '/admin/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#17324D] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[14px] shadow-lg p-6 space-y-4 border border-[#DEDCD6] text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#17212B]">
              Dashboard tidak dapat dimuat.
            </h2>
            <p className="text-xs text-[#5E6872] leading-relaxed">
              Terjadi kesalahan mendadak saat memuat tampilan dashboard pengelola.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={this.handleReload}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Muat Ulang
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={this.handleGoToLogin}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Kembali ke Login
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}


