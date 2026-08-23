import React from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: 'right' | 'bottom';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  const titleId = React.useId();
  const drawerRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {position === 'right' ? (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : 'Panel detail'}
          tabIndex={-1}
          className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
            <h3 id={titleId} className="text-base font-bold text-[#172033]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup panel"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      ) : (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : 'Panel detail'}
          tabIndex={-1}
          className="relative mt-auto w-full bg-white rounded-t-[22px] max-h-[85vh] shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50 rounded-t-[22px]">
            <h3 id={titleId} className="text-base font-bold text-[#172033]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup panel"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      )}
    </div>
  );
};
