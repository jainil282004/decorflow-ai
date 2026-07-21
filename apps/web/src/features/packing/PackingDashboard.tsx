import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePackingJobs } from './api/packingApi';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Icon } from '../../components/ui/icon';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { format } from 'date-fns';

export const PackingDashboard = () => {
  const navigate = useNavigate();
  const [page] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const limit = 10;

  const { data, isLoading } = usePackingJobs(page, limit, status);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Pending
          </Badge>
        );
      case 'PACKING':
        return (
          <Badge variant="secondary" className="bg-primary/20 text-primary border-transparent">
            Packing
          </Badge>
        );
      case 'PACKED':
        return (
          <Badge
            variant="default"
            className="bg-emerald-100 text-emerald-800 border-transparent hover:bg-emerald-200"
          >
            Packed
          </Badge>
        );
      case 'VERIFIED':
        return (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-800 border-transparent hover:bg-blue-200"
          >
            Verified
          </Badge>
        );
      case 'DISPATCHED':
        return (
          <Badge
            variant="default"
            className="bg-indigo-100 text-indigo-800 border-transparent hover:bg-indigo-200"
          >
            Dispatched
          </Badge>
        );
      case 'RETURNED':
        return (
          <Badge
            variant="default"
            className="bg-purple-100 text-purple-800 border-transparent hover:bg-purple-200"
          >
            Returned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Dispatch & Packing"
        description="Manage warehouse execution, packing jobs, and inventory returns."
      >
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatus(undefined)}
            className={!status ? 'bg-muted' : ''}
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatus('PENDING')}
            className={status === 'PENDING' ? 'bg-muted' : ''}
          >
            Pending
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatus('PACKING')}
            className={status === 'PACKING' ? 'bg-muted' : ''}
          >
            Packing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatus('PACKED')}
            className={status === 'PACKED' ? 'bg-muted' : ''}
          >
            To Verify
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatus('VERIFIED')}
            className={status === 'VERIFIED' ? 'bg-muted' : ''}
          >
            To Dispatch
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatus('DISPATCHED')}
            className={status === 'DISPATCHED' ? 'bg-muted' : ''}
          >
            Dispatched
          </Button>
          <Button size="sm" onClick={() => navigate('/packing/new')}>
            <Icon name="Plus" className="w-4 h-4 mr-1" /> New Job
          </Button>
        </div>
      </PageHeader>

      <Card>
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : !data?.data?.length ? (
          <EmptyState
            title="No packing jobs found"
            description={
              status
                ? `No jobs found with status ${status}.`
                : 'There are currently no packing jobs.'
            }
            actionLabel={status ? 'Clear Filter' : 'New Job'}
            onAction={() => (status ? setStatus(undefined) : navigate('/packing/new'))}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((job: any) => (
                <TableRow
                  key={job.id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/packing/${job.id}`)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-serif font-medium text-foreground group-hover:text-primary transition-colors">
                        {job.event?.title || 'Unknown Event'}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                        {job.items?.length || 0} Items
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{job.warehouse?.name || 'Main Warehouse'}</span>
                  </TableCell>
                  <TableCell>{renderStatusBadge(job.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(job.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Job <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination controls could go here using data?.meta */}
    </div>
  );
};
