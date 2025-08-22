import React from 'react';
import clsx from 'classnames';

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive';
};

export const Alert: React.FC<AlertProps> = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-white border-gray-200 text-gray-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
  } as const;
  return <div className={clsx('w-full rounded-lg border p-4 flex items-start space-x-3', variants[variant], className)} {...props} />;
};

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={clsx('text-sm', className)} {...props} />
);