import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import SettingsClient from '@/components/settings/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch all profiles (owner can see helper accounts)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <>
      <Header title="Settings" />
      <SettingsClient
        currentUser={user}
        profile={profile}
        allProfiles={allProfiles || []}
        isOwner={profile?.role === 'owner'}
      />
    </>
  );
}
