import React from 'react';
import clsx from 'classnames';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none';
  const variants = {
    default: 'bg-purple-600 hover:bg-purple-700 text-white',
    outline: 'border border-purple-200 text-purple-700 bg-white hover:bg-purple-50',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-800',
  } as const;
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  } as const;
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />
  );
};