import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default:
      'border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900',
    secondary:
      'border-transparent bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    destructive:
      'border-transparent bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/30',
    outline:
      'border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-300',
    success:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning:
      'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    info:
      'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  }[variant];

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-hidden tracking-wide uppercase ${variantStyles} ${className}`}
      {...props}
    />
  );
}
