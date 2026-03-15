'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';

const EMOJI_OPTIONS = [
  '📁', '💻', '💡', '📊', '🧠', '🎨',
  '📝', '🔬', '🎯', '💰', '🌍', '🚀',
];

const NewSpaceModal = ({
  isOpen,
  setIsOpen,
  onCreated,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCreated: () => void;
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), emoji }),
      });

      if (!res.ok) throw new Error('Failed to create space');

      toast.success('Espace créé');
      setName('');
      setEmoji('📁');
      setIsOpen(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => !loading && setIsOpen(false)}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full max-w-md transform rounded-2xl p-6 text-left align-middle shadow-xl transition-all"
                style={{
                  background: '#1a1a22',
                  border: '1px solid rgba(255,255,255,.08)',
                }}
              >
                <DialogTitle className="text-lg font-semibold text-white mb-4">
                  Nouvel espace
                </DialogTitle>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 mb-1.5 block">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mon espace..."
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      style={{
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.06)',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-1.5 block">
                      Icône
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJI_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEmoji(e)}
                          className={`flex items-center justify-center w-10 h-10 rounded-xl text-xl transition-all duration-150 ${
                            emoji === e
                              ? 'ring-2 ring-blue-500 scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{
                            background:
                              emoji === e
                                ? 'rgba(59,130,246,.15)'
                                : 'rgba(255,255,255,.04)',
                            border: '1px solid rgba(255,255,255,.06)',
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => !loading && setIsOpen(false)}
                    className="text-sm text-white/50 hover:text-white/70 transition duration-200 px-3 py-2"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || loading}
                    className="text-sm text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    }}
                  >
                    {loading ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewSpaceModal;
