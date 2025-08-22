import React from 'react';
import clsx from 'classnames';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary';
};

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-purple-600 text-white',
    secondary: 'bg-gray-100 text-gray-800',
  } as const;
  return <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', variants[variant], className)} {...props} />;
};