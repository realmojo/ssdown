export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
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
