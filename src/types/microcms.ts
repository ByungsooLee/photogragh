export interface ImageData {
  url: string;
  width?: number;
  height?: number;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  caption: string;
  image: ImageData;
  position?: {
    x: number;
    y: number;
  };
}

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  featured: boolean;
  tags: string[];
  shootingDate: string;
  country2?: string;
  metadata?: string;
  category3?: string;
};

export interface MicroCMSResponse {
  contents: GalleryItem[];
  totalCount?: number;
}

export interface YourContentType {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  image: ImageData;
  // 他のフィールドは必要に応じて追加
} 