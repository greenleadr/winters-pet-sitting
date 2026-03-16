import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon, PhoneIcon, MailIcon, MapPinIcon, AlertCircleIcon, KeyIcon, HomeIcon, PawPrintIcon, DollarSignIcon, FileTextIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import DeleteClientButton from '@/components/clients/DeleteClientButton';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from('clients')
    .select('*, pets(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!client || error) return notFound();

  const isPetSitting = client.service_type === 'pet_sitting' || client.service_type === 'both';
  const isCleaning = client.service_type === 'house_cleaning' || client.service_type === 'both';

  function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    if (!value) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm text-gray-100 font-medium">{value}</span>
      </div>
    );
  }

  return (
    <>
      <Header
        title={`${client.first_name} ${client.last_name}`}
        showBack
        backHref="/clients"
        action={
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="secondary" size="sm" className="gap-1">
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-3 space-y-3">
        {/* Service type + quick contact */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {client.service_type === 'pet_sitting' && <Badge variant="purple" size="md">Pet Sitting</Badge>}
            {client.service_type === 'house_cleaning' && <Badge variant="indigo" size="md">House Cleaning</Badge>}
            {client.service_type === 'both' && (
              <>
                <Badge variant="purple" size="md">Pet Sitting</Badge>
                <Badge variant="indigo" size="md">House Cleaning</Badge>
              </>
            )}
          </div>

          <div className="space-y-2">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                <PhoneIcon className="h-4 w-4" />
                {client.phone}
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
                <MailIcon className="h-4 w-4" />
                {client.email}
              </a>
            )}
            {client.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(client.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
              >
                <MapPinIcon className="h-4 w-4 shrink-0" />
                <span>{client.address}</span>
              </a>
            )}
          </div>
        </div>

        {/* Access & Entry */}
        {(client.access_code || client.key_location || client.gate_code || client.alarm_code || client.parking_instructions) && (
          <CollapsibleSection title="Access & Entry" icon={<KeyIcon className="h-4 w-4 text-orange-400" />} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Access Code" value={client.access_code} />
              <InfoRow label="Key Location" value={client.key_location} />
              <InfoRow label="Gate Code" value={client.gate_code} />
              <InfoRow label="Alarm Code" value={client.alarm_code} />
            </div>
            {client.parking_instructions && <InfoRow label="Parking" value={client.parking_instructions} />}
          </CollapsibleSection>
        )}

        {/* Emergency Contact */}
        {(client.emergency_contact_name || client.emergency_contact_phone) && (
          <CollapsibleSection title="Emergency Contact" icon={<AlertCircleIcon className="h-4 w-4 text-red-400" />} defaultOpen={true}>
            <InfoRow label="Name" value={client.emergency_contact_name} />
            {client.emergency_contact_phone && (
              <a href={`tel:${client.emergency_contact_phone}`} className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                <PhoneIcon className="h-4 w-4" />
                {client.emergency_contact_phone}
              </a>
            )}
          </CollapsibleSection>
        )}

        {/* Pets */}
        {isPetSitting && (
          <CollapsibleSection
            title="Pets"
            icon={<PawPrintIcon className="h-4 w-4 text-purple-400" />}
            badge={client.pets?.length || 0}
            defaultOpen={true}
          >
            {client.pets && client.pets.length > 0 ? (
              <div className="space-y-4">
                {client.pets.map((pet: any) => (
                  <div key={pet.id} className="border-t border-gray-700 pt-3 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-gray-100">{pet.name}</span>
                      {pet.species && <Badge variant="gray">{pet.species}</Badge>}
                      {pet.breed && <span className="text-xs text-gray-500">{pet.breed}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow label="Age" value={pet.age} />
                      <InfoRow label="Color/Markings" value={pet.color_markings} />
                      <InfoRow label="Indoor/Outdoor" value={pet.outdoor_indoor} />
                    </div>
                    {pet.medications && (
                      <div className="mt-2 bg-orange-950/40 border border-orange-800/50 rounded-lg p-2.5">
                        <p className="text-xs font-semibold text-orange-400 mb-1">Medications</p>
                        <p className="text-sm text-orange-200">{pet.medications}</p>
                      </div>
                    )}
                    {pet.feeding_instructions && (
                      <div className="mt-2"><InfoRow label="Feeding Instructions" value={pet.feeding_instructions} /></div>
                    )}
                    {pet.behavioral_notes && (
                      <div className="mt-2"><InfoRow label="Behavioral Notes" value={pet.behavioral_notes} /></div>
                    )}
                    {pet.walk_instructions && (
                      <div className="mt-2"><InfoRow label="Walk Instructions" value={pet.walk_instructions} /></div>
                    )}
                    {(pet.vet_name || pet.vet_phone) && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Vet</p>
                        {pet.vet_name && <p className="text-sm font-medium text-gray-100">{pet.vet_name}</p>}
                        {pet.vet_phone && (
                          <a href={`tel:${pet.vet_phone}`} className="text-sm text-orange-400">{pet.vet_phone}</a>
                        )}
                        {pet.vet_address && <p className="text-xs text-gray-500">{pet.vet_address}</p>}
                      </div>
                    )}
                    {(pet.emergency_vet_name || pet.emergency_vet_phone) && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Emergency Vet</p>
                        {pet.emergency_vet_name && <p className="text-sm font-medium text-gray-100">{pet.emergency_vet_name}</p>}
                        {pet.emergency_vet_phone && (
                          <a href={`tel:${pet.emergency_vet_phone}`} className="text-sm text-orange-400">{pet.emergency_vet_phone}</a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No pets added yet. Edit client to add pets.</p>
            )}
          </CollapsibleSection>
        )}

        {/* House Cleaning */}
        {isCleaning && (
          <CollapsibleSection title="Cleaning Details" icon={<HomeIcon className="h-4 w-4 text-indigo-400" />} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Home Size" value={client.home_size} />
              <InfoRow label="Bedrooms" value={client.num_bedrooms?.toString()} />
              <InfoRow label="Bathrooms" value={client.num_bathrooms?.toString()} />
              <InfoRow label="Frequency" value={client.cleaning_frequency?.replace('_', ' ')} />
            </div>
            <InfoRow label="Products Preference" value={client.cleaning_products_preference} />
            <InfoRow label="Products Location" value={client.cleaning_products_location} />
            <InfoRow label="Fragile Items" value={client.fragile_items_notes} />
            <InfoRow label="Special Instructions" value={client.cleaning_special_instructions} />
          </CollapsibleSection>
        )}

        {/* Payment */}
        {client.payment_notes && (
          <CollapsibleSection title="Payment Notes" icon={<DollarSignIcon className="h-4 w-4 text-green-400" />} defaultOpen={false}>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{client.payment_notes}</p>
          </CollapsibleSection>
        )}

        {/* Notes */}
        {client.notes && (
          <CollapsibleSection title="Notes" icon={<FileTextIcon className="h-4 w-4 text-gray-500" />} defaultOpen={false}>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{client.notes}</p>
          </CollapsibleSection>
        )}

        <div className="pt-2 pb-4">
          <DeleteClientButton clientId={client.id} clientName={`${client.first_name} ${client.last_name}`} />
        </div>
      </div>
    </>
  );
}
