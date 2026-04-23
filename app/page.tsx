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
  const getPhaseStats = (phaseKey: string) => {
    const d = data[phaseKey];
    const locations = d?.locations || [];
    const locCount = locations.length;
    const avgPctRaw = locCount > 0
      ? (locations.reduce((s: number, l: any) => s + l.pct, 0) / locCount * 100)
      : 0;
    const attention = locations.filter((l: any) => l.pct < 1 || l.failedList?.length || l.isClosed || l.isWrongLocation || l.hasGuests).length;
    const critical = locations.filter((l: any) => l.isClosed || l.isWrongLocation || l.hasGuests).length;

    return {
      loaded: !!d,
      locCount,
      avgPctRaw,
      avgPct: avgPctRaw.toFixed(1),
      pctColor: avgPctRaw >= 100 ? 'var(--green)' : avgPctRaw >= 75 ? 'var(--gold)' : '#e74c3c',
      attention,
      critical
    };
  };
  const loadedPhaseStats = visiblePhases.map(ph => getPhaseStats(ph.key)).filter(s => s.loaded);
  const totalAttention = loadedPhaseStats.reduce((s, st) => s + st.attention, 0);
  const totalCritical = loadedPhaseStats.reduce((s, st) => s + st.critical, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-title">الرئيسية</div>
        {loadedPhaseStats.length > 0 && (
          <div className="home-ops-strip">
            <div className="home-ops-item">
              <span className="home-ops-value">{totalAttention}</span>
              <span>موقع يحتاج متابعة</span>
            </div>
            <div className={`home-ops-item ${totalCritical > 0 ? 'critical' : ''}`}>
              <span className="home-ops-value">{totalCritical}</span>
              <span>حالة عاجلة</span>
            </div>
          </div>
        )}
      </div>

      {visiblePhases.length > 0 && (
        <>
          <div className="phases-divider">
            <div className="phases-divider-line"></div>
            <span className="phases-divider-lbl">مرحلة الجاهزية</span>
            <div className="phases-divider-line"></div>
          </div>
          <div className="home-phases-grid">
            {visiblePhases.map(ph => {
              const stats = getPhaseStats(ph.key);

              return (
                <div key={ph.key} className="home-phase-card readiness-card" onClick={() => router.push(`/${ph.key}`)}>
                  <div className="home-phase-icon">{ph.icon}</div>
                  <div className="home-phase-label">{ph.label}</div>
                  <div className="home-phase-desc">{ph.desc}</div>
                  
                  {stats.loaded ? (
                    <>
                      <div className="home-phase-pct" style={{ color: stats.pctColor }}>{stats.avgPct}%</div>
                      <div className="home-phase-meta">{stats.locCount} موقع</div>
                      <div className={`home-phase-issue ${stats.critical > 0 ? 'critical' : stats.attention > 0 ? 'warning' : 'ok'}`}>
                        {stats.critical > 0
                          ? `${stats.critical} حالة عاجلة`
                          : stats.attention > 0
                            ? `${stats.attention} موقع غير مكتمل`
                            : 'جاهز بالكامل'}
                      </div>
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

      {visibleReports.length > 0 && (
        <>
          <div className="phases-divider">
            <div className="phases-divider-line"></div>
            <span className="phases-divider-lbl">التقارير</span>
            <div className="phases-divider-line"></div>
          </div>
          <div className="home-phases-grid">
            {visibleReports.map(r => (
              <div key={r.key} className="home-phase-card report-card-home" onClick={() => router.push(`/reports/${r.key}`)}>
                <div className="home-phase-icon">{r.icon}</div>
                <div className="home-phase-label" style={{ fontSize: '16px' }}>{r.label}</div>
                <div className="home-phase-desc">{r.desc}</div>
                <div className="home-phase-arrow">←</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
