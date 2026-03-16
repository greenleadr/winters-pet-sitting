'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
}

export default function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSoftDelete = async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from('clients')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', clientId);

    if (deleteError) {
      setError('Failed to delete client. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/clients');
    router.refresh();
  };

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:bg-red-50 gap-1.5 w-full justify-center"
        onClick={() => setConfirming(true)}
      >
        <TrashIcon className="h-4 w-4" />
        Archive Client
      </Button>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
      <p className="text-sm text-red-800 font-medium text-center">
        Archive <strong>{clientName}</strong>?
      </p>
      <p className="text-xs text-red-700 text-center">
        The client will be hidden from your list but data is preserved.
      </p>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          fullWidth
          loading={loading}
          onClick={handleSoftDelete}
        >
          Archive
        </Button>
      </div>
    </div>
  );
}
