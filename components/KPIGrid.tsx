"use client";

import React from 'react';

interface KPIGridProps {
  page: string;
  label: string;
  locations: any[];
}

export default function KPIGrid({ page, label, locations }: KPIGridProps) {
  const totalLocs = locations.length;
  const avgPct = totalLocs > 0 ? (locations.reduce((s, l) => s + l.pct, 0) / totalLocs * 100).toFixed(2) : '0.00';

  if (page === 'masaken') {
    const closed = locations.filter(l => l.isClosed).length;
    const withGuests = locations.filter(l => l.hasGuests).length;
    return (
      <div className="kpi-grid kpi-grid-4">
        <div className="kpi-card"><div className="kpi-value">{totalLocs}</div><div className="kpi-label">عدد مواقع {label}</div></div>
        <div className="kpi-card"><div className="kpi-value">{avgPct}%</div><div className="kpi-label">نسبة الجاهزية</div></div>
        <div className="kpi-card"><div className="kpi-value">{closed}</div><div className="kpi-label">المواقع المقفلة</div></div>
        <div className="kpi-card"><div className="kpi-value">{withGuests}</div><div className="kpi-label">يوجد معتمرين</div></div>
      </div>
    );
  }

  const totalItems = locations.reduce((s, l) => s + l.totalItems, 0);
  const failedItems = locations.reduce((s, l) => s + l.failedList.length, 0);
  
  return (
    <div className="kpi-grid kpi-grid-4">
      <div className="kpi-card"><div className="kpi-value">{totalLocs}</div><div className="kpi-label">عدد مخيمات {label}</div></div>
      <div className="kpi-card"><div className="kpi-value">{avgPct}%</div><div className="kpi-label">نسبة الجاهزية</div></div>
      <div className="kpi-card"><div className="kpi-value">{totalItems}</div><div className="kpi-label">إجمالي البنود</div></div>
      <div className="kpi-card"><div className="kpi-value">{failedItems}</div><div className="kpi-label">البنود غير المنفذة</div></div>
    </div>
  );
}
