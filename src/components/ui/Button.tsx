import React from 'react';

export function Button({ 
  className, 
  variant = 'default', 
  size = 'default', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'outline' | 'ghost' | 'danger', 
  size?: 'default' | 'sm' | 'icon' 
}) {
  const baseStyled = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-700',
    outline: 'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700',
  };
  const sizes = {
    default: 'h-10 py-2 px-4 text-sm',
    sm: 'h-8 px-3 rounded-md text-xs',
    icon: 'h-9 w-9 shrink-0',
  };
  
  return (
    <button className={`${baseStyled} ${variants[variant]} ${sizes[size]} ${className || ''}`} {...props} />
  );
}
