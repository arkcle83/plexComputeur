'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface Space {
  id: string;
  name: string;
  emoji: string;
}

const SpaceSelector = ({
  selectedSpaceId,
  onSelect,
}: {
  selectedSpaceId: string | null;
  onSelect: (spaceId: string | null) => void;
}) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await fetch('/api/spaces');
        const data = await res.json();
        setSpaces(data.spaces || []);
        if (!selectedSpaceId && data.spaces?.length > 0) {
          onSelect(data.spaces[0].id);
        }
      } catch {}
    };
    fetchSpaces();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = spaces.find((s) => s.id === selectedSpaceId);

  if (spaces.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
        style={{
          background: 'rgba(59,130,246,.12)',
          border: '1px solid rgba(59,130,246,.3)',
          color: '#93c5fd',
        }}
      >
        <span>{selected?.emoji || '📁'}</span>
        <span>{selected?.name || 'Espace'}</span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 right-0 z-50 w-44 rounded-xl py-1.5 shadow-xl"
          style={{
            background: '#1a1a22',
            border: '1px solid rgba(255,255,255,.08)',
          }}
        >
          {spaces.map((space) => (
            <button
              key={space.id}
              type="button"
              onClick={() => {
                onSelect(space.id);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition ${
                selectedSpaceId === space.id
                  ? 'text-[#93c5fd] bg-white/[.04]'
                  : 'text-white/70 hover:text-white hover:bg-white/[.04] transition-colors duration-200'
              }`}
            >
              <span>{space.emoji}</span>
              <span className="truncate">{space.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpaceSelector;
