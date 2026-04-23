"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { PHASES, REPORTS } from '../lib/config';

export default function HomePage() {
  const router = useRouter();
  const { role, permissions, data, syncing } = useApp();
  const isAdmin = role === 'admin';

  const visibleReports = REPORTS.filter(r => isAdmin || permissions['report_' + r.key]);
  const visiblePhases = PHASES.filter(ph => isAdmin || permissions[ph.key]);

  return (
    <>
      <div className="page-header">
        <div className="page-title">الرئيسية</div>
      </div>

      {visibleReports.length > 0 && (
        <>
          <div className="phases-divider">
            <div className="phases-divider-line"></div>
            <span className="phases-divider-lbl">التقارير</span>
            <div className="phases-divider-line"></div>
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
      )}

      {visiblePhases.length > 0 && (
        <>
          <div className="phases-divider">
            <div className="phases-divider-line"></div>
            <span className="phases-divider-lbl">مرحلة الجاهزية</span>
            <div className="phases-divider-line"></div>
          </div>
          <div className="home-phases-grid">
            {visiblePhases.map(ph => {
              const d = data[ph.key];
              const loaded = !!d;
              const locCount = loaded ? d.locations.length : 0;
              const avgPctRaw = loaded && locCount > 0 
                ? (d.locations.reduce((s: number, l: any) => s + l.pct, 0) / locCount * 100) 
                : 0;
              const avgPct = avgPctRaw.toFixed(1);
              const pctColor = avgPctRaw >= 100 ? 'var(--green)' : avgPctRaw >= 75 ? 'var(--gold)' : '#e74c3c';

              return (
                <div key={ph.key} className="home-phase-card" onClick={() => router.push(`/${ph.key}`)}>
                  <div className="home-phase-icon">{ph.icon}</div>
                  <div className="home-phase-label">{ph.label}</div>
                  <div className="home-phase-desc">{ph.desc}</div>
                  
                  {loaded ? (
                    <>
                      <div className="home-phase-pct" style={{ color: pctColor }}>{avgPct}%</div>
                      <div className="home-phase-meta">{locCount} موقع</div>
                    </>
                  ) : syncing ? (
                    <>
                      <div className="skel skel-line" style={{ width: '60px', height: '28px', margin: '8px auto 4px' }}></div>
                      <div className="skel skel-line" style={{ width: '50px', height: '10px' }}></div>
                    </>
                  ) : (
                    <div className="home-phase-empty">لا توجد بيانات</div>
                  )}
                  
                  <div className="home-phase-arrow">←</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
