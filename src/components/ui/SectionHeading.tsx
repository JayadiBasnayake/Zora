import React from 'react';

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  level?: 2 | 3;
  className?: string;
}

export function SectionHeading({ title, description, action, level = 2, className = '' }: SectionHeadingProps) {
  const Tag = (level === 2 ? 'h2' : 'h3') as React.ElementType;
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="max-w-2xl">
        <Tag className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</Tag>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>);

}