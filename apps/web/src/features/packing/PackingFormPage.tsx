import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../events/api/eventsApi';
import { useInventoryItems } from '../inventory/api/inventoryApi';
import { useCreatePackingJob } from './api/packingApi';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Icon } from '../../components/ui/icon';
import { Loader2 } from 'lucide-react';

type LineItem = {
  variantId: string;
  label: string;
  expectedQuantity: number;
};

export const PackingFormPage = () => {
  const navigate = useNavigate();
  const { data: eventsResponse, isLoading: eventsLoading } = useEvents(1, 50, '');
  const { data: inventoryResponse, isLoading: inventoryLoading } = useInventoryItems(1, 50, '');
  const createJob = useCreatePackingJob();

  const events = eventsResponse?.data || [];
  const inventoryItems = inventoryResponse?.data || [];

  const variants = useMemo(() => {
    return inventoryItems.flatMap((item: any) =>
      (item.variants || []).map((variant: any) => ({
        id: variant.id,
        label: `${item.name} — ${variant.name}`,
      }))
    );
  }, [inventoryItems]);

  const [eventId, setEventId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState<LineItem[]>([]);
  const [error, setError] = useState('');

  const addItem = () => {
    if (!selectedVariantId) return;
    const variant = variants.find((v: any) => v.id === selectedVariantId);
    if (!variant) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === selectedVariantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === selectedVariantId
            ? { ...i, expectedQuantity: i.expectedQuantity + qty }
            : i
        );
      }
      return [
        ...prev,
        { variantId: selectedVariantId, label: variant.label, expectedQuantity: qty },
      ];
    });
    setSelectedVariantId('');
    setQty(1);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!eventId) {
      setError('Select an event');
      return;
    }
    if (!items.length) {
      setError('Add at least one inventory item');
      return;
    }

    try {
      const job = await createJob.mutateAsync({
        eventId,
        items: items.map((i) => ({
          variantId: i.variantId,
          expectedQuantity: i.expectedQuantity,
        })),
      });
      navigate(`/packing/${job.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create packing job');
    }
  };

  const loading = eventsLoading || inventoryLoading;

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div
        className="flex items-center gap-4 text-sm text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors w-fit"
        onClick={() => navigate('/packing')}
      >
        <Icon name="ArrowLeft" className="h-4 w-4" /> Back to Packing
      </div>

      <PageHeader
        title="New Packing Job"
        description="Link an event and the inventory items that need to be packed for dispatch."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <select
                  id="event"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                >
                  <option value="">Select event…</option>
                  {events.map((event: any) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
                {!events.length && (
                  <p className="text-xs text-muted-foreground">
                    No events yet. Create an event first, then come back here.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Packing Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_100px_auto]">
                <div className="space-y-2">
                  <Label htmlFor="variant">Inventory item</Label>
                  <select
                    id="variant"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                  >
                    <option value="">Select item…</option>
                    {variants.map((variant: any) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qty">Qty</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    disabled={!selectedVariantId}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {!variants.length && (
                <p className="text-xs text-muted-foreground">
                  No inventory variants found. Add catalog items with variants first.
                </p>
              )}

              {items.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.expectedQuantity}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.variantId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/packing')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Packing Job
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
