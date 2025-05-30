export interface Photo {
  id: string;
  url: string;
  title: string;
  caption: string;
  width?: number;
  height?: number;
  image?: {
    url: string;
    width: number;
    height: number;
  };
} 