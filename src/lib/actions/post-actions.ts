'use server';

import { db } from '@/lib/db';
import { Post } from '@/lib/types';

// Mock database of posts for demonstration
const posts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with Web Authentication',
    slug: 'getting-started-with-web-authentication',
    excerpt: 'Learn the basics of web authentication and how to implement it in your applications.',
    content: 'Web authentication is a critical aspect of modern web applications...',
    author: {
      id: 'auth0|123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://i.pravatar.cc/150?u=john'
    },
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
    tags: ['authentication', 'security', 'web development']
  },
  {
    id: '2',
    title: 'Passwordless Authentication Methods',
    slug: 'passwordless-authentication-methods',
    excerpt: 'Explore different passwordless authentication methods and their benefits.',
    content: 'Passwordless authentication is becoming increasingly popular...',
    author: {
      id: 'auth0|456',
      name: 'Jane Smith',
      email: 'jane@example.com',
      picture: 'https://i.pravatar.cc/150?u=jane'
    },
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-05-25'),
    tags: ['passwordless', 'authentication', 'security']
  },
  {
    id: '3',
    title: 'Implementing OAuth 2.0 with Next.js',
    slug: 'implementing-oauth-2-with-nextjs',
    excerpt: 'A step-by-step guide to implementing OAuth 2.0 in Next.js applications.',
    content: 'OAuth 2.0 is an industry-standard protocol for authorization...',
    author: {
      id: 'auth0|789',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      picture: 'https://i.pravatar.cc/150?u=alex'
    },
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10'),
    tags: ['oauth', 'nextjs', 'authentication', 'tutorial']
  }
];

/**
 * Search for posts based on a search term
 * @param searchTerm - The term to search for
 * @returns Array of posts that match the search term
 */
export async function searchPosts(searchTerm: string): Promise<Post[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If no search term, return empty array
  if (!searchTerm) return [];
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  // Filter posts that match the search term in title, content, or tags
  return posts.filter(post => 
    post.title.toLowerCase().includes(normalizedSearchTerm) ||
    post.content.toLowerCase().includes(normalizedSearchTerm) ||
    post.excerpt.toLowerCase().includes(normalizedSearchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(normalizedSearchTerm))
  );
} 