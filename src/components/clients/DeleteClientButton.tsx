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

    if (deleteError) { setError('Failed to archive client. Please try again.'); setLoading(false); return; }
    router.push('/clients');
    router.refresh();
  };

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:bg-red-950/30 gap-1.5 w-full justify-center"
        onClick={() => setConfirming(true)}
      >
        <TrashIcon className="h-4 w-4" />
        Archive Client
      </Button>
    );
  }

  return (
    <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 space-y-3">
      <p className="text-sm text-red-300 font-medium text-center">
        Archive <strong>{clientName}</strong>?
      </p>
      <p className="text-xs text-red-400 text-center">
        The client will be hidden from your list but data is preserved.
      </p>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" fullWidth onClick={() => setConfirming(false)}>Cancel</Button>
        <Button variant="danger" size="sm" fullWidth loading={loading} onClick={handleSoftDelete}>Archive</Button>
      </div>
    </div>
  );
}
