import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-[18px] border border-dashed border-[#E2E8F0] ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#1D4E89] mb-4">
        {icon || <FolderOpen className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#172033] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
