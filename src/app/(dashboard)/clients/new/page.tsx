import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import ClientForm from '@/components/clients/ClientForm';

export default async function NewClientPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <>
      <Header title="Add Client" showBack backHref="/clients" />
      <ClientForm userId={user.id} />
    </>
  );
}
