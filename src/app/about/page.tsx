'use client';

import Image from 'next/image';
import styled from 'styled-components';
import Header from '@/components/Header';

const Page = styled.main`
  min-height: 100vh;
  background:
    radial-gradient(circle at 88% 12%, rgba(92, 106, 118, 0.16), transparent 32vw),
    linear-gradient(180deg, #111216 0%, var(--paper) 64%, #020203 100%);
`;

const Content = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 0.75fr) minmax(280px, 0.5fr);
  gap: clamp(32px, 8vw, 120px);
  padding: clamp(42px, 8vw, 110px) clamp(18px, 4vw, 56px) clamp(56px, 10vw, 132px);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Text = styled.div`
  align-self: end;
`;

const Title = styled.h1`
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(5rem, 16vw, 15rem);
  font-weight: 400;
  letter-spacing: 0.035em;
  line-height: 0.74;
  margin-bottom: clamp(28px, 5vw, 64px);
  text-transform: uppercase;
  text-shadow: 0 18px 42px rgba(0, 0, 0, 0.58);
`;

const Copy = styled.div`
  max-width: 660px;
  color: var(--muted);
  font-size: clamp(0.96rem, 1.4vw, 1.08rem);
  line-height: 1.95;
`;

const Portrait = styled.div`
  position: relative;
  align-self: start;
  aspect-ratio: 4 / 5;
  background: var(--film-black);
  overflow: hidden;
  border: 1px solid rgba(248, 245, 239, 0.14);
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.48);

  img {
    filter: saturate(0.9) contrast(1.06) brightness(0.92);
  }
`;

const Meta = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 18px;
  margin-top: 34px;
  color: var(--ink);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  dt {
    color: rgba(248, 245, 239, 0.62);
    font-weight: 700;
  }
`;

export default function AboutPage() {
  return (
    <Page>
      <Header />
      <Content>
        <Text>
          <Title>About</Title>
          <Copy>
            L.MARK is a Japan-based photography project focused on portraits, city fragments, and quiet personal records. The site is designed as a photographic index: simple navigation, generous margins, and images that stay in the foreground.
          </Copy>
          <Meta>
            <dt>Base</dt>
            <dd>Japan</dd>
            <dt>Focus</dt>
            <dd>Portrait / Personal Work</dd>
            <dt>Archive</dt>
            <dd>Ongoing</dd>
          </Meta>
        </Text>
        <Portrait>
          <Image
            src="/images/logo_about_01.jpg"
            alt="L.MARK portrait visual"
            fill
            sizes="(max-width: 860px) 100vw, 38vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        </Portrait>
      </Content>
    </Page>
  );
}
