import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  style?: React.CSSProperties;
}

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  min-width: 140px;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
`;

const SelectButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  background: rgba(10, 10, 10, 0.95);
  border: 2px solid var(--dark-gold);
  color: var(--gold);
  padding: 0.7rem 2.5rem 0.7rem 1.2rem;
  border-radius: 12px;
  font-size: 1.15rem;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(212,175,55,0.08);
  outline: none;
  position: relative;
  z-index: 20;
  ${props => props.$isOpen && `border-color: var(--gold); box-shadow: 0 0 0 2px var(--gold);`}
  &:hover {
    border-color: var(--gold);
    box-shadow: 0 0 0 2px var(--gold);
  }
`;

const ArrowIcon = styled.span<{ $isOpen: boolean }>`
  display: inline-block;
  margin-left: 0.7rem;
  transition: transform 0.2s;
  svg {
    width: 1.2em;
    height: 1.2em;
    fill: var(--gold);
    display: block;
  }
  ${props => props.$isOpen && 'transform: rotate(180deg);'}
`;

const OptionList = styled.ul<{ $isOpen: boolean }>`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: rgba(10, 10, 10, 0.98);
  border: 2px solid var(--dark-gold);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 2px #000;
  z-index: 30;
  max-height: 260px;
  overflow-y: auto;
  padding: 0.3rem 0;
`;

const OptionItem = styled.li<{ selected: boolean }>`
  padding: 0.8rem 1.2rem;
  color: ${props => (props.selected ? 'var(--gold)' : '#fff')};
  background: ${props => (props.selected ? 'rgba(212,175,55,0.08)' : 'transparent')};
  font-size: 1.08rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: linear-gradient(90deg, rgba(212,175,55,0.18) 0%, rgba(10,10,10,0.98) 100%);
    color: var(--gold);
  }
`;

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <SelectWrapper ref={wrapperRef} style={style}>
      {label && <span style={{ color: 'var(--dark-gold)', fontSize: '0.98rem', marginBottom: 4, display: 'block' }}>{label}</span>}
      <SelectButton type="button" $isOpen={isOpen} onClick={() => setIsOpen(open => !open)} aria-haspopup="listbox" aria-expanded={isOpen}>
        {options.find(opt => opt.value === value)?.label || ''}
        <ArrowIcon $isOpen={isOpen}>
          <svg viewBox="0 0 20 20"><path d="M5 8l5 5 5-5" /></svg>
        </ArrowIcon>
      </SelectButton>
      <OptionList $isOpen={isOpen} role="listbox">
        {options.map(opt => (
          <OptionItem
            key={opt.value}
            selected={opt.value === value}
            onClick={() => handleSelect(opt)}
            role="option"
            aria-selected={opt.value === value}
          >
            {opt.label}
          </OptionItem>
        ))}
      </OptionList>
    </SelectWrapper>
  );
}; 