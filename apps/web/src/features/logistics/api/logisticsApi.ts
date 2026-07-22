import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import type {
  CreateVehicleDTO,
  UpdateVehicleDTO,
  CreateDriverDTO,
  UpdateDriverDTO,
  CreateTripDTO,
  UpdateTripDTO,
  DispatchTripDTO,
  CompleteTripDTO,
} from '@decorflow/shared';

// Vehicles
export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await apiClient.get('/logistics/vehicles');
      return response.data.data;
    },
  });
};

export const useVehicleTypes = () => {
  return useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: async () => {
      const response = await apiClient.get('/logistics/vehicle-types');
      return response.data.data;
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVehicleDTO) => {
      const response = await apiClient.post('/logistics/vehicles', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVehicleDTO }) => {
      const response = await apiClient.patch(`/logistics/vehicles/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

// Drivers
export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await apiClient.get('/logistics/drivers');
      return response.data.data;
    },
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDriverDTO) => {
      const response = await apiClient.post('/logistics/drivers', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDriverDTO }) => {
      const response = await apiClient.patch(`/logistics/drivers/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

// Trips
export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const response = await apiClient.get('/logistics/trips');
      return response.data.data;
    },
  });
};

export const useTrip = (id: string) => {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      const response = await apiClient.get(`/logistics/trips/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTripDTO) => {
      const response = await apiClient.post('/logistics/trips', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTripDTO }) => {
      const response = await apiClient.patch(`/logistics/trips/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.id] });
    },
  });
};

export const useDispatchTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DispatchTripDTO }) => {
      const response = await apiClient.post(`/logistics/trips/${id}/dispatch`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

export const useCompleteTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompleteTripDTO }) => {
      const response = await apiClient.post(`/logistics/trips/${id}/complete`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
