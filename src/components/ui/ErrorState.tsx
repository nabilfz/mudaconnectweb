import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kendala',
  message = 'Terjadi kendala saat memuat data dari server. Silakan periksa koneksi Anda dan coba kembali.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-rose-50/50 rounded-[18px] border border-rose-200/80 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-rose-950 mb-1">{title}</h3>
      <p className="text-sm text-rose-700/90 max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="md"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Coba Lagi
        </Button>
      )}
    </div>
  );
};
