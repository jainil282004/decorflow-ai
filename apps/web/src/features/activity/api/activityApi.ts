import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { ActivityLogResponseDTO } from '@decorflow/shared';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useGlobalActivityFeed = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['activityFeed', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: PaginatedResponse<ActivityLogResponseDTO & { user: any }>;
      }>('/activity/feed', {
        params: { page, limit },
      });
      return data.data;
    },
    refetchInterval: 60000, // Poll for live feed
  });
};

export const useActivityTimeline = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: ['activityTimeline', entityType, entityId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ActivityLogResponseDTO[] }>(
        `/activity/timeline/${entityType}/${entityId}`
      );
      return data.data;
    },
    enabled: !!entityId && !!entityType,
  });
};
