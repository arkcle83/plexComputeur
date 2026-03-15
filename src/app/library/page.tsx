'use client';

import DeleteChat from '@/components/DeleteChat';
import { formatTimeDifference } from '@/lib/utils';
import {
  BookOpenText,
  ClockIcon,
  FileText,
  Globe2Icon,
  Pin,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  sources: string[];
  files: { fileId: string; name: string }[];
  spaceId?: string | null;
  folderId?: string | null;
  pinned?: number;
}

interface Space {
  id: string;
  name: string;
  emoji: string;
  chatCount: number;
}

type FilterType = 'all' | 'pinned' | 'files' | string;
type SortType = 'date-desc' | 'date-asc' | 'title-asc';

const Page = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date-desc');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [chatsRes, spacesRes] = await Promise.all([
          fetch('/api/chats'),
          fetch('/api/spaces'),
        ]);
        const chatsData = await chatsRes.json();
        const spacesData = await spacesRes.json();
        setChats(chatsData.chats || []);
        setSpaces(spacesData.spaces || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...chats];

    // Filter
    if (activeFilter === 'pinned') {
      result = result.filter((c) => c.pinned === 1);
    } else if (activeFilter === 'files') {
      result = result.filter((c) => c.files && c.files.length > 0);
    } else if (activeFilter !== 'all') {
      result = result.filter((c) => c.spaceId === activeFilter);
    }

    // Sort
    if (sortBy === 'date-desc') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === 'date-asc') {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [chats, activeFilter, sortBy]);

  const spaceMap = useMemo(() => {
    const map: Record<string, Space> = {};
    for (const s of spaces) map[s.id] = s;
    return map;
  }, [spaces]);

  const handleTogglePin = async (chatId: string, currentPinned: number) => {
    const newPinned = currentPinned === 1 ? 0 : 1;
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: newPinned }),
      });
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, pinned: newPinned } : c)),
      );
      toast.success(newPinned ? 'Épinglé' : 'Désépinglé');
    } catch {
      toast.error('Erreur');
    }
    setMenuOpenId(null);
  };

  const handleMoveToSpace = async (chatId: string, spaceId: string | null) => {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId }),
      });
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, spaceId } : c)),
      );
      toast.success(spaceId ? 'Déplacé' : 'Retiré de l\'espace');
    } catch {
      toast.error('Erreur');
    }
    setMenuOpenId(null);
  };

  const filterPills: { key: FilterType; label: string; emoji?: string }[] = [
    { key: 'all', label: 'Tous' },
    ...spaces.map((s) => ({ key: s.id, label: s.name, emoji: s.emoji })),
    { key: 'files', label: 'Avec fichiers', emoji: '📎' },
    { key: 'pinned', label: 'Épinglés', emoji: '📌' },
  ];

  return (
    <div>
      <div className="flex flex-col pt-10 border-b border-light-200/20 dark:border-dark-200/20 pb-6 px-2">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="flex items-center justify-center">
            <BookOpenText size={45} className="mb-2.5" />
            <div className="flex flex-col">
              <h1
                className="text-5xl font-normal p-2 pb-0"
                style={{ fontFamily: 'PP Editorial, serif' }}
              >
                Library
              </h1>
              <div className="px-2 text-sm text-black/60 dark:text-white/60 text-center lg:text-left">
                Historique, sources et fichiers uploadés
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-black/60 dark:text-white/60">
            <span className="inline-flex items-center gap-1 rounded-full border border-black/20 dark:border-white/20 px-2 py-0.5">
              <BookOpenText size={14} />
              {loading
                ? 'Loading…'
                : `${chats.length} ${chats.length === 1 ? 'chat' : 'chats'}`}
            </span>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-2 px-2 pt-4">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {filterPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setActiveFilter(pill.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === pill.key
                    ? 'text-white'
                    : 'text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80'
                }`}
                style={
                  activeFilter === pill.key
                    ? {
                        background: 'rgba(59,130,246,.2)',
                        border: '1px solid rgba(59,130,246,.3)',
                        color: '#93c5fd',
                      }
                    : {
                        border: '1px solid rgba(128,128,128,.15)',
                      }
                }
              >
                {pill.emoji && <span>{pill.emoji}</span>}
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
            <span>Trier :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-light-secondary dark:bg-dark-secondary text-black/70 dark:text-white/70 text-xs border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
              <option value="title-asc">Titre A–Z</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-row items-center justify-center min-h-[60vh]">
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
      ) : filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-light-200 dark:border-dark-200 bg-light-secondary dark:bg-dark-secondary">
            <BookOpenText className="text-black/70 dark:text-white/70" />
          </div>
          <p className="mt-2 text-black/70 dark:text-white/70 text-sm">
            {activeFilter === 'all'
              ? 'Aucun chat trouvé.'
              : 'Aucun chat pour ce filtre.'}
          </p>
          {activeFilter === 'all' && (
            <p className="mt-1 text-black/70 dark:text-white/70 text-sm">
              <Link href="/" className="text-sky-400">
                Démarrer un nouveau chat
              </Link>{' '}
              pour le voir apparaître ici.
            </p>
          )}
        </div>
      ) : (
        <div className="pt-4 pb-28 px-2">
          <div className="rounded-2xl border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary">
            {filteredAndSorted.map((chat, index) => {
              const sourcesLabel =
                chat.sources.length === 0
                  ? null
                  : chat.sources.length <= 2
                    ? chat.sources
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(', ')
                    : `${chat.sources
                        .slice(0, 2)
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(', ')} + ${chat.sources.length - 2}`;

              const chatSpace =
                chat.spaceId ? spaceMap[chat.spaceId] : null;

              return (
                <div
                  key={chat.id}
                  className={
                    'group relative flex flex-col gap-2 p-4 hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200 ' +
                    (index !== filteredAndSorted.length - 1
                      ? 'border-b border-light-200 dark:border-dark-200'
                      : '') +
                    (index === 0 ? ' rounded-t-2xl' : '') +
                    (index === filteredAndSorted.length - 1 ? ' rounded-b-2xl' : '')
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/c/${chat.id}`}
                      className="flex-1 text-black dark:text-white text-base lg:text-lg font-medium leading-snug line-clamp-2 group-hover:text-[#24A0ED] transition duration-200"
                      title={chat.title}
                    >
                      {chat.pinned === 1 && (
                        <span className="mr-1.5">📌</span>
                      )}
                      {chat.title}
                    </Link>
                    <div className="flex items-center gap-1.5 pt-0.5 shrink-0">
                      {/* Context menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(
                              menuOpenId === chat.id ? null : chat.id,
                            );
                          }}
                          className="text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 opacity-0 group-hover:opacity-100 transition duration-200 p-1"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuOpenId === chat.id && (
                          <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div
                            className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl py-1.5 shadow-xl"
                            style={{
                              background: '#1a1a22',
                              border: '1px solid rgba(255,255,255,.08)',
                            }}
                          >
                            <button
                              onClick={() =>
                                handleTogglePin(chat.id, chat.pinned || 0)
                              }
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[.04] transition-colors duration-200"
                            >
                              <Pin size={14} />
                              {chat.pinned === 1
                                ? 'Désépingler'
                                : 'Épingler'}
                            </button>
                            {spaces.map((s) => (
                              <button
                                key={s.id}
                                onClick={() =>
                                  handleMoveToSpace(chat.id, s.id)
                                }
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[.04] transition-colors duration-200"
                              >
                                <span className="text-sm">{s.emoji}</span>
                                {chat.spaceId === s.id
                                  ? `Retirer de ${s.name}`
                                  : `→ ${s.name}`}
                              </button>
                            ))}
                            {chat.spaceId && (
                              <button
                                onClick={() =>
                                  handleMoveToSpace(chat.id, null)
                                }
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[.04] transition-colors duration-200"
                              >
                                Retirer de l&apos;espace
                              </button>
                            )}
                          </div>
                          </>
                        )}
                      </div>
                      <DeleteChat
                        chatId={chat.id}
                        chats={chats}
                        setChats={setChats}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-black/70 dark:text-white/70">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <ClockIcon size={14} />
                      {formatTimeDifference(new Date(), chat.createdAt)}
                    </span>

                    {chatSpace && (
                      <span
                        className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5"
                        style={{
                          background: 'rgba(59,130,246,.1)',
                          border: '1px solid rgba(59,130,246,.2)',
                          color: '#93c5fd',
                        }}
                      >
                        <span>{chatSpace.emoji}</span>
                        {chatSpace.name}
                      </span>
                    )}

                    {sourcesLabel && (
                      <span className="inline-flex items-center gap-1 text-xs border border-black/20 dark:border-white/20 rounded-full px-2 py-0.5">
                        <Globe2Icon size={14} />
                        {sourcesLabel}
                      </span>
                    )}
                    {chat.files && chat.files.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs border border-black/20 dark:border-white/20 rounded-full px-2 py-0.5">
                        <FileText size={14} />
                        {chat.files.length}{' '}
                        {chat.files.length === 1 ? 'fichier' : 'fichiers'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
