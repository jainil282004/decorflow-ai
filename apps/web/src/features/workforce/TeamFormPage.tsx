import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTeamSchema } from '@decorflow/shared';
import type { CreateTeamDTO } from '@decorflow/shared';
import { useCreateTeam, useEmployees } from './api/workforceApi';
import { PageHeader } from '../../components/PageHeader';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export const TeamFormPage = () => {
  const navigate = useNavigate();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const createMutation = useCreateTeam();

  const form = useForm<CreateTeamDTO>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      leaderId: undefined,
      capacity: undefined,
      skills: '',
      memberIds: [],
    },
  });

  const onSubmit = (data: CreateTeamDTO) => {
    const payload: CreateTeamDTO = {
      name: data.name.trim(),
      ...(data.description ? { description: data.description } : {}),
      ...(data.leaderId ? { leaderId: data.leaderId } : {}),
      ...(typeof data.capacity === 'number' && !Number.isNaN(data.capacity)
        ? { capacity: data.capacity }
        : {}),
      ...(data.skills ? { skills: data.skills } : {}),
      ...(data.memberIds && data.memberIds.length > 0 ? { memberIds: data.memberIds } : {}),
    };

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/workforce'),
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <PageHeader
        title="Create Team"
        description="Define a crew with an optional leader and members."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/workforce')}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending || employeesLoading}
            >
              {createMutation.isPending ? 'Saving…' : 'Create Team'}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Setup Crew A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional description"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="leaderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Leader</FormLabel>
                      <FormControl>
                        <select
                          className={selectClassName}
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? e.target.value : undefined)
                          }
                          disabled={employeesLoading}
                        >
                          <option value="">Unassigned</option>
                          {(employees || []).map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.user?.name || emp.employeeCode || emp.id}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="Optional"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === '' ? undefined : Number(v));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Comma-separated, e.g. Floral, Draping"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Members</FormLabel>
                    <div className="rounded-md border border-input p-3 space-y-2 max-h-56 overflow-y-auto">
                      {employeesLoading ? (
                        <p className="text-sm text-muted-foreground">Loading employees…</p>
                      ) : !employees?.length ? (
                        <p className="text-sm text-muted-foreground">
                          No employees yet. Add employees first to assign members.
                        </p>
                      ) : (
                        employees.map((emp: any) => {
                          const checked = (field.value || []).includes(emp.id);
                          return (
                            <label
                              key={emp.id}
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-input"
                                checked={checked}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    e.target.checked
                                      ? [...current, emp.id]
                                      : current.filter((id: string) => id !== emp.id)
                                  );
                                }}
                              />
                              <span>
                                {emp.user?.name || emp.employeeCode || emp.id}
                                {emp.position ? (
                                  <span className="text-muted-foreground"> — {emp.position}</span>
                                ) : null}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as any)?.response?.data?.message ||
                    'Failed to create team'}
                </p>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
