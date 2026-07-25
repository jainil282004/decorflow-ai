import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema } from '@decorflow/shared';
import type { CreateEmployeeDTO } from '@decorflow/shared';
import { useCreateEmployee, useEmployees } from './api/workforceApi';
import { useOrganization } from '../saas/api/saasApi';
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

export const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { data: employees } = useEmployees();
  const createMutation = useCreateEmployee();

  const availableUsers = useMemo(() => {
    const linkedUserIds = new Set((employees || []).map((e: any) => e.userId).filter(Boolean));
    return (org?.users || []).filter((u: any) => !linkedUserIds.has(u.id) && !u.isLocked);
  }, [org?.users, employees]);

  const form = useForm<CreateEmployeeDTO>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      userId: '',
      employeeCode: '',
      department: '',
      position: '',
      status: 'ACTIVE',
      skills: '',
      certifications: '',
      contactNumber: '',
      emergencyContact: '',
    },
  });

  const onSubmit = (data: CreateEmployeeDTO) => {
    const payload: CreateEmployeeDTO = {
      userId: data.userId,
      status: data.status || 'ACTIVE',
      ...(data.employeeCode ? { employeeCode: data.employeeCode } : {}),
      ...(data.department ? { department: data.department } : {}),
      ...(data.position ? { position: data.position } : {}),
      ...(data.joinDate ? { joinDate: data.joinDate } : {}),
      ...(typeof data.salary === 'number' && !Number.isNaN(data.salary)
        ? { salary: data.salary }
        : {}),
      ...(data.skills ? { skills: data.skills } : {}),
      ...(data.certifications ? { certifications: data.certifications } : {}),
      ...(data.contactNumber ? { contactNumber: data.contactNumber } : {}),
      ...(data.emergencyContact ? { emergencyContact: data.emergencyContact } : {}),
    };

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/workforce'),
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <PageHeader
        title="Add Employee"
        description="Link a company user to a workforce employee profile."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/workforce')}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending || orgLoading}
            >
              {createMutation.isPending ? 'Saving…' : 'Create Employee'}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Employee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <FormControl>
                      <select className={selectClassName} {...field} disabled={orgLoading}>
                        <option value="">Select a user…</option>
                        {availableUsers.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                    {!orgLoading && availableUsers.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No available users. Invite a user in Settings first, or all users already
                        have employee profiles.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employeeCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. EMP-001" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select className={selectClassName} {...field}>
                          <option value="ACTIVE">Active</option>
                          <option value="ON_LEAVE">On Leave</option>
                          <option value="TERMINATED">Terminated</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Operations" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Setup Lead" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joinDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Join Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? String(field.value).slice(0, 10) : ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(
                              v ? new Date(`${v}T00:00:00.000Z`).toISOString() : undefined
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
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

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
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
                        placeholder="Comma-separated, e.g. Setup, Lighting"
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
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Input placeholder="Comma-separated" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as any)?.response?.data?.message ||
                    'Failed to create employee'}
                </p>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
