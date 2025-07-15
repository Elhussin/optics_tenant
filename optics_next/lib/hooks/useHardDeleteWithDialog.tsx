'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useFormRequest } from './useFormRequest';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type UseHardDeleteWithDialogProps = {
  alias: string;
  onSuccess?: () => void;
  message?: string;
  title?: string;
  redirectAfter?: boolean;
};

export function useHardDeleteWithDialog({
  alias,
  onSuccess,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to permanently delete this item?',
  redirectAfter = true,
}: UseHardDeleteWithDialogProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  console.log("alias",alias);
  const hardDeleteRequest = useFormRequest({
    alias,
    onSuccess: () => {
      toast.success('Item permanently deleted');
      onSuccess?.();
      if (redirectAfter) router.back();
    },
    onError: (err) => {
      console.error('Hard delete error:', err.response?.data?.detail);
      toast.error(err.response?.data?.detail);
    },
  });


  const confirmHardDelete = (id: string | number) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (selectedId) {
      hardDeleteRequest.submitForm({ id: selectedId });
      setShowDialog(false);
    }
  };

  const ConfirmDialogComponent = (
    <ConfirmDialog
      open={showDialog}
      title={title}
      message={message}
      onCancel={() => setShowDialog(false)}
      onConfirm={handleConfirm}
    />
  );

  return {
    confirmHardDelete,
    ConfirmDialogComponent,
  };
}
