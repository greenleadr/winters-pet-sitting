'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { PlusIcon, CalendarIcon, ListIcon, TrashIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Appointment, Client, AppointmentFormData, PaymentStatus } from '@/lib/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

interface AppointmentCalendarProps {
  appointments: Appointment[];
  clients: Pick<Client, 'id' | 'first_name' | 'last_name' | 'service_type'>[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

const SERVICE_TYPE_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'pet_sitting', label: 'Pet Sitting' },
  { value: 'house_cleaning', label: 'House Cleaning' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
];

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (status === 'paid') return <Badge variant="green">Paid</Badge>;
  if (status === 'pending') return <Badge variant="yellow">Pending</Badge>;
  return <Badge variant="red">Unpaid</Badge>;
}

export default function AppointmentCalendar({ appointments, clients }: AppointmentCalendarProps) {
  const router = useRouter();
  const [view, setView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    client_id: '',
    start_time: '',
    end_time: '',
    service_type: '',
    notes: '',
    payment_status: 'unpaid',
    payment_notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  const events: CalendarEvent[] = appointments.map((appt) => ({
    id: appt.id,
    title: appt.title,
    start: new Date(appt.start_time),
    end: new Date(appt.end_time),
    resource: appt,
  }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const serviceType = event.resource.service_type;
    let backgroundColor = '#f97316'; // orange — other/no service type
    if (serviceType === 'pet_sitting') backgroundColor = '#a855f7'; // purple
    if (serviceType === 'house_cleaning') backgroundColor = '#6366f1'; // indigo
    return { style: { backgroundColor, border: 'none', borderRadius: '4px', fontSize: '11px', color: 'white' } };
  };

  function toLocalDateTimeStr(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const openNewModal = (slotInfo?: { start: Date; end: Date }) => {
    const start = slotInfo?.start || new Date();
    const end = slotInfo?.end || new Date(start.getTime() + 60 * 60 * 1000);
    setFormData({
      title: '',
      client_id: '',
      start_time: toLocalDateTimeStr(start),
      end_time: toLocalDateTimeStr(end),
      service_type: '',
      notes: '',
      payment_status: 'unpaid',
      payment_notes: '',
    });
    setFormError('');
    setNewModalOpen(true);
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setFormData((prev) => ({
      ...prev,
      client_id: clientId,
      service_type: client?.service_type === 'both' ? '' : (client?.service_type || ''),
      title: client ? `${client.first_name} ${client.last_name}` : prev.title,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { setFormError('Title is required.'); return; }
    if (!formData.start_time || !formData.end_time) { setFormError('Start and end time are required.'); return; }
    if (new Date(formData.start_time) >= new Date(formData.end_time)) { setFormError('End time must be after start time.'); return; }

    setSaving(true);
    setFormError('');
    const supabase = createClient();

    const { error } = await supabase.from('appointments').insert({
      client_id: formData.client_id || null,
      title: formData.title.trim(),
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
      service_type: (formData.service_type as any) || null,
      notes: formData.notes.trim() || null,
      payment_status: formData.payment_status,
      payment_notes: formData.payment_notes.trim() || null,
    });

    if (error) { setFormError(error.message); setSaving(false); return; }
    setNewModalOpen(false);
    router.refresh();
    setSaving(false);
  };

  const handleDelete = async (apptId: string) => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('appointments').delete().eq('id', apptId);
    setDetailModalOpen(false);
    setSelectedAppointment(null);
    router.refresh();
    setDeleting(false);
  };

  const clientOptions = [
    { value: '', label: 'No client (block/personal)' },
    ...clients.map((c) => ({ value: c.id, label: `${c.first_name} ${c.last_name}` })),
  ];

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-900">
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => setView('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === 'week' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            <CalendarIcon className="h-3.5 w-3.5" /> Week
          </button>
          <button
            onClick={() => setView('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-700 ${view === 'agenda' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            <ListIcon className="h-3.5 w-3.5" /> List
          </button>
        </div>
        <Button size="sm" onClick={() => openNewModal()} className="gap-1">
          <PlusIcon className="h-4 w-4" /> Add
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700">
        <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Pet Sitting</span>
        <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Cleaning</span>
        <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Other</span>
      </div>

      {/* Calendar */}
      <div className="bg-gray-900" style={{ height: view === 'agenda' ? 'auto' : '65vh', minHeight: '400px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          eventPropGetter={eventStyleGetter}
          onSelectSlot={(slotInfo) => openNewModal(slotInfo)}
          onSelectEvent={(event) => { setSelectedAppointment(event.resource); setDetailModalOpen(true); }}
          selectable
          popup
          style={{ height: '100%', padding: '8px' }}
          messages={{ agenda: 'Upcoming', noEventsInRange: 'No appointments in this range.' }}
        />
      </div>

      {view === 'agenda' && appointments.length === 0 && (
        <div className="px-4 py-12 text-center">
          <CalendarIcon className="h-10 w-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming appointments.</p>
          <button onClick={() => openNewModal()} className="mt-3 text-sm text-orange-400 font-medium hover:underline">
            Schedule one now
          </button>
        </div>
      )}

      {/* New Appointment Modal */}
      <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)} title="New Appointment" size="lg">
        <div className="space-y-4">
          <Select label="Client" options={clientOptions} value={formData.client_id} onChange={(e) => handleClientChange(e.target.value)} />
          <Input label="Title *" placeholder="Dog walk – Buddy" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start *" type="datetime-local" value={formData.start_time} onChange={(e) => setFormData((p) => ({ ...p, start_time: e.target.value }))} />
            <Input label="End *" type="datetime-local" value={formData.end_time} onChange={(e) => setFormData((p) => ({ ...p, end_time: e.target.value }))} />
          </div>
          <Select label="Service Type" options={SERVICE_TYPE_OPTIONS} value={formData.service_type} onChange={(e) => setFormData((p) => ({ ...p, service_type: e.target.value }))} />
          <Select label="Payment Status" options={PAYMENT_STATUS_OPTIONS} value={formData.payment_status} onChange={(e) => setFormData((p) => ({ ...p, payment_status: e.target.value as PaymentStatus }))} />
          <Textarea label="Payment Notes" placeholder="Venmo sent, cash on arrival…" rows={2} value={formData.payment_notes} onChange={(e) => setFormData((p) => ({ ...p, payment_notes: e.target.value }))} />
          <Textarea label="Notes" placeholder="Extra instructions…" rows={2} value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} />
          {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{formError}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setNewModalOpen(false)}>Cancel</Button>
            <Button fullWidth loading={saving} onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {selectedAppointment && (
        <Modal open={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedAppointment(null); }} title="Appointment">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-100 text-base">{selectedAppointment.title}</h3>
              {selectedAppointment.client && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {(selectedAppointment.client as any).first_name} {(selectedAppointment.client as any).last_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <div>
                <p>{format(new Date(selectedAppointment.start_time), 'EEEE, MMM d, yyyy')}</p>
                <p className="text-gray-500">
                  {format(new Date(selectedAppointment.start_time), 'h:mm a')} – {format(new Date(selectedAppointment.end_time), 'h:mm a')}
                </p>
              </div>
            </div>
            {selectedAppointment.service_type && (
              <div>
                {selectedAppointment.service_type === 'pet_sitting' && <Badge variant="purple">Pet Sitting</Badge>}
                {selectedAppointment.service_type === 'house_cleaning' && <Badge variant="indigo">House Cleaning</Badge>}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Payment:</span>
              <PaymentBadge status={selectedAppointment.payment_status} />
            </div>
            {selectedAppointment.payment_notes && (
              <div>
                <p className="text-xs text-gray-500">Payment Notes</p>
                <p className="text-sm text-gray-200">{selectedAppointment.payment_notes}</p>
              </div>
            )}
            {selectedAppointment.notes && (
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{selectedAppointment.notes}</p>
              </div>
            )}
            <div className="pt-2 border-t border-gray-700">
              <Button variant="danger" size="sm" fullWidth loading={deleting} onClick={() => handleDelete(selectedAppointment.id)} className="gap-1.5">
                <TrashIcon className="h-4 w-4" /> Delete Appointment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
