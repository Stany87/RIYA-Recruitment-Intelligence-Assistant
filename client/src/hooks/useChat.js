import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Hook to retrieve the chat message history.
 */
export function useChatMessages() {
  return useQuery({
    queryKey: ['chat', 'messages'],
    queryFn: () => api.get('/chat/messages'),
    select: (data) => data.data,
  });
}

/**
 * Hook to send a new message to RIYA.
 * Auto-invalidates candidate queries if the AI successfully triggers a pipeline move.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message) => api.post('/chat/messages', { message }),
    onSuccess: (res) => {
      // Invalidate chat messages
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
      
      // If the AI message executed a pipeline action, refresh candidates and dashboard stats
      const isPipelineMove = res.data?.aiMessage?.content?.includes('Pipeline Action Executed');
      if (isPipelineMove) {
        queryClient.invalidateQueries({ queryKey: ['candidates'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
  });
}

/**
 * Hook to clear the conversation history.
 */
export function useClearChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete('/chat/messages'),
    onSuccess: () => {
      queryClient.setQueryData(['chat', 'messages'], []);
    },
  });
}
