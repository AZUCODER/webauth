'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useSettingsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createQueryString = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Update or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    return newParams.toString();
  };

  const setPage = (page: number) => {
    router.push(`${pathname}?${createQueryString({ page: page.toString() })}`);
  };

  const setFilters = (filters: Record<string, string>) => {
    // Reset to page 1 when filters change
    const params: Record<string, string | null> = { 
      page: '1',
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key]) {
        params[key] = null;
      }
    });
    
    router.push(`${pathname}?${createQueryString(params)}`);
  };

  return {
    setPage,
    setFilters
  };
} 