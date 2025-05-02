import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/actions/post-actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'posts';

    // For now, we only support posts search
    if (type === 'posts') {
      const posts = await searchPosts(query);
      
      // Format the posts for the search API response
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        status: 'PUBLISHED', // All posts in our mock data are published
        featuredImage: null, // Our mock data doesn't have featured images
        author: {
          name: post.author.name,
          email: post.author.email
        },
        category: null, // Our mock data doesn't have categories
        createdAt: post.createdAt.toISOString()
      }));

      return NextResponse.json({ posts: formattedPosts });
    }

    return NextResponse.json({ posts: [] });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
} 