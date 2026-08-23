import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  asChild = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold tracking-tight transition-colors duration-200 rounded-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 min-h-[40px]',
    md: 'px-4.5 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-sm font-bold gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[#1E7773] text-white hover:bg-[#18605D] focus-visible:ring-[#1E7773] border border-[#1E7773]',
    secondary:
      'bg-transparent text-[#12263A] hover:bg-[#F6F4EE] focus-visible:ring-[#12263A] border border-[#12263A]',
    accent:
      'bg-[#E8B44A] text-[#18212B] hover:bg-[#D4A23A] font-bold focus-visible:ring-[#E8B44A] border border-[#E8B44A]',
    outline:
      'border border-[#D8DDE1] text-[#18212B] bg-white hover:bg-[#F6F4EE] hover:border-[#1E7773]/60 focus-visible:ring-[#1E7773]',
    ghost:
      'text-[#626D78] hover:text-[#18212B] hover:bg-[#F6F4EE] focus-visible:ring-[#1E7773]',
    danger:
      'bg-[#B94747] text-white hover:bg-[#9E3939] focus-visible:ring-[#B94747] border border-[#B94747]',
  };

  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  const childContent =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
      ? children.props.children
      : children;
  const contents = (
    <>
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon
      )}
      <span>{childContent}</span>
      {!isLoading && rightIcon}
    </>
  );

  if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
    const child = children;
    const childProps = child.props as {
      className?: string;
      onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    };

    return React.cloneElement(
      child,
      {
        className: `${buttonClasses} ${childProps.className ?? ''}`,
        'aria-busy': isLoading || undefined,
        'aria-disabled': disabled || isLoading || undefined,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          if (disabled || isLoading) {
            event.preventDefault();
            return;
          }
          childProps.onClick?.(event);
        },
      },
      contents
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      type={type}
      className={buttonClasses}
      {...props}
    >
      {contents}
    </button>
  );
};
