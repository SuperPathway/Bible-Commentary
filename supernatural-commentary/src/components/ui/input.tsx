import React from 'react';
import clsx from 'classnames';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx('w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400', className)}
      {...props}
    />
  )
);
Input.displayName = 'Input';