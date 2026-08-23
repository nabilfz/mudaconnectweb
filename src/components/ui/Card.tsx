import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-[14px] border border-[#DEDCD6] p-5 sm:p-6 shadow-editorial ${
        hoverEffect
          ? 'transition-all duration-300 hover:border-[#17324D]/40 hover:shadow-card-hover hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

