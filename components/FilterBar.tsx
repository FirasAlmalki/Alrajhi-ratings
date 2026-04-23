"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

interface FilterBarProps {
  page: string;
  locations: any[];
  onExportColsOpen: () => void;
  onSortChange: (sortField: string) => void;
  currentSort: string;
}

export default function FilterBar({ page, locations, onExportColsOpen, onSortChange, currentSort }: FilterBarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { filters, updateFilters } = useApp();
  
  const currentFilter = filters[page];
  
  const filteredLocs = useMemo(() => {
    if (!search) return locations;
    const s = search.toLowerCase();
    return locations.filter(l => l.name.toLowerCase().includes(s) || (l.sub && l.sub.toLowerCase().includes(s)));
  }, [locations, search]);
  const quickFilters = useMemo(() => {
    const isAttention = (l: any) => l.pct < 1 || l.failedList?.length || l.isClosed || l.isWrongLocation || l.hasGuests;
    const all = locations.map(l => l.key);
    const filters = [
      { key: 'all', label: 'الكل', keys: all },
      { key: 'attention', label: 'تحتاج متابعة', keys: locations.filter(isAttention).map(l => l.key) },
      { key: 'complete', label: 'مكتمل', keys: locations.filter(l => l.pct >= 1 && !l.failedList?.length && !l.isClosed && !l.isWrongLocation && !l.hasGuests).map(l => l.key) },
    ];

    if (page === 'masaken') {
      filters.push(
        { key: 'closed', label: 'مغلق', keys: locations.filter(l => l.isClosed).map(l => l.key) },
        { key: 'wrong', label: 'موقع خاطئ', keys: locations.filter(l => l.isWrongLocation).map(l => l.key) },
        { key: 'guests', label: 'يوجد معتمرين', keys: locations.filter(l => l.hasGuests).map(l => l.key) },
      );
    }

    return filters.filter(f => f.key === 'all' || f.keys.length > 0);
  }, [locations, page]);

  const isSameSelection = (keys: string[]) => {
    if (!currentFilter) return keys.length === locations.length;
    if (currentFilter.size !== keys.length) return false;
    return keys.every(k => currentFilter.has(k));
  };

  const handleToggleLoc = (key: string, checked: boolean) => {
    const newF = new Set(currentFilter || locations.map(l => l.key));
    if (checked) newF.add(key);
    else newF.delete(key);
    updateFilters(page, newF);
  };

  const selectAll = () => {
    updateFilters(page, new Set(locations.map(l => l.key)));
  };

  const clearAll = () => {
    updateFilters(page, new Set());
  };

  return (
    <>
      <div className="filter-export-bar">
        <button 
          className={`filter-toggle-btn ${filterOpen ? 'active' : ''}`} 
          onClick={() => setFilterOpen(!filterOpen)}
        >
          ☰ فلتر المواقع <span className="filter-badge">{currentFilter ? currentFilter.size : locations.length}/{locations.length}</span>
        </button>
        <button className="export-btn" onClick={onExportColsOpen}>📤 تصدير Excel</button>
        {page !== 'masaken' && (
          <a href="https://majed-almasmoum.github.io/mapscamps/" target="_blank" rel="noopener noreferrer" className="export-btn maps-link-btn">
            🗺️ المواقع بقوقل ماب
          </a>
        )}
      </div>

      <div className={`filter-panel ${filterOpen ? 'open' : ''}`}>
        <div className="quick-filter-row">
          {quickFilters.map(f => (
            <button
              key={f.key}
              className={`quick-filter-chip ${isSameSelection(f.keys) ? 'active' : ''}`}
              onClick={() => updateFilters(page, new Set(f.keys))}
            >
              {f.label}
              <span>{f.keys.length}</span>
            </button>
          ))}
        </div>
        <input 
          className="filter-search-inp" 
          type="text" 
          placeholder="🔍 بحث عن موقع..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-actions-row">
          <button className="filter-act-btn" onClick={selectAll}>تحديد الكل</button>
          <button className="filter-act-btn" onClick={clearAll}>إلغاء الكل</button>
        </div>
        <div className="filter-checklist">
          {filteredLocs.map(l => (
            <div key={l.key} className="filter-item">
              <input 
                type="checkbox" 
                id={`f_${l.key}`} 
                checked={!currentFilter || currentFilter.has(l.key)}
                onChange={(e) => handleToggleLoc(l.key, e.target.checked)}
              />
              <label htmlFor={`f_${l.key}`}>{l.name}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="sort-bar">
        <span className="sort-lbl">ترتيب حسب:</span>
        {(['pct', 'date'] as const).map(field => {
          const isActive = currentSort === field || currentSort === field + '_asc';
          const isAsc    = currentSort === field + '_asc';
          return (
            <button
              key={field}
              className={`sort-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (!isActive) onSortChange(field);          // first click → desc
                else onSortChange(isAsc ? field : field + '_asc'); // toggle
              }}
            >
              {field === 'pct' ? 'الجاهزية' : 'آخر زيارة'}
              <span className="sort-arrow">{isActive ? (isAsc ? ' ↑' : ' ↓') : ''}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
