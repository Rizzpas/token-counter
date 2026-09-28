import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'xs' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';

    const variantStyles = {
      default:
        'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 shadow-xs dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 shadow-xs dark:bg-red-900/80 dark:text-red-100 dark:hover:bg-red-900',
      outline:
        'border border-zinc-200 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 shadow-2xs',
      secondary:
        'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700/80 shadow-2xs',
      ghost:
        'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400',
      link: 'text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100 p-0 h-auto',
    }[variant];

    const sizeStyles = {
      default: 'h-9 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs',
      xs: 'h-6 px-2 text-[11px] gap-1',
      lg: 'h-10 px-6 text-sm',
      icon: 'h-8 w-8 p-0',
      'icon-sm': 'h-7 w-7 p-0',
      'icon-xs': 'h-6 w-6 p-0 text-[11px]',
    }[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
