'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteOrder } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeleteOrderButtonProps {
  orderId: string;
  invoiceRef: string;
  clientName?: string;
  variant?: 'icon' | 'button' | 'outline';
  redirectUrl?: string;
  className?: string;
}

export function DeleteOrderButton({
  orderId,
  invoiceRef,
  clientName,
  variant = 'icon',
  redirectUrl,
  className = '',
}: DeleteOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOrder(orderId);
      setIsOpen(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button
            size="sm"
            variant="ghost"
            className={`h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ${className}`}
            title={`Delete Invoice #${invoiceRef}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : variant === 'outline' ? (
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 ${className}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Order
          </Button>
        ) : (
          <Button
            variant="destructive"
            className={`gap-2 font-semibold shadow-xs ${className}`}
          >
            <Trash2 className="h-4 w-4" />
            Delete Order
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-bakery-espresso">
                Delete Order #{invoiceRef}?
              </DialogTitle>
              <DialogDescription className="text-xs text-bakery-muted mt-0.5">
                {clientName ? `Client: ${clientName}` : 'Permanent Action'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="text-sm text-bakery-espresso/80 space-y-2 py-2">
          <p>
            Are you sure you want to permanently delete order{' '}
            <strong className="font-mono text-bakery-espresso">#{invoiceRef}</strong>?
          </p>
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
            This will permanently remove the invoice, line items, batch records, and update all revenue calculations. This cannot be undone.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel / Keep Order
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs gap-1.5 font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Yes, Delete Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
