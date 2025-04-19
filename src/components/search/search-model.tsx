'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchModel() {
  return (
    <div className="ml-auto relative max-w-md">
      <div className="flex items-center border rounded-md px-3 py-1">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input 
          type="search"
          placeholder="Search..." 
          className="border-0 focus-visible:ring-0 p-0 h-8"
        />
      </div>
    </div>
  );
} 