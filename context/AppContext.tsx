"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORE_KEYS, PHASES } from '../lib/config';
import { loadFromGSheet } from '../lib/data';

export type Role = 'admin' | 'supervisor' | 'manager' | null;

export interface AppState {
  role: Role;
  permissions: Record<string, any>;
  userName: string;
  data: Record<string, any>;
  syncing: boolean;
  filters: Record<string, Set<string>>;
  sort: Record<string, string>;
}

interface AppContextType extends AppState {
  setRole: (r: Role) => void;
  setPermissions: (p: Record<string, any>) => void;
  setUserName: (n: string) => void;
  login: (r: Role, p: Record<string, any>, n: string) => void;
  logout: () => void;
  syncData: () => Promise<void>;
  updateFilters: (page: string, f: Set<string>) => void;
  updateSort: (page: string, s: string) => void;
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({ arafa:true, mina:true, masaken:true });
  const [userName, setUserName] = useState('');
  const [data, setData] = useState<Record<string, any>>({ arafa: null, mina: null, masaken: null });
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [sort, setSort] = useState<Record<string, string>>({});

  useEffect(() => {
    // Resume session
    const r = sessionStorage.getItem('rj_role') as Role;
    if (r) {
      setRole(r);
      const un = sessionStorage.getItem('rj_user_name');
      if (un) setUserName(un);
      try {
        const p = sessionStorage.getItem('rj_perms');
        if (p) setPermissions(JSON.parse(p));
      } catch {}
    }

    // Load cached data
    const initialData: Record<string, any> = { arafa: null, mina: null, masaken: null };
    for (const [k, sk] of Object.entries(STORE_KEYS)) {
      try {
        const s = localStorage.getItem(sk);
        if (s) {
          const parsed = JSON.parse(s);
          if (parsed.locations) initialData[k] = parsed;
        }
      } catch {}
    }
    setData(initialData);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (role && isHydrated) {
      syncData();
    }
  }, [role, isHydrated]);

  const login = (r: Role, p: Record<string, boolean>, n: string) => {
    setRole(r);
    setPermissions(p);
    setUserName(n);
    sessionStorage.setItem('rj_role', r || '');
    sessionStorage.setItem('rj_perms', JSON.stringify(p));
    if (n) sessionStorage.setItem('rj_user_name', n);
  };

  const logout = () => {
    setRole(null);
    setPermissions({ arafa:true, mina:true, masaken:true });
    setUserName('');
    sessionStorage.removeItem('rj_role');
    sessionStorage.removeItem('rj_perms');
    sessionStorage.removeItem('rj_user_name');
  };

  const syncData = async () => {
    setSyncing(true);
    const newData = { ...data };
    let changed = false;

    const results = await Promise.all(Object.keys(STORE_KEYS).map(async cat => {
      try {
        const d = await loadFromGSheet(cat);
        return { cat, d };
      } catch (e) {
        console.error(`Failed to sync ${cat}:`, e);
        return { cat, d: null };
      }
    }));

    for (const { cat, d } of results) {
      if (d && d.locations.length > 0) {
        newData[cat] = d;
        localStorage.setItem(STORE_KEYS[cat], JSON.stringify(d));
        changed = true;
      }
    }
    
    if (changed) {
      setData(newData);
    }
    setSyncing(false);
  };

  const updateFilters = (page: string, f: Set<string>) => {
    setFilters(prev => ({ ...prev, [page]: f }));
  };

  const updateSort = (page: string, s: string) => {
    setSort(prev => ({ ...prev, [page]: s }));
  };

  return (
    <AppContext.Provider value={{
      role, permissions, userName, data, syncing, filters, sort,
      setRole, setPermissions, setUserName, login, logout, syncData,
      updateFilters, updateSort, isHydrated
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
