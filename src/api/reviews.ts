import { supabase } from '@/lib/supabase';
import type { NewReview, Review } from '@/types';

export async function fetchReviews(attractionId: string): Promise<Review[]> {
  // RLS already hides non-approved reviews from anon users, but we add an
  // explicit status filter so the public list never accidentally surfaces
  // pending/rejected entries — e.g. if an admin happens to be logged in
  // (their RLS view includes everything, which would inflate the list).
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('attraction_id', attractionId)
    .eq('status_id', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReview(review: NewReview): Promise<void> {
  const { error } = await supabase.from('reviews').insert(review);
  if (error) throw error;
}
