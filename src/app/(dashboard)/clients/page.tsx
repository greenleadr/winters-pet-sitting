import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import ClientList from '@/components/clients/ClientList';
import Button from '@/components/ui/Button';
import { Client } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q || '';
  const serviceFilter = params.type || '';

  let dbQuery = supabase
    .from('clients')
    .select('*, pets(*)')
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (serviceFilter && serviceFilter !== 'all') {
    dbQuery = dbQuery.eq('service_type', serviceFilter);
  }

  const { data: clients } = await dbQuery;

  let filtered = (clients as Client[]) || [];
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }

  return (
    <>
      <Header
        title="Clients"
        action={
          <Link href="/clients/new">
            <Button size="sm" className="gap-1">
              <PlusIcon className="h-4 w-4" />
              Add
            </Button>
          </Link>
        }
      />
      <ClientList
        clients={filtered}
        searchQuery={query}
        serviceFilter={serviceFilter}
      />
    </>
  );
}
