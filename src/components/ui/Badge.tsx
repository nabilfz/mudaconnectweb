import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
  };

  const variantStyles = {
    primary: 'bg-[#1E7773]/10 text-[#1E7773] border border-[#1E7773]/25',
    secondary: 'bg-[#12263A]/10 text-[#12263A] border border-[#12263A]/25',
    accent: 'bg-[#E8B44A]/20 text-[#A66B18] border border-[#E8B44A]/40',
    success: 'bg-[#2F7D5B]/10 text-[#2F7D5B] border border-[#2F7D5B]/25',
    warning: 'bg-amber-50 text-[#A66B18] border border-[#A66B18]/30',
    error: 'bg-[#B94747]/10 text-[#B94747] border border-[#B94747]/25',
    outline: 'bg-white text-[#626D78] border border-[#D8DDE1]',
    slate: 'bg-[#F6F4EE] text-[#18212B] border border-[#D8DDE1]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md whitespace-nowrap uppercase ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

