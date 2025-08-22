import React from 'react';
import clsx from 'classnames';

export const Progress: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const clamped = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={clsx('h-2 w-full rounded bg-gray-200 overflow-hidden', className)}>
      <div className="h-full bg-purple-600" style={{ width: `${clamped}%` }} />
    </div>
  );
};