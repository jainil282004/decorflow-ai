import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type {
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  InventoryItemResponseDTO,
} from '@decorflow/shared';

// =====================================
// API Functions
// =====================================
const getItems = async (
  page = 1,
  limit = 10,
  search = '',
  categoryId?: string
): Promise<{ data: InventoryItemResponseDTO[]; meta: { totalPages: number; total: number } }> => {
  const { data } = await apiClient.get('/inventory', {
    params: { page, limit, search, categoryId },
  });
  // API envelope: { success, data: { data: Item[], meta } }
  return data.data;
};

const getItem = async (id: string): Promise<{ data: InventoryItemResponseDTO }> => {
  const { data } = await apiClient.get(`/inventory/${id}`);
  return data;
};

const createItem = async (
  payload: CreateInventoryItemDTO
): Promise<{ data: InventoryItemResponseDTO }> => {
  const { data } = await apiClient.post('/inventory', payload);
  return data;
};

const updateItem = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateInventoryItemDTO;
}): Promise<{ data: InventoryItemResponseDTO }> => {
  const { data } = await apiClient.patch(`/inventory/${id}`, payload);
  return data;
};

const archiveItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/inventory/${id}`);
};

const restoreItem = async (id: string): Promise<void> => {
  await apiClient.post(`/inventory/${id}/restore`);
};

// =====================================
// React Query Hooks
// =====================================

export const useInventoryItems = (
  page: number,
  limit: number,
  search: string,
  categoryId?: string
) => {
  return useQuery({
    queryKey: ['inventory', { page, limit, search, categoryId }],
    queryFn: () => getItems(page, limit, search, categoryId),
  });
};

const getCategories = async () => {
  const { data } = await apiClient.get('/inventory/categories');
  return data.data;
};

export const useInventoryCategories = () => {
  return useQuery({
    queryKey: ['inventoryCategories'],
    queryFn: getCategories,
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => getItem(id),
    enabled: !!id,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.id] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useRestoreInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
