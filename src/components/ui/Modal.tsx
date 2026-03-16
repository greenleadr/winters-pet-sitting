'use client';

import { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        className={clsx(
          'relative bg-gray-900 border border-gray-700 w-full rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto',
          {
            'sm:max-w-sm': size === 'sm',
            'sm:max-w-lg': size === 'md',
            'sm:max-w-2xl': size === 'lg',
          }
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-base font-semibold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
