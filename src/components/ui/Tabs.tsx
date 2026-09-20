
export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
}

export function Tabs({ items, value, onChange, label, className = '' }: TabsProps) {
  const move = (dir: 1 | -1) => {
    const i = items.findIndex((t) => t.id === value);
    const next = (i + dir + items.length) % items.length;
    onChange(items[next].id);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          move(1);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          move(-1);
        }
      }}
      className={`no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-hairline bg-surface p-1 ${className}`}>
      
      {items.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={[
            'inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium',
            'transition-[background-color,color] duration-150 ease-out',
            active ? 'bg-cyan-soft text-cyan' : 'text-ink-muted hover:bg-white/5 hover:text-ink'].
            join(' ')}>
            
            {t.label}
            {typeof t.count === 'number' &&
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? 'bg-cyan/20' : 'bg-white/10 text-ink-dim'}`}>
                {t.count}
              </span>
            }
          </button>);

      })}
    </div>);

}