'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Modal from '../components/Modal';
import FilmStrip from '../components/FilmStrip';
import { getPhotos, type Photo } from '../lib/microcms';

const FilmGallery = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, var(--bg-medium) 0%, var(--bg-dark) 100%);
  padding-top: 80px;
  padding-bottom: 80px;
`;

const FilmContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalSourcePosition, setModalSourcePosition] = useState<{ x: number; y: number } | undefined>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { photos: fetchedPhotos } = await getPhotos();
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handlePhotoClick = (photo: { url: string; title: string; caption: string; position: { x: number; y: number } }) => {
    setModalImage(photo.url);
    setModalTitle(photo.title);
    setModalCaption(photo.caption);
    setModalSourcePosition(photo.position);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <FilmGallery>
      <Header />
      <FilmContainer>
        <FilmStrip
          stripId="strip1"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
          photos={photos}
        />
        <FilmStrip
          stripId="strip2"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
          photos={photos}
        />
        <FilmStrip
          stripId="strip3"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
          photos={photos}
        />
        <FilmStrip
          stripId="strip4"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
          photos={photos}
        />
        <FilmStrip
          stripId="strip5"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
          photos={photos}
        />
        <FilmStrip
          stripId="vstripL"
          isVertical
          position="left"
          onPhotoClick={handlePhotoClick}
          photos={photos}
          className="hidden md:block"
        />
        <FilmStrip
          stripId="vstripC"
          isVertical
          position="center"
          onPhotoClick={handlePhotoClick}
          photos={photos}
        />
        <FilmStrip
          stripId="vstripR"
          isVertical
          position="right"
          onPhotoClick={handlePhotoClick}
          photos={photos}
          className="hidden md:block"
        />
      </FilmContainer>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={modalImage}
        title={modalTitle}
        caption={modalCaption}
        sourcePosition={modalSourcePosition}
      />
    </FilmGallery>
  );
}
