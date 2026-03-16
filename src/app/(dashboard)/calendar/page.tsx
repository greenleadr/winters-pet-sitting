import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import AppointmentCalendar from '@/components/calendar/AppointmentCalendar';
import { Appointment, Client } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Fetch appointments with client info
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, client:clients(id, first_name, last_name, service_type)')
    .order('start_time', { ascending: true });

  // Fetch active clients for the appointment form dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, first_name, last_name, service_type')
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  return (
    <>
      <Header title="Calendar" />
      <AppointmentCalendar
        appointments={(appointments as Appointment[]) || []}
        clients={(clients as Pick<Client, 'id' | 'first_name' | 'last_name' | 'service_type'>[]) || []}
        userId={user.id}
        isOwner={profile?.role === 'owner'}
      />
    </>
  );
}
