"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { REPORTS, MADAR } from '../../../lib/config';

export default function ReportFramePage() {
  const { id } = useParams();
  const reportKey = typeof id === 'string' ? id : '';
  const router = useRouter();
  const { role, permissions, userName } = useApp();
  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    const report = [...REPORTS, ...MADAR].find(r => r.key === reportKey);
    if (!report) {
      router.push('/reports');
      return;
    }

    if (role !== 'admin' && !permissions['report_' + reportKey]) {
      router.push('/reports');
      return;
    }

    let src = report.file;
    if (reportKey === 'daily_report' || reportKey === 'daily_report_list') {
      const name = role === 'admin' ? '' : (userName || '');
      const perms = permissions || {};
      const actualRole = role === 'admin' ? 'admin' : (perms.view_all_reports ? 'manager' : 'supervisor');
      const sections = perms.daily_sections ? perms.daily_sections.join(',') : 'all';
      src += `?name=${encodeURIComponent(name)}&role=${actualRole}&sections=${encodeURIComponent(sections)}`;
    }
    
    setIframeSrc(src);

    // Hide main padding for iframe
    const mainEl = document.getElementById('main');
    if (mainEl) {
      mainEl.style.maxWidth = 'none';
      mainEl.style.padding = '0';
    }

    return () => {
      // Restore padding on unmount
      if (mainEl) {
        mainEl.style.maxWidth = '';
        mainEl.style.padding = '';
      }
    };
  }, [reportKey, role, permissions, userName, router]);

  if (!iframeSrc) return null;

  return (
    <div style={{ height: 'calc(100vh - 64px)' }}>
      <iframe 
        src={iframeSrc} 
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="fullscreen"
      ></iframe>
    </div>
  );
}
