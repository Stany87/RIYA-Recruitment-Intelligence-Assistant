import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Fetch all jobs for the current agency, with optional status filter.
 */
export function useJobs(status = 'all') {
  return useQuery({
    queryKey: ['jobs', { status }],
    queryFn: () => api.get(`/jobs?status=${status}`),
    select: (data) => data.data,
  });
}

/**
 * Fetch a single job by its ID.
 */
export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Fetch the candidate funnel counts for a specific job.
 */
export function useJobFunnel(id) {
  return useQuery({
    queryKey: ['job', id, 'funnel'],
    queryFn: () => api.get(`/jobs/${id}/funnel`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Create a new job vacancy.
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newJob) => api.post('/jobs', newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Update an existing job.
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updatedData }) => api.put(`/jobs/${id}`, updatedData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/**
 * Delete a job description.
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Sync a job to RIYA's Knowledge Base.
 */
export function useSyncJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/jobs/${id}/sync`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
    },
  });
}
