'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  action?: React.ReactNode;
}

export default function Header({ title, showBack = false, backHref, action }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center h-14 px-4 gap-2 max-w-screen-sm mx-auto">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        )}
        <h1 className="flex-1 font-semibold text-gray-100 text-base truncate">{title}</h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
