import type { Category } from './Category';
import type { Source } from './Source';

export interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  publishedAt: string;
  clickCount?: number;
  categories?: Category[];
  source?: Source;
  thumbnail_url?: string;
}