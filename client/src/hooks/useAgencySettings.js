import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Hook to retrieve the current agency settings.
 */
export function useAgencySettings() {
  return useQuery({
    queryKey: ['agency', 'settings'],
    queryFn: () => api.get('/agency/settings'),
    select: (data) => data.data,
  });
}

/**
 * Hook to update agency settings.
 */
export function useUpdateAgencySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => api.put('/agency/settings', settings),
    onSuccess: (res) => {
      queryClient.setQueryData(['agency', 'settings'], res.data);
    },
  });
}

/**
 * Hook to test the connection to a Relevance AI agent.
 */
export function useTestRelevance() {
  return useMutation({
    mutationFn: (credentials) => api.post('/agency/settings/test-relevance', credentials),
  });
}
