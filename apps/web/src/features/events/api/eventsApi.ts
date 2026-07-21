import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type { CreateEventDTO, UpdateEventDTO, EventResponseDTO } from '@decorflow/shared';

// =====================================
// API Functions
// =====================================
const getEvents = async (
  page = 1,
  limit = 10,
  search = '',
  statusId?: string,
  typeId?: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: EventResponseDTO[]; meta: { totalPages: number; total: number } }> => {
  const { data } = await apiClient.get('/events', {
    params: { page, limit, search, statusId, typeId, startDate, endDate },
  });
  // API envelope: { success, data: { data: Event[], meta } }
  return data.data;
};

const getEvent = async (id: string): Promise<{ data: EventResponseDTO }> => {
  const { data } = await apiClient.get(`/events/${id}`);
  return data;
};

const getEventTypes = async () => {
  const { data } = await apiClient.get('/events/types');
  return data.data;
};

const getEventStatuses = async () => {
  const { data } = await apiClient.get('/events/statuses');
  return data.data;
};

const createEvent = async (payload: CreateEventDTO): Promise<{ data: EventResponseDTO }> => {
  const { data } = await apiClient.post('/events', payload);
  return data;
};

const updateEvent = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateEventDTO;
}): Promise<{ data: EventResponseDTO }> => {
  const { data } = await apiClient.patch(`/events/${id}`, payload);
  return data;
};

const archiveEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/events/${id}`);
};

const restoreEvent = async (id: string): Promise<void> => {
  await apiClient.post(`/events/${id}/restore`);
};

const duplicateEvent = async (id: string): Promise<{ data: EventResponseDTO }> => {
  const { data } = await apiClient.post(`/events/${id}/duplicate`);
  return data;
};

// =====================================
// React Query Hooks
// =====================================

export const useEvents = (
  page: number,
  limit: number,
  search: string,
  statusId?: string,
  typeId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['events', { page, limit, search, statusId, typeId, startDate, endDate }],
    queryFn: () => getEvents(page, limit, search, statusId, typeId, startDate, endDate),
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });
};

export const useEventTypes = () => {
  return useQuery({
    queryKey: ['eventTypes'],
    queryFn: getEventTypes,
  });
};

export const useEventStatuses = () => {
  return useQuery({
    queryKey: ['eventStatuses'],
    queryFn: getEventStatuses,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useRestoreEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDuplicateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
