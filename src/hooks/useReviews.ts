import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, fetchReviews } from '@/api/reviews';
import type { NewReview } from '@/types';

export function useReviews(attractionId: string | null) {
  return useQuery({
    queryKey: ['reviews', attractionId],
    queryFn: () => fetchReviews(attractionId as string),
    enabled: !!attractionId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review: NewReview) => createReview(review),
    onSuccess: (_data, review) => {
      qc.invalidateQueries({ queryKey: ['reviews', review.attraction_id] });
      // New review starts as pending so stats won't change until an admin
      // approves, but invalidating is cheap and keeps things consistent if
      // the policy ever changes.
      qc.invalidateQueries({ queryKey: ['review-stats'] });
    },
  });
}
