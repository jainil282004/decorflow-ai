import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type {
  CreateQuotationDTO,
  CreateInvoiceDTO,
  RecordPaymentDTO,
  CreateVendorBillDTO,
  RecordVendorPaymentDTO,
  CreateExpenseDTO,
} from '@decorflow/shared';

// ==========================================
// QUOTATIONS
// ==========================================
export const useQuotations = () => {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/quotations');
      return data.data;
    },
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateQuotationDTO) => {
      const { data } = await apiClient.post('/finance/quotations', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotations'] }),
  });
};

export const useQuotation = (id: string) => {
  return useQuery({
    queryKey: ['quotations', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/finance/quotations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateQuotationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/finance/quotations/${id}/status`, { status });
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', variables.id] });
      if (variables.status === 'APPROVED') {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
    },
  });
};

// ==========================================
// INVOICES & PAYMENTS
// ==========================================
export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/invoices');
      return data.data;
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/finance/invoices/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInvoiceDTO) => {
      const { data } = await apiClient.post('/finance/invoices', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RecordPaymentDTO) => {
      const { data } = await apiClient.post('/finance/payments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
    },
  });
};

// ==========================================
// VENDOR BILLS
// ==========================================
export const useVendorBills = () => {
  return useQuery({
    queryKey: ['vendorBills'],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/vendor-bills');
      return data.data;
    },
  });
};

export const useCreateVendorBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateVendorBillDTO) => {
      const { data } = await apiClient.post('/finance/vendor-bills', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorBills'] }),
  });
};

export const useRecordVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RecordVendorPaymentDTO) => {
      const { data } = await apiClient.post('/finance/vendor-payments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorBills'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
    },
  });
};

// ==========================================
// EXPENSES
// ==========================================
export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/expenses');
      return data.data;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExpenseDTO) => {
      const { data } = await apiClient.post('/finance/expenses', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useUpdateExpenseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/finance/expenses/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
    },
  });
};

// ==========================================
// ANALYTICS
// ==========================================
export const useCashFlow = () => {
  return useQuery({
    queryKey: ['cashFlow'],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/analytics/cash-flow');
      return data.data;
    },
  });
};
