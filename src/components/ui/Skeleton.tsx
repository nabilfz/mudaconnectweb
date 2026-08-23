import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-[10px] ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-5 space-y-4 animate-pulse">
      <div className="h-44 bg-slate-200 rounded-[14px] w-full" />
      <div className="flex gap-2">
        <div className="h-5 bg-slate-200 rounded-full w-20" />
        <div className="h-5 bg-slate-200 rounded-full w-16" />
      </div>
      <div className="h-6 bg-slate-200 rounded-md w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-md w-full" />
        <div className="h-4 bg-slate-200 rounded-md w-5/6" />
      </div>
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        <div className="h-9 bg-slate-200 rounded-[12px] w-28" />
      </div>
    </div>
  );
};
