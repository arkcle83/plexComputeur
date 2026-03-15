'use client';

import { formatTimeDifference } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import NewSpaceModal from '@/components/Spaces/NewSpaceModal';

interface Space {
  id: string;
  name: string;
  emoji: string;
  description: string;
  createdAt: string;
  chatCount: number;
}

const SpacesPage = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewSpaceOpen, setIsNewSpaceOpen] = useState(false);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spaces');
      const data = await res.json();
      setSpaces(data.spaces || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  return (
    <div className="pt-8 pb-28 px-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Mes espaces
          </h1>
          <p className="text-sm text-black/50 dark:text-white/50 mt-1">
            Organisez vos chats par thème ou projet
          </p>
        </div>
        <button
          onClick={() => setIsNewSpaceOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:opacity-90 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          }}
        >
          <Plus size={16} />
          Nouvel espace
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-light-200 fill-light-secondary dark:text-[#202020] animate-spin dark:fill-[#ffffff3b]"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {spaces.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center min-h-[30vh] text-center">
              <span className="text-4xl mb-3">📁</span>
              <p className="text-sm text-black/50 dark:text-white/50">
                Aucun espace pour le moment.
              </p>
              <button
                onClick={() => setIsNewSpaceOpen(true)}
                className="mt-3 text-sm text-sky-400 hover:text-sky-300 transition-colors duration-200"
              >
                Créer votre premier espace
              </button>
            </div>
          )}

          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              className="group relative flex flex-col gap-3 p-5 rounded-[14px] transition-all duration-200 hover:-translate-y-0.5 bg-black/[.03] dark:bg-white/[.03] border border-black/[.06] dark:border-white/[.06] hover:border-black/[.12] dark:hover:border-white/[.12] hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,.3)]"
            >
              {/* Badge count */}
              <span
                className="absolute top-4 right-4 text-[12px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(59,130,246,.15)',
                  color: '#93c5fd',
                }}
              >
                {space.chatCount}
              </span>

              {/* Emoji */}
              <div
                className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center text-2xl"
                style={{ background: 'rgba(255,255,255,.07)' }}
              >
                {space.emoji}
              </div>

              {/* Name */}
              <h3 className="text-[15px] font-semibold text-black dark:text-white">
                {space.name}
              </h3>

              {/* Metadata */}
              <div className="flex items-center gap-2 text-[12px] text-black/40 dark:text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>
                  {formatTimeDifference(new Date(), space.createdAt)}
                </span>
                <span>·</span>
                <span>🔒 Privé</span>
              </div>
            </Link>
          ))}

          {/* Create new space card */}
          <button
            onClick={() => setIsNewSpaceOpen(true)}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-[14px] min-h-[160px] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-2 border-dashed border-black/[.08] dark:border-white/[.08] hover:border-black/[.15] dark:hover:border-white/[.15]"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,.04)' }}
            >
              <Plus size={20} className="text-black/30 dark:text-white/30" />
            </div>
            <span className="text-sm text-black/30 dark:text-white/30">Créer un espace</span>
          </button>
        </div>
      )}

      <NewSpaceModal
        isOpen={isNewSpaceOpen}
        setIsOpen={setIsNewSpaceOpen}
        onCreated={fetchSpaces}
      />
    </div>
  );
};

export default SpacesPage;
