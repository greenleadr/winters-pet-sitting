import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'purple' | 'gray' | 'yellow' | 'red';
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-emerald-100 text-emerald-800': variant === 'green',
          'bg-blue-100 text-blue-800': variant === 'blue',
          'bg-purple-100 text-purple-800': variant === 'purple',
          'bg-gray-100 text-gray-700': variant === 'gray',
          'bg-yellow-100 text-yellow-800': variant === 'yellow',
          'bg-red-100 text-red-800': variant === 'red',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
}
