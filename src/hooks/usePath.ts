'use client';

import { usePathname } from 'next/navigation';

export type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrentPage: boolean;
};


// Add special case handling for route mapping
const routeMapping: Record<string, string> = {
  'view': 'View',
  'edit': 'Edit',
  'new': 'New',
  'create': 'Create',
  'posts': 'Posts',
  'users': 'Users',
  'profile': 'Profile',
  'post-categories': 'Categories',
  'settings': 'Settings',
  'permissions': 'Permissions',
};

export function usePath(): BreadcrumbItem[] {
  const pathname = usePathname();
  
  if (!pathname) return [];
  
  // Always start with Dashboard
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', isCurrentPage: pathname === '/dashboard' }
  ];
  
  // Skip the /dashboard part as it's already added
  const segments = pathname.split('/').filter(Boolean);
  const dashboardIndex = segments.indexOf('dashboard');
  const relevantSegments = dashboardIndex !== -1 
    ? segments.slice(dashboardIndex + 1) 
    : segments;
  
  let currentPath = '/dashboard';
  
  relevantSegments.forEach((segment, index) => {
    // Check if this is a known route segment or a dynamic parameter (like an ID)
    const isLastSegment = index === relevantSegments.length - 1;
    currentPath += `/${segment}`;
    
    // Skip segments that are likely IDs (UUIDs, etc.)
    const isLikelyId = segment.length > 20 || /^[0-9a-f]{8,}$/i.test(segment);
    if (isLikelyId && !isLastSegment) return;
    
    // Format the segment for display with special case handling
    let label = '';
    
    if (routeMapping[segment]) {
      label = routeMapping[segment];
    } else {
      label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Handle special case for IDs in the URL
    if (isLikelyId && isLastSegment) {
      if (pathname.includes('/posts/')) {
        label = 'View Post';
      } else if (pathname.includes('/users/')) {
        label = 'User Details';
      } else {
        label = 'Details';
      }
    }
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage: pathname === currentPath
    });
  });
  
  return breadcrumbs;
} 