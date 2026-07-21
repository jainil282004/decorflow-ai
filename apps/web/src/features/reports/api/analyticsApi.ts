import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type { SaveReportDTO } from '@decorflow/shared';

// ==========================================
// ANALYTICS & DASHBOARDS
// ==========================================
export const useExecutiveSummary = () => {
  return useQuery({
    queryKey: ['executiveSummary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/executive');
      return data.data;
    },
  });
};

export const useFinancialAnalytics = () => {
  return useQuery({
    queryKey: ['financialAnalytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/financial');
      return data.data;
    },
  });
};

export const useInventoryAnalytics = () => {
  return useQuery({
    queryKey: ['inventoryAnalytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/inventory');
      return data.data;
    },
  });
};

export const useCustomerAnalytics = () => {
  return useQuery({
    queryKey: ['customerAnalytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/customers');
      return data.data;
    },
  });
};

// ==========================================
// REPORT BUILDER
// ==========================================
export const useSavedReports = () => {
  return useQuery({
    queryKey: ['savedReports'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/reports');
      return data.data;
    },
  });
};

export const useSaveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SaveReportDTO) => {
      const { data } = await apiClient.post('/analytics/reports', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedReports'] }),
  });
};
