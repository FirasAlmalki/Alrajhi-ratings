"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { ADMIN_PASSWORDS } from '../../lib/config';
import { sbReq } from '../../lib/supabase';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const router = useRouter();

  const handleLogin = async () => {
    const pw = password.trim();
    if (!pw) return;

    if (ADMIN_PASSWORDS[pw]) {
      login('admin', { arafa: true, mina: true, masaken: true }, 'Admin');
      router.push('/');
      return;
    }

    setLoading(true);
    setError('⏳ جاري التحقق...');

    try {
      const list = await sbReq('accounts?password=eq.' + encodeURIComponent(pw) + '&select=*');
      if (list && list.length > 0) {
        const acc = list[0];
        login('supervisor', acc.permissions || {}, acc.name);
        router.push('/');
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    } catch {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-brand">
          <img src="/Alrajhi.png" alt="الراجحي" className="logo-img" style={{ height: '72px' }} />
        </div>
        <input 
          type="password" 
          className="login-input" 
          placeholder="كلمة المرور" 
          autoComplete="off"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        
        <button className="login-btn" onClick={handleLogin} disabled={loading}>دخول</button>
        <div className="login-error">{error}</div>
        <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>
          تم التطوير من قبل إدارة الامتثال والالتزام
        </div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
          للاستفسار: 0533551975
        </div>
      </div>
    </div>
  );
}
