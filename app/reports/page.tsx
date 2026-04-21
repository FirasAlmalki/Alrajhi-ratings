"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { REPORTS } from '../../lib/config';

export default function ReportsPage() {
  const router = useRouter();
  const { role, permissions } = useApp();
  const isAdmin = role === 'admin';

  const visibleReports = REPORTS.filter(r => isAdmin || permissions['report_' + r.key]);

  if (!visibleReports.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-text">لا توجد تقارير متاحة</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">التقارير</div>
      </div>
      <div className="home-phases-grid">
        {visibleReports.map(r => (
          <div key={r.key} className="home-phase-card" onClick={() => router.push(`/reports/${r.key}`)}>
            <div className="home-phase-icon">{r.icon}</div>
            <div className="home-phase-label" style={{ fontSize: '16px' }}>{r.label}</div>
            <div className="home-phase-desc">{r.desc}</div>
            <div className="home-phase-arrow">←</div>
          </div>
        ))}
      </div>
    </>
  );
}
