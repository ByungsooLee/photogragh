'use client';

import Link from 'next/link';
import styled from 'styled-components';
import Header from '@/components/Header';

const Page = styled.main`
  min-height: 100vh;
  background:
    radial-gradient(circle at 88% 12%, rgba(92, 106, 118, 0.14), transparent 30vw),
    linear-gradient(180deg, #111216 0%, var(--paper) 64%, #020203 100%);
`;

const Content = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(260px, 0.45fr);
  gap: clamp(32px, 8vw, 120px);
  padding: clamp(56px, 10vw, 132px) clamp(18px, 4vw, 56px);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Title = styled.h1`
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(5rem, 15vw, 14rem);
  font-weight: 400;
  letter-spacing: 0.035em;
  line-height: 0.75;
  text-transform: uppercase;
  text-shadow: 0 18px 42px rgba(0, 0, 0, 0.58);
`;

const Copy = styled.div`
  align-self: end;
  color: var(--muted);
  font-size: 0.98rem;
  line-height: 1.9;
  border-left: 1px solid var(--line);
  padding-left: clamp(18px, 3vw, 34px);
`;

const TextLink = styled(Link)`
  display: inline-block;
  margin-top: 28px;
  color: var(--ink);
  border: 1px solid var(--ink);
  border-left-color: var(--gold);
  border-right-color: var(--gold);
  padding: 8px 13px 7px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export default function InstagramPage() {
  return (
    <Page>
      <Header />
      <Content>
        <Title>Instagram</Title>
        <Copy>
          Daily photographs, behind-the-scenes notes, exhibition updates, and fragments from ongoing work are collected here.
          <br />
          <TextLink href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            Open Instagram
          </TextLink>
        </Copy>
      </Content>
    </Page>
  );
}
