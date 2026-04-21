"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PAGE_LABELS } from '../lib/config';

interface HeaderProps {
  pageId: string;
  onToggleSidebar: () => void;
}

export default function Header({ pageId, onToggleSidebar }: HeaderProps) {
  const title = PAGE_LABELS[pageId] || 'جاهزية المشاعر المقدسة';
  const PHASE_PAGES = ['arafa', 'mina', 'masaken'];
  const subtitle = PHASE_PAGES.includes(pageId) ? 'مرحلة الجاهزية' : '';

  return (
    <div className="header">
      <div className="header-right">
        <button className="hamburger" onClick={onToggleSidebar} aria-label="القائمة">
          <span></span><span></span><span></span>
        </button>
        <img src="/Alrajhi.png" alt="الراجحي" className="logo-img-sm" />
      </div>
      <div className="header-center">
        <div className="header-title" id="hTitle">{title}</div>
        <div className="header-subtitle" id="hSubtitle">{subtitle}</div>
      </div>
    </div>
  );
}
