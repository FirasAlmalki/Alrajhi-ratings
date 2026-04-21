"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { PAGE_LABELS, PAGE_DESCS, PHASES } from '../../lib/config';
import KPIGrid from '../../components/KPIGrid';
import FilterBar from '../../components/FilterBar';
import LocationCard from '../../components/LocationCard';
import ExportModal from '../../components/ExportModal';
import { doExport } from '../../lib/export';

export default function PhasePage() {
  const { phase } = useParams();
  const page = typeof phase === 'string' ? phase : '';
  const router = useRouter();
  const { role, permissions, data, syncing, filters, sort, updateSort } = useApp();
  
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Validate route
  if (!PHASES.find(p => p.key === page)) {
    return <div className="empty-state"><div className="empty-text">صفحة غير موجودة</div></div>;
  }
  if (role !== 'admin' && !permissions[page]) {
    router.push('/');
    return null;
  }

  const pageData = data[page];
  const label = PAGE_LABELS[page];
  const desc = PAGE_DESCS[page];

  if (!pageData) {
    if (syncing) {
      return (
        <>
          <div className="page-header"><div className="page-title">جاري التحميل...</div></div>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skel-loc">
              <div className="skel skel-circle" style={{ width: '36px', height: '36px', flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <div className="skel skel-line" style={{ width: '55%', height: '12px', marginBottom: '6px' }}></div>
                <div className="skel skel-line" style={{ width: '35%', height: '10px' }}></div>
              </div>
              <div className="skel skel-line" style={{ width: '38px', height: '20px', borderRadius: '10px' }}></div>
            </div>
          ))}
        </>
      );
    }
    const msg = role === 'admin'
      ? 'افتح القائمة واختر "الإعدادات" وحمّل البيانات'
      : 'لم يتم تحميل البيانات بعد، تواصل مع المسؤول';
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <div className="empty-text">{msg}</div>
      </div>
    );
  }

  const { locations } = pageData;
  const currentSort = sort[page] || 'pct';
  const currentFilter = filters[page];

  // Apply filters & sort
  const visibleLocs = useMemo(() => {
    let list = locations;
    // Filter
    if (currentFilter) {
      list = list.filter((l: any) => currentFilter.has(l.key));
    }
    // Sort
    list = [...list].sort((a: any, b: any) => {
      if (currentSort === 'pct') return b.pct - a.pct;
      if (currentSort === 'date') {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      }
      return 0;
    });
    return list;
  }, [locations, currentFilter, currentSort]);

  const handleExport = (cols: string[]) => {
    doExport(page, pageData, cols, currentFilter || null);
    setExportModalOpen(false);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">{label}</div>
        {desc && <div className="page-date">{desc}</div>}
      </div>

      <KPIGrid page={page} label={label} locations={locations} />

      <FilterBar 
        page={page} 
        locations={locations} 
        currentSort={currentSort}
        onSortChange={(s) => updateSort(page, s)}
        onExportColsOpen={() => setExportModalOpen(true)}
      />

      <div id="locList">
        {visibleLocs.length > 0 ? (
          visibleLocs.map((loc: any) => (
            <LocationCard key={loc.key} loc={loc} isMasaken={page === 'masaken'} />
          ))
        ) : (
          <div className="empty-state"><div className="empty-text">لا توجد بيانات</div></div>
        )}
      </div>

      <ExportModal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
        onExport={handleExport}
      />
    </>
  );
}
