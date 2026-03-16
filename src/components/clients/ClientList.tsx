'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SearchIcon, XIcon, UsersIcon } from 'lucide-react';
import { Client } from '@/lib/types';
import ClientCard from './ClientCard';
import { clsx } from 'clsx';

interface ClientListProps {
  clients: Client[];
  searchQuery: string;
  serviceFilter: string;
}

const SERVICE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pet_sitting', label: 'Pet Sitting' },
  { value: 'house_cleaning', label: 'Cleaning' },
  { value: 'both', label: 'Both' },
];

export default function ClientList({ clients, searchQuery, serviceFilter }: ClientListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchQuery);
  const [, startTransition] = useTransition();

  const updateSearch = (q: string, type: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    const qs = params.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ''}`);
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    updateSearch(e.target.value, serviceFilter);
  };

  const clearSearch = () => {
    setSearch('');
    updateSearch('', serviceFilter);
  };

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Search box */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={handleSearch}
          placeholder="Search clients…"
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {search && (
          <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Service type filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {SERVICE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => updateSearch(search, f.value)}
            className={clsx(
              'shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
              serviceFilter === f.value
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-orange-500 hover:text-orange-400'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UsersIcon className="h-12 w-12 text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No clients found</p>
          {(search || serviceFilter) && (
            <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filter</p>
          )}
          {!search && !serviceFilter && (
            <Link href="/clients/new" className="mt-4 text-sm text-orange-400 font-medium hover:underline">
              Add your first client
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
