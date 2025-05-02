export interface Author {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: Author;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
} 