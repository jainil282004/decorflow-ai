import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type { CreateCustomerDTO, UpdateCustomerDTO, CustomerResponseDTO } from '@decorflow/shared';

// =====================================
// API Functions
// =====================================
const getCustomers = async (
  page = 1,
  limit = 10,
  search = ''
): Promise<{ data: CustomerResponseDTO[]; meta: { totalPages: number } }> => {
  const { data } = await apiClient.get('/customers', {
    params: { page, limit, search },
  });
  // API envelope: { success, data: { data: Customer[], meta } }
  return data.data;
};

const getCustomer = async (id: string): Promise<{ data: CustomerResponseDTO }> => {
  const { data } = await apiClient.get(`/customers/${id}`);
  return data;
};

const createCustomer = async (dto: CreateCustomerDTO) => {
  const { data } = await apiClient.post('/customers', dto);
  return data;
};

const updateCustomer = async ({ id, dto }: { id: string; dto: UpdateCustomerDTO }) => {
  const { data } = await apiClient.patch(`/customers/${id}`, dto);
  return data;
};

const deleteCustomer = async (id: string) => {
  const { data } = await apiClient.delete(`/customers/${id}`);
  return data;
};

const restoreCustomer = async (id: string) => {
  const { data } = await apiClient.post(`/customers/${id}/restore`);
  return data;
};

// =====================================
// Hooks
// =====================================
export const useCustomers = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ['customers', { page, limit, search }],
    queryFn: () => getCustomers(page, limit, search),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useRestoreCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
