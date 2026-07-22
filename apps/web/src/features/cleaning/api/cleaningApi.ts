import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type { UpdateCleaningJobDTO } from '@decorflow/shared';

export const useCleaningJobs = (
  page = 1,
  limit = 20,
  options?: { status?: string; overdue?: boolean; recentlyWashed?: boolean }
) => {
  return useQuery({
    queryKey: ['cleaning', { page, limit, ...options }],
    queryFn: async () => {
      const response = await apiClient.get('/cleaning', {
        params: {
          page,
          limit,
          status: options?.status,
          overdue: options?.overdue ? 'true' : undefined,
          recentlyWashed: options?.recentlyWashed ? 'true' : undefined,
        },
      });
      return response.data.data;
    },
  });
};

export const useCleaningReminders = () => {
  return useQuery({
    queryKey: ['cleaning', 'reminders'],
    queryFn: async () => {
      const response = await apiClient.get('/cleaning/reminders');
      return response.data.data as any[];
    },
  });
};

export const useUpdateCleaningJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCleaningJobDTO }) => {
      const response = await apiClient.patch(`/cleaning/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
};
