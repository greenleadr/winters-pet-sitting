'use client';

import Link from 'next/link';
import { PhoneIcon, PawPrintIcon, ChevronRightIcon } from 'lucide-react';
import { Client } from '@/lib/types';
import Badge from '@/components/ui/Badge';

function ServiceBadge({ serviceType }: { serviceType: string }) {
  if (serviceType === 'pet_sitting') return <Badge variant="purple">Pet Sitting</Badge>;
  if (serviceType === 'house_cleaning') return <Badge variant="indigo">Cleaning</Badge>;
  return (
    <span className="flex gap-1">
      <Badge variant="purple">Pets</Badge>
      <Badge variant="indigo">Cleaning</Badge>
    </span>
  );
}

export default function ClientCard({ client }: { client: Client }) {
  const petCount = client.pets?.length || 0;
  const initials = `${client.first_name[0]}${client.last_name[0]}`.toUpperCase();

  return (
    <Link
      href={`/clients/${client.id}`}
      className="block bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-500/50 hover:bg-gray-750 transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 p-3.5">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 font-semibold text-sm shrink-0 ring-1 ring-orange-500/30">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-100 text-sm">
              {client.first_name} {client.last_name}
            </span>
            <ServiceBadge serviceType={client.service_type} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {client.phone && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <PhoneIcon className="h-3 w-3" />
                {client.phone}
              </span>
            )}
            {(client.service_type === 'pet_sitting' || client.service_type === 'both') && petCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <PawPrintIcon className="h-3 w-3" />
                {petCount} pet{petCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <ChevronRightIcon className="h-4 w-4 text-gray-600 shrink-0" />
      </div>
    </Link>
  );
}
