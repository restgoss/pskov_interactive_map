import { supabase } from '@/lib/supabase';
import type { Attraction } from '@/types';

export async function fetchAttractions(): Promise<Attraction[]> {
  const { data, error } = await supabase
    .from('attractions')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
