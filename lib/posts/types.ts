export interface Post {
  id: string;
  title: string | Record<string, string>;
  excerpt: string | Record<string, string>;
  content: string | Record<string, string>;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  image: string;
  readTime: number;
  status?: string;
  createdAt?: string;
}
