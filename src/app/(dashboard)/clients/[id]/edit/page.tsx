import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import ClientForm from '@/components/clients/ClientForm';

export const dynamic = 'force-dynamic';

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: client, error } = await supabase
    .from('clients')
    .select('*, pets(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!client || error) return notFound();

  return (
    <>
      <Header
        title={`Edit ${client.first_name} ${client.last_name}`}
        showBack
        backHref={`/clients/${id}`}
      />
      <ClientForm client={client} userId={user.id} />
    </>
  );
}
