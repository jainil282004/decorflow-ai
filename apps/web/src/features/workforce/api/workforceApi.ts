import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type {
  CreateEmployeeDTO,
  CreateTeamDTO,
  CreateTaskDTO,
  UpdateTaskDTO,
  CheckInDTO,
  CheckOutDTO,
} from '@decorflow/shared';

// Employees
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/employees');
      return response.data.data;
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEmployeeDTO) => {
      const response = await apiClient.post('/workforce/employees', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

// Teams
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/teams');
      return response.data.data;
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTeamDTO) => {
      const response = await apiClient.post('/workforce/teams', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// Tasks
export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/tasks');
      return response.data.data;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaskDTO) => {
      const response = await apiClient.post('/workforce/tasks', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDTO }) => {
      const response = await apiClient.patch(`/workforce/tasks/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useToggleTaskChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      itemId,
      isCompleted,
    }: {
      taskId: string;
      itemId: string;
      isCompleted: boolean;
    }) => {
      const response = await apiClient.patch(`/workforce/tasks/${taskId}/checklist/${itemId}`, {
        isCompleted,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Attendance
export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CheckInDTO) => {
      const response = await apiClient.post('/workforce/attendance/check-in', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CheckOutDTO }) => {
      const response = await apiClient.patch(`/workforce/attendance/${id}/check-out`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
