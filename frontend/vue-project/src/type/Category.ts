export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface TrendingCategory extends Category {
  point?: number;
}