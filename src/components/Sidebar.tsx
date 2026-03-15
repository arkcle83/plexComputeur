'use client';

import { cn, formatTimeDifference } from '@/lib/utils';
import {
  BookOpenText,
  Home,
  Search,
  Plus,
  Settings,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, useEffect, type ReactNode } from 'react';
import Layout from './Layout';
import SettingsButton from './Settings/SettingsButton';
import NewSpaceModal from './Spaces/NewSpaceModal';

interface Space {
  id: string;
  name: string;
  emoji: string;
  chatCount: number;
}

interface RecentChat {
  id: string;
  title: string;
  createdAt: string;
}

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [recents, setRecents] = useState<RecentChat[]>([]);
  const [isNewSpaceOpen, setIsNewSpaceOpen] = useState(false);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('/api/spaces');
      const data = await res.json();
      setSpaces(data.spaces || []);
    } catch {}
  };

  const fetchRecents = async () => {
    try {
      const res = await fetch('/api/chats?limit=5');
      const data = await res.json();
      setRecents(data.chats || []);
    } catch {}
  };

  useEffect(() => {
    fetchSpaces();
    fetchRecents();
  }, []);

  const activeSpaceId = segments.includes('spaces') && segments[1]
    ? segments[1]
    : null;

  const navLinks = [
    {
      icon: Home,
      href: '/',
      active: segments.length === 0 || segments.includes('c'),
      label: 'Accueil',
    },
    {
      icon: Compass,
      href: '/discover',
      active: segments.includes('discover'),
      label: 'Découvrir',
    },
    {
      icon: BookOpenText,
      href: '/library',
      active: segments.includes('library'),
      label: 'Library',
      badge: undefined,
    },
  ];

  return (
    <div>
      {/* Desktop sidebar — 248px */}
      <div
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[248px] lg:flex-col"
        style={{
          background: '#111116',
          borderRight: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <div className="flex grow flex-col justify-between overflow-y-auto px-3 py-5">
          <div className="flex flex-col gap-1">
            {/* Header: Logo + name */}
            <div className="flex items-center gap-2.5 px-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                }}
              >
                V
              </div>
              <span className="text-white font-semibold text-[15px]">
                Vane
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-0.5"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                }}
              >
                PRO
              </span>
            </div>

            {/* New Chat button */}
            <a
              href="/"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white text-sm font-medium mb-3 transition-all duration-200 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              }}
            >
              <Plus size={16} />
              Nouveau chat
            </a>

            {/* NAVIGATION section */}
            <div className="px-2 mb-1">
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,.35)' }}
              >
                Navigation
              </span>
            </div>

            {navLinks.map((link, i) => {
              const isActive = link.active;
              const LinkComponent = link.href === '/' ? 'a' : Link;
              return (
                <LinkComponent
                  key={i}
                  href={link.href}
                  className={cn(
                    'relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'text-[#93c5fd]'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/[.04]',
                  )}
                  style={
                    isActive
                      ? { background: 'rgba(59,130,246,.12)' }
                      : undefined
                  }
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{
                        background:
                          'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                      }}
                    />
                  )}
                  <link.icon size={18} />
                  <span>{link.label}</span>
                  {link.label === 'Library' && recents.length > 0 && (
                    <span
                      className="ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(59,130,246,.15)',
                        color: '#93c5fd',
                      }}
                    >
                      {recents.length}
                    </span>
                  )}
                </LinkComponent>
              );
            })}

            {/* Divider */}
            <div
              className="my-3 mx-2 h-px"
              style={{ background: 'rgba(255,255,255,.06)' }}
            />

            {/* ESPACES section */}
            <div className="px-2 mb-1">
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,.35)' }}
              >
                Espaces
              </span>
            </div>

            {spaces.length === 0 && (
              <p className="px-3 py-2 text-[12px] text-white/25">
                Aucun espace
              </p>
            )}

            {spaces.map((space) => {
              const isActive = activeSpaceId === space.id;
              return (
                <Link
                  key={space.id}
                  href={`/spaces/${space.id}`}
                  className={cn(
                    'relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'text-[#93c5fd]'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/[.04]',
                  )}
                  style={
                    isActive
                      ? { background: 'rgba(59,130,246,.12)' }
                      : undefined
                  }
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{
                        background:
                          'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                      }}
                    />
                  )}
                  <span className="text-base">{space.emoji}</span>
                  <span className="flex-1 truncate">{space.name}</span>
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,.06)',
                      color: 'rgba(255,255,255,.4)',
                    }}
                  >
                    {space.chatCount}
                  </span>
                </Link>
              );
            })}

            <button
              onClick={() => setIsNewSpaceOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 transition-all duration-200 hover:bg-white/[.04]"
            >
              <Plus size={14} />
              <span>Nouvel espace</span>
            </button>

            {/* Divider */}
            <div
              className="my-3 mx-2 h-px"
              style={{ background: 'rgba(255,255,255,.06)' }}
            />

            {/* RÉCENTS section */}
            <div className="px-2 mb-1">
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,.35)' }}
              >
                Récents
              </span>
            </div>

            {recents.length === 0 && (
              <p className="px-3 py-2 text-[12px] text-white/25">
                Aucun chat récent
              </p>
            )}

            {recents.map((chat) => (
              <Link
                key={chat.id}
                href={`/c/${chat.id}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white/70 hover:bg-white/[.04] transition-all duration-200"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'rgba(255,255,255,.25)' }}
                />
                <span className="flex-1 truncate text-[13px]">
                  {chat.title}
                </span>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: 'rgba(255,255,255,.25)' }}
                >
                  {formatTimeDifference(new Date(), chat.createdAt)}
                </span>
              </Link>
            ))}
          </div>

          {/* Footer: Settings */}
          <div className="mt-4 px-2">
            <SettingsButton />
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-light-secondary dark:bg-dark-secondary px-4 py-4 shadow-sm lg:hidden">
        {navLinks.map((link, i) => {
          const LinkComponent = link.href === '/' ? 'a' : Link;
          return (
            <LinkComponent
              href={link.href}
              key={i}
              className={cn(
                'relative flex flex-col items-center space-y-1 text-center w-full transition-colors duration-200',
                link.active
                  ? 'text-black dark:text-white'
                  : 'text-black dark:text-white/70',
              )}
            >
              {link.active && (
                <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-black dark:bg-white" />
              )}
              <link.icon size={22} />
              <p className="text-xs">{link.label}</p>
            </LinkComponent>
          );
        })}
        <Link
          href="/spaces"
          className={cn(
            'relative flex flex-col items-center space-y-1 text-center w-full transition-colors duration-200',
            segments.includes('spaces')
              ? 'text-black dark:text-white'
              : 'text-black dark:text-white/70',
          )}
        >
          {segments.includes('spaces') && (
            <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-black dark:bg-white" />
          )}
          <span className="text-lg">📁</span>
          <p className="text-xs">Espaces</p>
        </Link>
      </div>

      <NewSpaceModal
        isOpen={isNewSpaceOpen}
        setIsOpen={setIsNewSpaceOpen}
        onCreated={fetchSpaces}
      />

      <Layout>{children}</Layout>
    </div>
  );
};

export default Sidebar;
