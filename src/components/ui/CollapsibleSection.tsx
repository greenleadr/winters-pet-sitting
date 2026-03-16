'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}

export default function CollapsibleSection({ title, icon, children, defaultOpen = false, badge }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-200 text-sm">
          {icon}
          {title}
          {badge !== undefined && (
            <span className="bg-orange-500/20 text-orange-300 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-orange-500/30">
              {badge}
            </span>
          )}
        </span>
        {open
          ? <ChevronUpIcon className="h-4 w-4 text-gray-500 shrink-0" />
          : <ChevronDownIcon className="h-4 w-4 text-gray-500 shrink-0" />
        }
      </button>
      <div className={clsx('transition-all duration-200', open ? 'block' : 'hidden')}>
        <div className="px-4 py-4 space-y-4 bg-gray-900">{children}</div>
      </div>
    </div>
  );
}
