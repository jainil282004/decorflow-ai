import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type {
  CreatePackingJobDTO,
  UpdatePackingItemDTO,
  VerifyPackingDTO,
  DispatchJobDTO,
  ReceiveReturnDTO,
} from '@decorflow/shared';

// Fetch all packing jobs
export const usePackingJobs = (page = 1, limit = 10, status?: string) => {
  return useQuery({
    queryKey: ['packing', { page, limit, status }],
    queryFn: async () => {
      const response = await apiClient.get('/packing', {
        params: { page, limit, status },
      });
      // Envelope: { success, data: { data: Job[], meta } }
      return response.data.data;
    },
  });
};

// Fetch a single packing job by ID
export const usePackingJob = (id: string) => {
  return useQuery({
    queryKey: ['packing', id],
    queryFn: async () => {
      const response = await apiClient.get(`/packing/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create a packing job
export const useCreatePackingJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePackingJobDTO) => {
      const response = await apiClient.post('/packing', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing'] });
    },
  });
};

// Update packing items (picked, missing, damaged quantities)
export const useUpdatePackingItems = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePackingItemDTO) => {
      const response = await apiClient.patch(`/packing/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', id] });
      queryClient.invalidateQueries({ queryKey: ['packing'] });
    },
  });
};

// Verify packing
export const useVerifyPacking = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VerifyPackingDTO) => {
      const response = await apiClient.post(`/packing/${id}/verify`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', id] });
      queryClient.invalidateQueries({ queryKey: ['packing'] });
    },
  });
};

// Dispatch job
export const useDispatchJob = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DispatchJobDTO) => {
      const response = await apiClient.post(`/packing/${id}/dispatch`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', id] });
      queryClient.invalidateQueries({ queryKey: ['packing'] });
    },
  });
};

// Receive returns
export const useReceiveReturns = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReceiveReturnDTO) => {
      const response = await apiClient.post(`/packing/${id}/return`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', id] });
      queryClient.invalidateQueries({ queryKey: ['packing'] });
    },
  });
};
