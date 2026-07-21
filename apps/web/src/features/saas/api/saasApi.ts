import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type {
  UpdateOrganizationDTO,
  InviteUserDTO,
  SuspendUserDTO,
  SubscriptionUpgradeDTO,
} from '@decorflow/shared';

// ==========================================
// ORGANIZATION
// ==========================================
export const useOrganization = () => {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data } = await apiClient.get('/saas/organization');
      return data.data;
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateOrganizationDTO) => {
      const { data } = await apiClient.patch('/saas/organization', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization'] }),
  });
};

// ==========================================
// USERS & INVITATIONS
// ==========================================
export const useInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/saas/invites');
      return data.data;
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InviteUserDTO) => {
      const { data } = await apiClient.post('/saas/invites', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SuspendUserDTO) => {
      const { data } = await apiClient.patch('/saas/users/suspend', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization'] }),
  });
};

// ==========================================
// SUBSCRIPTIONS
// ==========================================
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/saas/subscription/plans');
      return data.data;
    },
  });
};

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubscriptionUpgradeDTO) => {
      const { data } = await apiClient.post('/saas/subscription/upgrade', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization'] }),
  });
};

// ==========================================
// SUPER ADMIN
// ==========================================
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/saas/admin/stats');
      return data.data;
    },
  });
};

// ==========================================
// BRANCHES
// ==========================================
export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await apiClient.get('/saas/branches');
      return data.data;
    },
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/saas/branches', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });
};
