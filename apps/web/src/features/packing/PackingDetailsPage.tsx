import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  usePackingJob,
  useStartPacking,
  useUpdatePackingItems,
  useVerifyPacking,
  useDispatchJob,
  useReceiveReturns,
} from './api/packingApi';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Icon } from '../../components/ui/icon';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { InventoryConditionDialog } from './components/InventoryConditionDialog';

export const PackingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, isError, refetch } = usePackingJob(id!);

  const startPacking = useStartPacking(id!);
  const updateItems = useUpdatePackingItems(id!);
  const verifyJob = useVerifyPacking(id!);
  const dispatchJob = useDispatchJob(id!);
  const receiveReturns = useReceiveReturns(id!);

  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  /** Draft picked qty keyed by packing line id — staff must enter these explicitly. */
  const [pickedDraft, setPickedDraft] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!job?.items) return;
    const next: Record<string, number> = {};
    for (const item of job.items) {
      next[item.id] = item.pickedQuantity ?? 0;
    }
    setPickedDraft(next);
  }, [job?.id, job?.status, job?.items]);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8 p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] md:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Could not load packing job"
          description="Something went wrong while fetching this job. Check your connection and try again."
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Job Not Found"
          description="The packing job you are looking for does not exist."
          actionLabel="Back to Dashboard"
          onAction={() => navigate('/packing')}
        />
      </div>
    );
  }

  const canEditPicks = job.status === 'PACKING';
  const allLinesConfirmed =
    job.items?.length > 0 &&
    job.items.every((item: any) => (pickedDraft[item.id] ?? 0) === item.expectedQuantity);

  const handleStartPacking = () => {
    // Opens the packing session only — does not mark any quantities as picked.
    startPacking.mutate();
  };

  const handleSavePicks = () => {
    const items = job.items.map((i: any) => ({
      id: i.id,
      pickedQuantity: pickedDraft[i.id] ?? 0,
      missingQuantity: i.missingQuantity ?? 0,
      damagedQuantity: i.damagedQuantity ?? 0,
    }));
    updateItems.mutate({ items });
  };

  const handleVerify = () => {
    verifyJob.mutate({ verificationNotes: 'All items verified and accounted for.' });
  };

  const handleDispatch = () => {
    dispatchJob.mutate({
      dispatchNotes: 'Dispatched to venue.',
      dispatchChecklist: JSON.stringify({ vehicleChecked: true, loadedSafely: true }),
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <div
        className="flex items-center gap-4 text-sm text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors w-fit"
        onClick={() => navigate('/packing')}
      >
        <Icon name="ArrowLeft" className="h-4 w-4" /> Back to Dashboard
      </div>

      <PageHeader
        title={`Job for ${job.event?.title || 'Unknown Event'}`}
        description={`Status: ${job.status} | Warehouse: ${job.warehouse?.name || 'Main'}`}
      >
        <div className="flex gap-3">
          {job.status === 'PENDING' && (
            <Button onClick={handleStartPacking} disabled={startPacking.isPending}>
              {startPacking.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Packing
            </Button>
          )}
          {canEditPicks && (
            <Button onClick={handleSavePicks} disabled={updateItems.isPending}>
              {updateItems.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {allLinesConfirmed ? 'Complete Packing' : 'Save Progress'}
            </Button>
          )}
          {job.status === 'PACKED' && (
            <Button onClick={handleVerify} disabled={verifyJob.isPending}>
              {verifyJob.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Packing
            </Button>
          )}
          {job.status === 'VERIFIED' && (
            <Button onClick={handleDispatch} disabled={dispatchJob.isPending}>
              {dispatchJob.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Dispatch to Venue
            </Button>
          )}
          {job.status === 'DISPATCHED' && (
            <Button onClick={() => setConditionDialogOpen(true)}>Process Return</Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Packing List</CardTitle>
              {canEditPicks && (
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the quantity actually picked for each line, then save. Packing completes
                  only when every line matches its expected quantity.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!job.items?.length ? (
                  <EmptyState
                    title="No items on this packing list"
                    description="This job has no line items yet. Add items when creating the packing job."
                    className="min-h-[180px] border-0 bg-transparent"
                  />
                ) : (
                  job.items.map((item: any) => {
                    const draftPicked = pickedDraft[item.id] ?? item.pickedQuantity ?? 0;
                    const isLineComplete = draftPicked === item.expectedQuantity;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 p-4 border border-border rounded-xl bg-muted/20"
                      >
                        <div className="min-w-0">
                          <h4 className="font-medium text-foreground">
                            {item.variant?.name || item.variant?.item?.name || 'Unknown Item'}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Expected: {item.expectedQuantity}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {canEditPicks ? (
                            <div className="flex items-center gap-2 justify-end">
                              <label
                                htmlFor={`picked-${item.id}`}
                                className="text-sm text-muted-foreground whitespace-nowrap"
                              >
                                Picked
                              </label>
                              <Input
                                id={`picked-${item.id}`}
                                type="number"
                                min={0}
                                max={item.expectedQuantity}
                                value={draftPicked}
                                onChange={(e) => {
                                  const raw = e.target.value === '' ? 0 : Number(e.target.value);
                                  const clamped = Math.max(
                                    0,
                                    Math.min(
                                      item.expectedQuantity,
                                      Number.isFinite(raw) ? Math.floor(raw) : 0
                                    )
                                  );
                                  setPickedDraft((prev) => ({ ...prev, [item.id]: clamped }));
                                }}
                                className="w-20 text-right"
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-medium">
                              Picked:{' '}
                              <span
                                className={
                                  item.pickedQuantity === item.expectedQuantity
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }
                              >
                                {item.pickedQuantity}
                              </span>
                            </div>
                          )}
                          {canEditPicks && (
                            <p
                              className={`text-xs mt-1 ${
                                isLineComplete ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              {isLineComplete ? 'Confirmed' : 'Not confirmed'}
                            </p>
                          )}
                          {(item.missingQuantity > 0 || item.damagedQuantity > 0) && (
                            <div className="text-xs text-destructive mt-1">
                              {item.missingQuantity > 0 && `Missing: ${item.missingQuantity} `}
                              {item.damagedQuantity > 0 && `Damaged: ${item.damagedQuantity}`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-semibold block mb-1">
                  Event
                </span>
                <span className="font-medium">{job.event?.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-semibold block mb-1">
                  Customer
                </span>
                <span className="font-medium">{job.event?.customer?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-semibold block mb-1">
                  Venue
                </span>
                <span className="font-medium">
                  {job.event?.venue?.name || 'No venue specified'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="relative pl-4 border-l-2 border-border space-y-4">
                {job.packedAt && (
                  <div className="relative">
                    <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-primary" />
                    <p className="font-medium">Packed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.packedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {job.verifiedAt && (
                  <div className="relative">
                    <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-primary" />
                    <p className="font-medium">Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.verifiedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {job.dispatchedAt && (
                  <div className="relative">
                    <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-primary" />
                    <p className="font-medium">Dispatched</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.dispatchedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {job.returnedAt && (
                  <div className="relative">
                    <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-primary" />
                    <p className="font-medium">Returned</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.returnedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InventoryConditionDialog
        open={conditionDialogOpen}
        onOpenChange={setConditionDialogOpen}
        job={job}
        onProcessReturn={(data) => {
          receiveReturns.mutate(data);
          setConditionDialogOpen(false);
        }}
      />
    </div>
  );
};
