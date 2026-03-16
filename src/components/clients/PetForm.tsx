'use client';

import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from 'lucide-react';
import { ClientFormData } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import { PawPrintIcon } from 'lucide-react';

interface PetFormProps {
  index: number;
  register: UseFormRegister<ClientFormData>;
  errors: FieldErrors<ClientFormData>;
  onRemove: () => void;
  petName?: string;
}

const OUTDOOR_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'indoor', label: 'Indoor only' },
  { value: 'outdoor', label: 'Outdoor only' },
  { value: 'both', label: 'Indoor & Outdoor' },
];

export default function PetForm({ index, register, errors, onRemove, petName }: PetFormProps) {
  const petErrors = (errors.pets as any)?.[index];

  return (
    <div className="border border-purple-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-purple-50">
        <span className="flex items-center gap-2 text-sm font-semibold text-purple-800">
          <PawPrintIcon className="h-4 w-4" />
          {petName || `Pet ${index + 1}`}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
          aria-label="Remove pet"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Pet Name *"
            placeholder="Buddy"
            error={petErrors?.name?.message}
            {...register(`pets.${index}.name`, { required: 'Name required' })}
          />
          <Select
            label="Species"
            options={[
              { value: '', label: 'Select…' },
              { value: 'Dog', label: 'Dog' },
              { value: 'Cat', label: 'Cat' },
              { value: 'Bird', label: 'Bird' },
              { value: 'Rabbit', label: 'Rabbit' },
              { value: 'Fish', label: 'Fish' },
              { value: 'Other', label: 'Other' },
            ]}
            {...register(`pets.${index}.species`)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Breed"
            placeholder="Labrador"
            {...register(`pets.${index}.breed`)}
          />
          <Input
            label="Age"
            placeholder="3 years"
            {...register(`pets.${index}.age`)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Color / Markings"
            placeholder="Brown, white spot"
            {...register(`pets.${index}.color_markings`)}
          />
          <Select
            label="Indoor/Outdoor"
            options={OUTDOOR_OPTIONS}
            {...register(`pets.${index}.outdoor_indoor`)}
          />
        </div>

        {/* Care instructions */}
        <Textarea
          label="Feeding Instructions"
          placeholder="½ cup dry food twice daily…"
          rows={2}
          {...register(`pets.${index}.feeding_instructions`)}
        />

        <Textarea
          label="Medications"
          placeholder="Daily pill, dose, timing…"
          rows={2}
          hint="Include dose, timing, and method"
          {...register(`pets.${index}.medications`)}
        />

        <Textarea
          label="Behavioral Notes"
          placeholder="Friendly, doesn't like loud noises…"
          rows={2}
          {...register(`pets.${index}.behavioral_notes`)}
        />

        <Textarea
          label="Walk Instructions"
          placeholder="30 min walk AM and PM, keep on leash…"
          rows={2}
          {...register(`pets.${index}.walk_instructions`)}
        />

        {/* Vet info */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vet Information</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Vet Name"
                placeholder="Dr. Smith"
                {...register(`pets.${index}.vet_name`)}
              />
              <Input
                label="Vet Phone"
                type="tel"
                placeholder="(555) 000-0000"
                {...register(`pets.${index}.vet_phone`)}
              />
            </div>
            <Input
              label="Vet Address"
              placeholder="123 Main St"
              {...register(`pets.${index}.vet_address`)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Emergency Vet"
                placeholder="24hr Animal Hospital"
                {...register(`pets.${index}.emergency_vet_name`)}
              />
              <Input
                label="Emergency Vet Phone"
                type="tel"
                placeholder="(555) 000-0000"
                {...register(`pets.${index}.emergency_vet_phone`)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
