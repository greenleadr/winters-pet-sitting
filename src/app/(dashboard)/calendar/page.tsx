import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import AppointmentCalendar from '@/components/calendar/AppointmentCalendar';
import { Appointment, Client } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, client:clients(id, first_name, last_name, service_type)')
    .order('start_time', { ascending: true });

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
      />
    </>
  );
}
