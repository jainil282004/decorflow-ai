import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type {
  CreateVendorDTO,
  CreatePurchaseRequisitionDTO,
  CreatePurchaseOrderDTO,
  CreateGoodsReceiptDTO,
} from '@decorflow/shared';

// Vendors
export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/procurement/vendors');
      return response.data.data;
    },
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      const response = await apiClient.get(`/procurement/vendors/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorDTO) => {
      const response = await apiClient.post('/procurement/vendors', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

// Requisitions
export const useRequisitions = () => {
  return useQuery({
    queryKey: ['requisitions'],
    queryFn: async () => {
      const response = await apiClient.get('/procurement/requisitions');
      return response.data.data;
    },
  });
};

export const useCreateRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePurchaseRequisitionDTO) => {
      const response = await apiClient.post('/procurement/requisitions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
};

// Orders (PO)
export const useOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      const response = await apiClient.get('/procurement/orders');
      return response.data.data;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['purchaseOrders', id],
    queryFn: async () => {
      const response = await apiClient.get(`/procurement/orders/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderDTO) => {
      const response = await apiClient.post('/procurement/orders', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
};

// GRN
export const useReceiveGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateGoodsReceiptDTO }) => {
      const response = await apiClient.post(`/procurement/orders/${id}/receive`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders', variables.id] });
    },
  });
};

// Analytics
export const useLowStock = () => {
  return useQuery({
    queryKey: ['procurement', 'lowStock'],
    queryFn: async () => {
      const response = await apiClient.get('/procurement/analytics/low-stock');
      return response.data.data;
    },
  });
};
