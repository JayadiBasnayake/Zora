import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article' | 'li';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selected?: boolean;
  glass?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 sm:p-7'
};

export function Card({
  as = 'div',
  padding = 'md',
  interactive = false,
  selected = false,
  glass = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      {...rest}
      className={[
      'rounded-2xl border',
      glass ? 'glass' : 'bg-surface',
      selected ? 'border-cyan-line shadow-glow' : 'border-hairline',
      interactive ?
      'transition-[border-color,background-color] duration-150 ease-out hover:border-cyan-line hover:bg-surface-raised cursor-pointer' :
      '',
      paddings[padding],
      className].
      join(' ')}>
      
      {children}
    </Tag>);

}