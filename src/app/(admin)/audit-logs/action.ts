'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useAuditLogFilters() {
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
    // Preserve all existing query params, just update the page
    router.push(`${pathname}?${createQueryString({ page: page.toString() })}`);
  };

  const setFilters = (filters: Record<string, string>) => {
    // Create a params object with all the filters and reset page to 1
    const params: Record<string, string | null> = { 
      page: '1',
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === 'all') {
        params[key] = null;
      }
    });
    
    router.push(`${pathname}?${createQueryString(params)}`);
  };

  return {
    setPage,
    setFilters,
    getCurrentFilters: () => {
      const current: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        current[key] = value;
      });
      return current;
    }
  };
} 