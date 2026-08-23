import React, { useState, useRef } from 'react';
import { Upload, X, FileCheck, Film, Music } from 'lucide-react';
import { uploadMediaFile, validateMediaFile } from '../../services/supabase/storage';

export interface FileUploaderProps {
  label?: string;
  folder?: 'programs' | 'contents' | 'settings';
  entityId?: string;
  currentUrl?: string;
  onUploadSuccess?: (url: string) => void;
  accept?: string;
  helperText?: string;
  onUpload?: (file: File) => Promise<void>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  folder = 'programs',
  entityId,
  currentUrl,
  onUploadSuccess,
  accept = 'image/*,audio/*,video/*',
  helperText,
  onUpload,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatedId = React.useId();
  const inputId = `${generatedId}-file`;
  const helperId = `${generatedId}-helper`;
  const errorId = `${generatedId}-error`;

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    const validCheck = validateMediaFile(file);
    if (!validCheck.valid) {
      setErrorMsg(validCheck.error || 'File tidak valid');
      return;
    }

    setIsUploading(true);
    setProgress(10);

    if (onUpload) {
      try {
        setProgress(50);
        await onUpload(file);
        setProgress(100);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Gagal mengunggah file.');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    const res = await uploadMediaFile(file, {
      folder,
      entityId,
      onProgress: (pct) => setProgress(pct),
    });

    setIsUploading(false);

    if (res.success && res.publicUrl) {
      if (onUploadSuccess) onUploadSuccess(res.publicUrl);
    } else {
      setErrorMsg(res.error || 'Gagal mengunggah file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-[#172033] tracking-wide">{label}</label>}

      {currentUrl ? (
        <div className="relative rounded-[14px] border border-[#E2E8F0] p-3 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {currentUrl.match(/\.(jpg|jpeg|png|webp|gif)/i) || currentUrl.startsWith('data:image') || currentUrl.startsWith('blob:') ? (
              <img src={currentUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
            ) : currentUrl.match(/\.(mp3|wav|m4a)/i) ? (
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-[#1D4E89]/10 text-[#1D4E89] rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-bold text-[#172033] flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                Media Berhasil Diunggah
              </p>
              <p className="text-[11px] text-slate-500 truncate">{currentUrl}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUploadSuccess?.('')}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            aria-label="Hapus media terpilih"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Pilih atau jatuhkan berkas media"
          aria-busy={isUploading}
          aria-describedby={errorMsg ? errorId : helperText ? helperId : undefined}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={(event) => {
            if (event.target !== fileInputRef.current) fileInputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[16px] cursor-pointer transition-all ${
            isDragging
              ? 'border-[#1D4E89] bg-blue-50/50'
              : 'border-[#E2E8F0] bg-slate-50/50 hover:bg-slate-100/60'
          }`}
        >
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-full bg-white border shadow-xs flex items-center justify-center text-[#1D4E89] mb-2">
            <Upload className="w-5 h-5" />
          </div>

          <p className="text-xs font-semibold text-[#172033] mb-0.5">
            Tarik & lepas file di sini, atau <span className="text-[#1D4E89] underline">pilih file</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Gambar (maks. 10 MB) · Audio (maks. 25 MB) · Video (maks. 100 MB)
          </p>

          {isUploading && (
            <div className="w-full max-w-xs mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  role="progressbar"
                  aria-label="Progres unggahan"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-full bg-[#1D4E89] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-1">Mengunggah... {progress}%</p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p id={errorId} className="text-xs text-rose-600 font-medium mt-1" role="alert">
          {errorMsg}
        </p>
      )}
      {helperText && !errorMsg && (
        <p id={helperId} className="text-xs text-slate-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
