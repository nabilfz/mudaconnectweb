import { useState } from 'react';
import { brandAssets } from '../../config/brandAssets';

export interface BrandLogoProps {
  variant?: 'horizontal' | 'icon';
  inverse?: boolean;
  decorative?: boolean;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function BrandLogo({
  variant = 'horizontal',
  inverse = false,
  decorative = false,
  className = '',
  loading = 'eager',
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const alt = decorative ? '' : 'MudaConnect';

  if (failed) {
    if (variant === 'icon') {
      return (
        <span
          className={`grid place-items-center bg-[#d8f05c] font-display text-xs font-black tracking-[-0.06em] text-[#071f32] ${className}`}
          aria-hidden={decorative || undefined}
          aria-label={decorative ? undefined : 'MudaConnect'}
        >
          MC
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-2.5 font-display font-extrabold tracking-[-0.045em] ${
          inverse ? 'text-white' : 'text-[#071f32]'
        } ${className}`}
        aria-label={decorative ? undefined : 'MudaConnect'}
        aria-hidden={decorative || undefined}
      >
        <span
          className={`grid aspect-square h-[1.8em] place-items-center text-[.7em] font-black ${
            inverse ? 'bg-[#d8f05c] text-[#071f32]' : 'bg-[#007d6f] text-white'
          }`}
          aria-hidden="true"
        >
          MC
        </span>
        <span>MudaConnect</span>
      </span>
    );
  }

  return (
    <img
      src={variant === 'icon' ? brandAssets.icon : brandAssets.horizontalLogo}
      alt={alt}
      width={variant === 'icon' ? 48 : 180}
      height={48}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${inverse ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
}
