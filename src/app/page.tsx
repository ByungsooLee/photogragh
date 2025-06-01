import { getPhotos } from '../lib/microcms';
import HomeClient from '../components/HomeClient';

export default async function Home() {
  const { photos } = await getPhotos();
  return <HomeClient photos={photos} />;
}
