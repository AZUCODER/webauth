'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { PostStatus } from '@/types/prisma';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface for post data
interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: PostStatus;
  featuredImage?: string | null;
  author: {
    name: string | null;
    email: string;
  };
  category?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Post[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();
  
  // Search for posts when debounced search term changes
  const searchPosts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: query,
          type: 'posts'
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setResults(response.data.posts || []);
    } catch (error) {
      console.error('Error searching posts:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [setResults, setIsLoading]);
  
  // Handle search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchPosts(debouncedSearchTerm);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm, searchPosts]);
  
  // Handle post selection
  const handlePostClick = (slug: string) => {
    router.push(`/posts/${slug}`);
    setOpen(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Get status badge color
  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="ml-auto relative max-w-md cursor-pointer">
          <div className="flex items-center rounded-md border px-3 py-1">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input 
              readOnly
              onClick={() => setOpen(true)}
              placeholder="Search posts..." 
              className="border-0 focus-visible:ring-0 p-0 h-8"
            />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Posts</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for posts by title, content, or category..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer"
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>
        
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((post) => (
                <Card key={post.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors duration-200" onClick={() => handlePostClick(post.slug)}>
                  <CardContent className="p-4 flex gap-4">
                    {post.featuredImage ? (
                      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                        <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`${getStatusColor(post.status)}`}>
                          {post.status}
                        </Badge>
                        {post.category && (
                          <Badge variant="outline">{post.category.name}</Badge>
                        )}
                      </div>
                      <h3 className="text-base font-medium mt-1 truncate">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">{getInitials(post.author.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {post.author.name || post.author.email} • {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Start typing to search for posts</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 