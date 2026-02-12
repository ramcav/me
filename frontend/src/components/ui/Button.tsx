import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-cyan text-bg hover:bg-cyan/90 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]',
    secondary:
      'border border-orange/50 text-orange hover:bg-orange/10 hover:border-orange hover:shadow-[0_0_20px_rgba(255,107,0,0.15)]',
    ghost:
      'text-text-secondary hover:text-text hover:bg-surface-light',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
