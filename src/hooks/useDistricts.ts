import { useQuery } from '@tanstack/react-query';
import { fetchDistricts } from '@/api/districts';

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: fetchDistricts,
  });
}
