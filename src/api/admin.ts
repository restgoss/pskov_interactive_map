import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReview extends Review {
  /** Title of the attraction this review belongs to (joined from attractions). */
  attraction_title: string | null;
}

interface AdminReviewRow extends Review {
  attractions: { title: string } | null;
}

export async function fetchReviewsByStatus(status: ReviewStatus): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, attractions(title)')
    .eq('status_id', status)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as AdminReviewRow[];
  return rows.map((r) => ({
    ...r,
    attraction_title: r.attractions?.title ?? null,
  }));
}

async function setStatus(reviewId: string, status: ReviewStatus): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ status_id: status })
    .eq('id', reviewId);
  if (error) throw error;
}

export const approveReview = (id: string) => setStatus(id, 'approved');
export const rejectReview = (id: string) => setStatus(id, 'rejected');
