import React from 'react';

export const DropdownMenu: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DropdownMenuTrigger: React.FC<{ asChild?: boolean } & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DropdownMenuContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { align?: 'end' | 'start'; className?: string }> = ({ children, className, ...props }) => (
  <div className={`mt-2 w-56 rounded-md border bg-white shadow-lg p-2 ${className || ''}`} {...props}>{children}</div>
);

export const DropdownMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer" {...props}>{children}</div>
);