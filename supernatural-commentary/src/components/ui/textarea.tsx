import React from 'react';
import clsx from 'classnames';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx('w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-400', className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';