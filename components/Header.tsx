"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { PAGE_LABELS } from '../lib/config';

interface HeaderProps {
  pageId: string;
  onToggleSidebar: () => void;
}

export default function Header({ pageId, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { userName, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = PAGE_LABELS[pageId] || 'جاهزية المشاعر المقدسة';
  const PHASE_PAGES = ['arafa', 'mina', 'masaken'];
  const subtitle = PHASE_PAGES.includes(pageId) ? 'مرحلة الجاهزية' : '';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push('/login');
  };

  return (
    <div className="header">
      <div className="header-right">
        <button className="hamburger" onClick={onToggleSidebar} aria-label="القائمة">
          <span></span><span></span><span></span>
        </button>
        <img src="/Alrajhi.png" alt="الراجحي" className="logo-img-sm" style={{cursor:'pointer'}} onClick={() => router.push('/')} />
      </div>
      <div className="header-center">
        <div className="header-title" id="hTitle">{title}</div>
        <div className="header-subtitle" id="hSubtitle">{subtitle}</div>
      </div>
      {userName && (
        <div className="header-user" ref={menuRef}>
          <button className="header-user-btn" onClick={() => setMenuOpen(v => !v)}>
            <span className="header-user-greet">أهلاً،</span>
            <span className="header-user-name">{userName}</span>
          </button>
          {menuOpen && (
            <div className="header-user-menu">
              <button onClick={handleLogout}>تسجيل الخروج</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
