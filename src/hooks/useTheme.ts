import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';

export function useApplyTheme() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
