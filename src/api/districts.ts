import { supabase } from '@/lib/supabase';
import type { District } from '@/types';

export async function fetchDistricts(): Promise<District[]> {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}
