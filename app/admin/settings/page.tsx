"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { getWebhookUrl, saveWebhookUrls } from '../../../lib/config';

export default function SettingsPage() {
  const router = useRouter();
  const { role, syncData, syncing } = useApp();
  
  const [urls, setUrls] = useState({ arafa: '', mina: '', masaken: '', madar: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (role !== 'admin') {
      router.push('/');
      return;
    }
    setUrls({
      arafa: getWebhookUrl('arafa'),
      mina: getWebhookUrl('mina'),
      masaken: getWebhookUrl('masaken'),
      madar: getWebhookUrl('madar')
    });
  }, [role, router]);

  const handleSave = () => {
    saveWebhookUrls(urls);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSync = async () => {
    await syncData();
  };

  if (role !== 'admin') return null;

  const sections = [
    { k: 'arafa', label: 'عرفة', icon: '🕌' },
    { k: 'mina', label: 'منى', icon: '⛺' },
    { k: 'masaken', label: 'المساكن', icon: '🏨' },
    { k: 'madar', label: 'محاضر', icon: '📄' }
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-title">إعدادات مرحلة الجاهزية</div>
        <div className="page-date">روابط مصادر البيانات</div>
      </div>
      
      <div className="upload-card" style={{ borderColor: 'rgba(76,175,138,.3)' }}>
        <div className="upload-title">روابط البيانات (Webhook)</div>
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sections.map(s => (
            <div key={s.k}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
              <input 
                value={(urls as any)[s.k]}
                onChange={e => setUrls({ ...urls, [s.k]: e.target.value })}
                className="settings-url-input"
                style={{ width: '100%', background: 'var(--deep-navy)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-light)', fontSize: '13px', fontFamily: 'inherit', direction: 'ltr' }}
              />
            </div>
          ))}
          <div className="settings-actions-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
            <button className="export-btn" onClick={handleSave}>حفظ الروابط</button>
            {saved && <span style={{ color: 'var(--green)', fontSize: '13px' }}>✓ تم الحفظ</span>}
          </div>
        </div>
      </div>

    </>
  );
}
