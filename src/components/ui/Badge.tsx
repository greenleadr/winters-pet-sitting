import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'purple' | 'indigo' | 'gray' | 'yellow' | 'red' | 'green';
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30': variant === 'orange',
          'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30': variant === 'purple',
          'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30': variant === 'indigo',
          'bg-gray-700/60 text-gray-300': variant === 'gray',
          'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30': variant === 'yellow',
          'bg-red-500/20 text-red-400 ring-1 ring-red-500/30': variant === 'red',
          'bg-green-500/20 text-green-300 ring-1 ring-green-500/30': variant === 'green',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
}
