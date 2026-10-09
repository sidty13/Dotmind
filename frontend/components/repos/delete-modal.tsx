'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
  repoName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  repoName,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');

  if (!isOpen) return null;

  const isMatched = typedConfirmation.trim().toLowerCase() === repoName.toLowerCase();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatched) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md border border-signal-red bg-panel rounded-[6px] overflow-hidden font-mono text-[13px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-raised text-signal-red">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} />
            <span className="font-bold uppercase tracking-label">[ CONFIRM DELETION ]</span>
          </div>
          <button onClick={onClose} className="text-dim hover:text-text">
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          <p className="text-dim leading-relaxed">
            This will permanently remove the FAISS vector index and all chunk caches for{' '}
            <span className="text-text font-bold">&quot;{repoName}&quot;</span>.
          </p>

          <div className="p-3 bg-bg border border-border rounded-[4px] space-y-2">
            <label className="text-[11px] uppercase tracking-label text-dim block">
              Type <span className="text-signal-red">&quot;{repoName}&quot;</span> to confirm:
            </label>
            <div className="flex items-center text-[14px]">
              <span className="text-signal-red font-bold mr-1.5">{'>'}</span>
              <input
                type="text"
                autoFocus
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder={`${repoName}_`}
                className="w-full bg-transparent text-text placeholder:text-dim/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={!isMatched}
            >
              Delete repository
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
