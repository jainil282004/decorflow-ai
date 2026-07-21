import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { useBranches, useCreateBranch } from './api/saasApi';
import { Plus, MapPin } from 'lucide-react';

interface BranchFormData {
  name: string;
  code: string;
  address: string;
}

export const BranchSettings = () => {
  const { data: branches, isLoading } = useBranches();
  const createBranchMutation = useCreateBranch();

  const form = useForm<BranchFormData>({
    defaultValues: { name: '', code: '', address: '' },
  });

  const onSubmit = (data: BranchFormData) => {
    createBranchMutation.mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          Branch / Location Management
        </CardTitle>
        <CardDescription>
          Add multiple branches or franchise locations to manage separate inventories and events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 p-4 border rounded-lg bg-card/50"
          >
            <h4 className="font-medium text-sm">Add New Branch</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mumbai North" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BOM-N" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Andheri East" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={createBranchMutation.isPending} className="w-fit">
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </form>
        </Form>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Active Branches</h4>
          {isLoading ? (
            <p className="text-sm">Loading branches...</p>
          ) : branches?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional branches found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches?.map((branch: any) => (
                <div
                  key={branch.id}
                  className="p-4 border rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h5 className="font-semibold">{branch.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {branch.code} • {branch.address}
                    </p>
                  </div>
                  {branch.isActive ? (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Active
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
