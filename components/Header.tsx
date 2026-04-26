"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { PAGE_LABELS } from '../lib/config';

interface HeaderProps {
  pageId: string;
  onToggleSidebar: () => void;
}

export default function Header({ pageId, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const title = PAGE_LABELS[pageId] || 'جاهزية المشاعر المقدسة';
  const PHASE_PAGES = ['arafa', 'mina', 'masaken'];
  const subtitle = PHASE_PAGES.includes(pageId) ? 'مرحلة الجاهزية' : '';
  const [theme, setTheme] = useState<'dark'|'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') || 'dark') as 'dark'|'light';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
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
      <button onClick={toggleTheme} aria-label="تبديل الثيم" style={{
        background:'none',border:'1px solid rgba(201,168,76,.3)',borderRadius:'8px',
        color:'#C9A84C',cursor:'pointer',padding:'5px 9px',fontSize:'16px',
        lineHeight:1,flexShrink:0,transition:'background .2s',
      }}
        onMouseEnter={e=>(e.currentTarget.style.background='rgba(201,168,76,.12)')}
        onMouseLeave={e=>(e.currentTarget.style.background='none')}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
