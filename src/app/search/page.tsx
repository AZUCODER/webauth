'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchPosts } from '@/lib/actions/post-actions';
import { SearchInput } from '@/components/SearchInput';
import { PostCard } from './PostCard';
import { Post } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSearchResults() {
      if (!searchTerm) {
        setPosts([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchPosts(searchTerm);
        setPosts(results);
      } catch (error) {
        console.error('Error searching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Update the URL with the search term
    const url = new URL(window.location.href);
    if (term) {
      url.searchParams.set('q', term);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Search Posts</h1>
        <SearchInput onSearch={handleSearch} initialValue={searchTerm} />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {searchTerm && (
            <h2 className="text-xl font-medium">
              {posts.length === 0
                ? 'No results found'
                : `Found ${posts.length} result${posts.length === 1 ? '' : 's'}`}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 