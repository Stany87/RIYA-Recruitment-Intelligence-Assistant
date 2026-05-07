import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Fetch candidates with pagination, search, and filters.
 */
export function useCandidates({ page = 1, limit = 25, search, stage, recommendation, sort } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  if (search) params.set('search', search);
  if (stage) params.set('stage', stage);
  if (recommendation && recommendation !== 'all') params.set('recommendation', recommendation);
  if (sort) params.set('sort', sort);

  return useQuery({
    queryKey: ['candidates', { page, limit, search, stage, recommendation, sort }],
    queryFn: () => api.get(`/candidates?${params.toString()}`),
    select: (data) => data.data,
  });
}

/**
 * Fetch a single candidate by ID.
 */
export function useCandidate(id) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => api.get(`/candidates/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Fetch candidate stage counts for kanban headers.
 */
export function useStageCounts() {
  return useQuery({
    queryKey: ['candidates', 'stageCounts'],
    queryFn: () => api.get('/candidates/stages'),
    select: (data) => data.data,
  });
}

/**
 * Sync candidates from external source (one-time migration).
 */
export function useSyncCandidates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidates) => api.post('/candidates/sync', { candidates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Move candidate to a new pipeline stage.
 */
export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage, note }) =>
      api.patch(`/candidates/${id}/stage`, { stage, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Update recruiter notes for a candidate.
 */
export function useUpdateNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recruiterNotes }) =>
      api.patch(`/candidates/${id}/notes`, { recruiterNotes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] });
    },
  });
}

/**
 * Set recruiter score override.
 */
export function useUpdateRecruiterScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recruiterScore }) =>
      api.patch(`/candidates/${id}/recruiter-score`, { recruiterScore }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

/**
 * Fetch dashboard stats.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats'),
    select: (data) => data.data,
  });
}

/**
 * Fetch recent activity feed.
 */
export function useActivityFeed() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api.get('/dashboard/activity'),
    select: (data) => data.data,
  });
}
