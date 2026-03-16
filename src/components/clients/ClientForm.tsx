'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { PlusIcon, UserIcon, HomeIcon, PawPrintIcon, KeyIcon, DollarSignIcon, FileTextIcon, AlertCircleIcon } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { ClientFormData, Client, ServiceType } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import PetForm from './PetForm';

interface ClientFormProps {
  client?: Client;
}

const SERVICE_OPTIONS = [
  { value: 'pet_sitting', label: 'Pet Sitting' },
  { value: 'house_cleaning', label: 'House Cleaning' },
  { value: 'both', label: 'Both (Pet Sitting + Cleaning)' },
];

const FREQUENCY_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as_needed', label: 'As Needed' },
];

function defaultPet() {
  return {
    name: '',
    species: '',
    breed: '',
    age: '',
    color_markings: '',
    feeding_instructions: '',
    medications: '',
    behavioral_notes: '',
    outdoor_indoor: '',
    walk_instructions: '',
    vet_name: '',
    vet_phone: '',
    vet_address: '',
    emergency_vet_name: '',
    emergency_vet_phone: '',
  };
}

export default function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      first_name: client?.first_name || '',
      last_name: client?.last_name || '',
      phone: client?.phone || '',
      email: client?.email || '',
      address: client?.address || '',
      emergency_contact_name: client?.emergency_contact_name || '',
      emergency_contact_phone: client?.emergency_contact_phone || '',
      service_type: client?.service_type || 'pet_sitting',
      access_code: client?.access_code || '',
      key_location: client?.key_location || '',
      gate_code: client?.gate_code || '',
      alarm_code: client?.alarm_code || '',
      parking_instructions: client?.parking_instructions || '',
      home_size: client?.home_size || '',
      num_bedrooms: client?.num_bedrooms?.toString() || '',
      num_bathrooms: client?.num_bathrooms?.toString() || '',
      cleaning_frequency: client?.cleaning_frequency || '',
      cleaning_products_preference: client?.cleaning_products_preference || '',
      cleaning_products_location: client?.cleaning_products_location || '',
      fragile_items_notes: client?.fragile_items_notes || '',
      cleaning_special_instructions: client?.cleaning_special_instructions || '',
      payment_notes: client?.payment_notes || '',
      notes: client?.notes || '',
      pets: client?.pets?.map((p) => ({
        id: p.id,
        name: p.name,
        species: p.species || '',
        breed: p.breed || '',
        age: p.age || '',
        color_markings: p.color_markings || '',
        feeding_instructions: p.feeding_instructions || '',
        medications: p.medications || '',
        behavioral_notes: p.behavioral_notes || '',
        outdoor_indoor: p.outdoor_indoor || '',
        walk_instructions: p.walk_instructions || '',
        vet_name: p.vet_name || '',
        vet_phone: p.vet_phone || '',
        vet_address: p.vet_address || '',
        emergency_vet_name: p.emergency_vet_name || '',
        emergency_vet_phone: p.emergency_vet_phone || '',
      })) || [],
    },
  });

  const { fields: petFields, append, remove } = useFieldArray({ control, name: 'pets' });

  const serviceType = watch('service_type') as ServiceType;
  const isPetSitting = serviceType === 'pet_sitting' || serviceType === 'both';
  const isCleaning = serviceType === 'house_cleaning' || serviceType === 'both';
  const petNames = watch('pets');

  const onSubmit = async (data: ClientFormData) => {
    setSaving(true);
    setGlobalError('');
    const supabase = createSupabaseClient();

    try {
      const clientData = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone.trim() || null,
        email: data.email.trim() || null,
        address: data.address.trim() || null,
        emergency_contact_name: data.emergency_contact_name.trim() || null,
        emergency_contact_phone: data.emergency_contact_phone.trim() || null,
        service_type: data.service_type,
        access_code: data.access_code.trim() || null,
        key_location: data.key_location.trim() || null,
        gate_code: data.gate_code.trim() || null,
        alarm_code: data.alarm_code.trim() || null,
        parking_instructions: data.parking_instructions.trim() || null,
        home_size: isCleaning ? data.home_size.trim() || null : null,
        num_bedrooms: isCleaning && data.num_bedrooms ? parseInt(data.num_bedrooms) : null,
        num_bathrooms: isCleaning && data.num_bathrooms ? parseInt(data.num_bathrooms) : null,
        cleaning_frequency: isCleaning ? data.cleaning_frequency || null : null,
        cleaning_products_preference: isCleaning ? data.cleaning_products_preference.trim() || null : null,
        cleaning_products_location: isCleaning ? data.cleaning_products_location.trim() || null : null,
        fragile_items_notes: isCleaning ? data.fragile_items_notes.trim() || null : null,
        cleaning_special_instructions: isCleaning ? data.cleaning_special_instructions.trim() || null : null,
        payment_notes: data.payment_notes.trim() || null,
        notes: data.notes.trim() || null,
      };

      let clientId = client?.id;

      if (isEditing) {
        const { error } = await supabase.from('clients').update(clientData).eq('id', clientId!);
        if (error) throw error;
      } else {
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();
        if (error) throw error;
        clientId = newClient.id;
      }

      // Handle pets
      if (isPetSitting && clientId) {
        const existingPetIds = (client?.pets || []).map((p) => p.id);
        const submittedPetIds = data.pets.filter((p) => p.id).map((p) => p.id!);
        const toDelete = existingPetIds.filter((id) => !submittedPetIds.includes(id));

        if (toDelete.length > 0) {
          await supabase.from('pets').delete().in('id', toDelete);
        }

        for (const pet of data.pets) {
          const petData = {
            client_id: clientId,
            name: pet.name.trim(),
            species: pet.species.trim() || null,
            breed: pet.breed.trim() || null,
            age: pet.age.trim() || null,
            color_markings: pet.color_markings.trim() || null,
            feeding_instructions: pet.feeding_instructions.trim() || null,
            medications: pet.medications.trim() || null,
            behavioral_notes: pet.behavioral_notes.trim() || null,
            outdoor_indoor: (pet.outdoor_indoor as any) || null,
            walk_instructions: pet.walk_instructions.trim() || null,
            vet_name: pet.vet_name.trim() || null,
            vet_phone: pet.vet_phone.trim() || null,
            vet_address: pet.vet_address.trim() || null,
            emergency_vet_name: pet.emergency_vet_name.trim() || null,
            emergency_vet_phone: pet.emergency_vet_phone.trim() || null,
          };

          if (pet.id) {
            await supabase.from('pets').update(petData).eq('id', pet.id);
          } else {
            await supabase.from('pets').insert(petData);
          }
        }
      } else if (!isPetSitting && clientId && isEditing) {
        await supabase.from('pets').delete().eq('client_id', clientId);
      }

      router.push(isEditing ? `/clients/${clientId}` : '/clients');
      router.refresh();
    } catch (err: any) {
      setGlobalError(err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-3 space-y-3">
      {/* Basic Info */}
      <CollapsibleSection
        title="Basic Information"
        icon={<UserIcon className="h-4 w-4 text-gray-600" />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name *"
            placeholder="Jane"
            error={errors.first_name?.message}
            {...register('first_name', { required: 'Required' })}
          />
          <Input
            label="Last Name *"
            placeholder="Doe"
            error={errors.last_name?.message}
            {...register('last_name', { required: 'Required' })}
          />
        </div>
        <Input label="Phone" type="tel" placeholder="(555) 000-0000" {...register('phone')} />
        <Input label="Email" type="email" placeholder="jane@example.com" {...register('email')} />
        <Input label="Address" placeholder="123 Main St, City, ST 00000" {...register('address')} />
        <Select
          label="Service Type *"
          options={SERVICE_OPTIONS}
          error={errors.service_type?.message}
          {...register('service_type', { required: 'Required' })}
        />
      </CollapsibleSection>

      {/* Emergency Contact */}
      <CollapsibleSection
        title="Emergency Contact"
        icon={<AlertCircleIcon className="h-4 w-4 text-red-500" />}
        defaultOpen={false}
      >
        <Input label="Contact Name" placeholder="John Doe" {...register('emergency_contact_name')} />
        <Input label="Contact Phone" type="tel" placeholder="(555) 000-0000" {...register('emergency_contact_phone')} />
      </CollapsibleSection>

      {/* Access & Entry */}
      <CollapsibleSection
        title="Access & Entry"
        icon={<KeyIcon className="h-4 w-4 text-amber-600" />}
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="Access Code" placeholder="1234" {...register('access_code')} />
          <Input label="Gate Code" placeholder="*5678" {...register('gate_code')} />
          <Input label="Alarm Code" placeholder="9999" {...register('alarm_code')} />
          <Input label="Key Location" placeholder="Under mat" {...register('key_location')} />
        </div>
        <Input label="Parking Instructions" placeholder="Park in driveway…" {...register('parking_instructions')} />
      </CollapsibleSection>

      {/* House Cleaning - conditional */}
      {isCleaning && (
        <CollapsibleSection
          title="Cleaning Details"
          icon={<HomeIcon className="h-4 w-4 text-blue-600" />}
          defaultOpen={true}
        >
          <div className="grid grid-cols-2 gap-3">
            <Input label="Home Size" placeholder="1,500 sq ft" {...register('home_size')} />
            <Select label="Frequency" options={FREQUENCY_OPTIONS} {...register('cleaning_frequency')} />
            <Input label="Bedrooms" type="number" placeholder="3" min="0" {...register('num_bedrooms')} />
            <Input label="Bathrooms" type="number" placeholder="2" min="0" {...register('num_bathrooms')} />
          </div>
          <Textarea
            label="Cleaning Products Preference"
            placeholder="Prefers eco-friendly products, no bleach…"
            rows={2}
            {...register('cleaning_products_preference')}
          />
          <Input label="Products Location" placeholder="Under kitchen sink" {...register('cleaning_products_location')} />
          <Textarea
            label="Fragile Items / Special Care"
            placeholder="Crystal vase on shelf, antique table…"
            rows={2}
            {...register('fragile_items_notes')}
          />
          <Textarea
            label="Special Instructions"
            placeholder="Don't move items on desk, use separate mop for bathroom…"
            rows={3}
            {...register('cleaning_special_instructions')}
          />
        </CollapsibleSection>
      )}

      {/* Pets - conditional */}
      {isPetSitting && (
        <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900">
          <div className="px-4 py-3 bg-purple-950/40 border-b border-purple-800/50 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-purple-300">
              <PawPrintIcon className="h-4 w-4" />
              Pets
              {petFields.length > 0 && (
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full ring-1 ring-purple-500/30">
                  {petFields.length}
                </span>
              )}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:bg-purple-900/40 gap-1"
              onClick={() => append(defaultPet())}
            >
              <PlusIcon className="h-4 w-4" />
              Add Pet
            </Button>
          </div>
          {petFields.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No pets added yet.</p>
              <button
                type="button"
                onClick={() => append(defaultPet())}
                className="mt-2 text-sm text-purple-400 font-medium hover:underline"
              >
                + Add first pet
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {petFields.map((field, index) => (
                <PetForm
                  key={field.id}
                  index={index}
                  register={register}
                  errors={errors}
                  onRemove={() => remove(index)}
                  petName={petNames?.[index]?.name}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Notes */}
      <CollapsibleSection
        title="Payment Notes"
        icon={<DollarSignIcon className="h-4 w-4 text-green-600" />}
        defaultOpen={false}
      >
        <Textarea
          label="Payment Notes"
          placeholder="Pays with cash on visit, Venmo @jane-doe…"
          rows={3}
          {...register('payment_notes')}
        />
      </CollapsibleSection>

      {/* General Notes */}
      <CollapsibleSection
        title="Notes"
        icon={<FileTextIcon className="h-4 w-4 text-gray-500" />}
        defaultOpen={false}
      >
        <Textarea
          label="General Notes"
          placeholder="Additional notes about this client…"
          rows={4}
          {...register('notes')}
        />
      </CollapsibleSection>

      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <div className="flex gap-3 pt-2 pb-4">
        <Button type="button" variant="secondary" fullWidth onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" fullWidth loading={saving}>
          {isEditing ? 'Save Changes' : 'Add Client'}
        </Button>
      </div>
    </form>
  );
}
