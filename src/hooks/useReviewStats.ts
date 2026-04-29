import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ReviewStat {
  count: number;
  avg: number;
}

export type ReviewStatsMap = Record<string, ReviewStat>;

/**
 * Aggregated review counts + average ratings, keyed by attraction id.
 *
 * Filters explicitly by `status_id = 'approved'` so admins viewing the map
 * still see public-facing numbers (their RLS view would otherwise include
 * pending/rejected reviews and inflate counts).
 *
 * Pulls only `attraction_id` and `rating` to keep the payload small —
 * a few thousand rows each ~12 bytes is well under any reasonable limit.
 */
async function fetchReviewStats(): Promise<ReviewStatsMap> {
  const { data, error } = await supabase
    .from('reviews')
    .select('attraction_id, rating')
    .eq('status_id', 'approved');
  if (error) throw error;

  const acc = new Map<string, { count: number; sum: number }>();
  for (const r of (data ?? []) as Array<{ attraction_id: string; rating: number }>) {
    const cur = acc.get(r.attraction_id);
    if (cur) {
      cur.count += 1;
      cur.sum += r.rating;
    } else {
      acc.set(r.attraction_id, { count: 1, sum: r.rating });
    }
  }

  const out: ReviewStatsMap = {};
  for (const [id, v] of acc) {
    out[id] = { count: v.count, avg: v.sum / v.count };
  }
  return out;
}

export function useReviewStats() {
  return useQuery({
    queryKey: ['review-stats'],
    queryFn: fetchReviewStats,
    staleTime: 60_000, // counts don't change minute-to-minute; cache an hour-ish via re-fetch on window focus
  });
}
