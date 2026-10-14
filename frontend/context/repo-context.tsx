'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Repository } from '@/lib/types';

interface RepoContextType {
  repos: Repository[];
  activeRepo: Repository | null;
  isLoading: boolean;
  switchRepo: (repoId: string) => Promise<void>;
  deleteRepo: (repoId: string) => Promise<void>;
  refreshRepos: () => Promise<void>;
}

const RepoContext = createContext<RepoContextType>({
  repos: [],
  activeRepo: null,
  isLoading: true,
  switchRepo: async () => {},
  deleteRepo: async () => {},
  refreshRepos: async () => {},
});
import { API_BASE_URL } from '@/lib/api';

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, isSignedIn } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRepos = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers: HeadersInit = {};
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${API_BASE_URL}/repos`, { headers });
      if (res.ok) {
        const data = await res.json();
        const rawRepos = data.repositories || [];
        const formatted: Repository[] = rawRepos.map((r: any) => ({
          id: r.id || r.repo_id,
          owner: r.owner || (r.repo_id?.split('_')[0] || ''),
          name: r.name || (r.repo_id?.split('_')[1] || r.repo_id),
          url: r.url || r.repo_url || '',
          branch: r.branch || 'main',
          status: r.is_active ? 'ACTIVE' : (r.status || 'READY'),
          filesCount: r.files_count || 0,
          chunksCount: r.chunks_count || 0,
          lastIndexed: r.ingested_at || 'Recently',
        }));

        setRepos(formatted);
        const active = formatted.find((r) => r.status === 'ACTIVE') || formatted[0] || null;
        setActiveRepo(active);
      } else {
        setRepos([]);
        setActiveRepo(null);
      }
    } catch {
      // Backend not reached or offline: default to empty list (no hardcoded data)
      setRepos([]);
      setActiveRepo(null);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const switchRepo = async (repoId: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/repos/switch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ repo_id: repoId }),
      });

      setRepos((prev) =>
        prev.map((r) => ({
          ...r,
          status: r.id === repoId ? 'ACTIVE' : 'READY',
        }))
      );
      const chosen = repos.find((r) => r.id === repoId) || null;
      if (chosen) {
        setActiveRepo({ ...chosen, status: 'ACTIVE' });
      }
    } catch (err) {
      console.error('Failed to switch repository:', err);
    }
  };

  const deleteRepo = async (repoId: string) => {
    try {
      const headers: HeadersInit = {};
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/repos/${repoId}`, {
        method: 'DELETE',
        headers,
      });

      setRepos((prev) => {
        const remaining = prev.filter((r) => r.id !== repoId);
        if (activeRepo?.id === repoId) {
          setActiveRepo(remaining[0] || null);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete repository:', err);
    }
  };

  return (
    <RepoContext.Provider
      value={{
        repos,
        activeRepo,
        isLoading,
        switchRepo,
        deleteRepo,
        refreshRepos: fetchRepos,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => useContext(RepoContext);
