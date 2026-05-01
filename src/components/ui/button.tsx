import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    primary: 'bg-slate-900 text-slate-50 hover:bg-slate-900/90',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
    danger: 'bg-red-500 text-slate-50 hover:bg-red-500/90',
    outline: 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-900',
    ghost: 'hover:bg-slate-100 text-slate-900',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
