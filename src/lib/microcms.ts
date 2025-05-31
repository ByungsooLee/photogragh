import { createClient } from 'microcms-js-sdk';

export type Photo = {
  id: string;
  url: string;
  title: string;
  caption: string;
  image: {
    url: string;
  };
  position?: {
    x: number;
    y: number;
  };
};

type MicroCMSResponse = {
  contents: Array<{
    id: string;
    title: string;
    caption: string;
    image: {
      url: string;
    };
  }>;
  totalCount?: number;
};

const client = createClient({
  serviceDomain: 'yye0dtjc5m',
  apiKey: '26vuPmeJCBFmgs1DtAUURZZgq0gGSKs0w6YN',
});

export const getPhotos = async (params?: { limit?: number; offset?: number }): Promise<{ photos: Photo[]; totalCount?: number }> => {
  try {
    console.log('Fetching photos from microCMS...');
    const response = await client.get<MicroCMSResponse>({
      endpoint: 'photos',
      queries: {
        fields: ['id', 'title', 'caption', 'image'],
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.offset ? { offset: params.offset } : {})
      }
    });

    console.log('microCMS response:', response);

    if (!response.contents || response.contents.length === 0) {
      console.log('No photos found, using dummy photos');
      return { photos: getDummyPhotos(), totalCount: 40 };
    }

    const photos = response.contents.map(content => {
      console.log('Processing photo:', content);
      return {
        id: content.id,
        url: content.image.url,
        title: content.title || 'Untitled',
        caption: content.caption || '',
        image: content.image
      };
    });

    console.log('Processed photos:', photos);
    return { photos, totalCount: response.totalCount };
  } catch (error) {
    console.error('Error fetching photos:', error);
    return { photos: getDummyPhotos(), totalCount: 40 };
  }
};

const getDummyPhotos = (): Photo[] => {
  console.log('Generating dummy photos');
  return Array.from({ length: 40 }, (_, i) => ({
    id: `dummy-${i}`,
    url: `https://picsum.photos/800/1200?random=${i}`,
    title: `Photo ${i + 1}`,
    caption: `A beautiful moment captured on film ${i + 1}`,
    image: {
      url: `https://picsum.photos/800/1200?random=${i}`
    }
  }));
}; 