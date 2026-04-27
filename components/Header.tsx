"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { PAGE_LABELS } from '../lib/config';
import { sbVerifyAccount, sbUpdateAccount } from '../lib/supabase';

interface HeaderProps {
  pageId: string;
  onToggleSidebar: () => void;
}

export default function Header({ pageId, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { userName, setUserName, logout } = useApp();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [editOpen, setEditOpen]     = useState(false);
  const [curPw, setCurPw]           = useState('');
  const [newName, setNewName]       = useState('');
  const [newPw, setNewPw]           = useState('');
  const [err, setErr]               = useState('');
  const [saving, setSaving]         = useState(false);
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

  const openEdit = () => {
    setMenuOpen(false);
    setCurPw(''); setNewName(''); setNewPw(''); setErr('');
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!curPw) { setErr('أدخل كلمة المرور الحالية'); return; }
    if (!newName && !newPw) { setErr('أدخل الاسم الجديد أو كلمة المرور الجديدة'); return; }
    setSaving(true);
    setErr('');
    try {
      const list = await sbVerifyAccount(userName, curPw);
      if (!list || list.length === 0) { setErr('كلمة المرور الحالية غير صحيحة'); setSaving(false); return; }
      const id = list[0].id;
      const fields: { name?: string; password?: string } = {};
      if (newName.trim())  fields.name     = newName.trim();
      if (newPw.trim())    fields.password = newPw.trim();
      await sbUpdateAccount(id, fields);
      if (fields.name) {
        setUserName(fields.name);
        sessionStorage.setItem('rj_user_name', fields.name);
      }
      setEditOpen(false);
    } catch {
      setErr('حدث خطأ، حاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
                <button className="edit-account-btn" onClick={openEdit}>تعديل الحساب</button>
                <button onClick={handleLogout}>تسجيل الخروج</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account edit modal */}
      {editOpen && (
        <div className="acct-modal-overlay" onClick={() => setEditOpen(false)}>
          <div className="acct-modal" onClick={e => e.stopPropagation()}>
            <div className="acct-modal-hdr">
              <span className="acct-modal-title">تعديل الحساب</span>
              <button className="acct-modal-close" onClick={() => setEditOpen(false)}>✕ إغلاق</button>
            </div>
            <div className="acct-modal-body">
              <div className="acct-field">
                <label>كلمة المرور الحالية *</label>
                <input type="password" className="acct-input" value={curPw}
                  onChange={e => setCurPw(e.target.value)} placeholder="أدخل كلمة المرور الحالية" />
              </div>
              <div className="acct-field">
                <label>الاسم الجديد (اختياري)</label>
                <input type="text" className="acct-input" value={newName}
                  onChange={e => setNewName(e.target.value)} placeholder={userName} />
              </div>
              <div className="acct-field">
                <label>كلمة المرور الجديدة (اختياري)</label>
                <input type="password" className="acct-input" value={newPw}
                  onChange={e => setNewPw(e.target.value)} placeholder="اتركها فارغة إن لم تريد تغييرها" />
              </div>
              <div className="acct-err">{err}</div>
            </div>
            <div className="acct-modal-footer">
              <button className="acct-cancel-btn" onClick={() => setEditOpen(false)}>إلغاء</button>
              <button className="acct-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
