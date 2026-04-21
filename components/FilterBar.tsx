"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { doExport } from '../lib/export';
import { EXPORT_COLS } from '../lib/config';

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
  const isFiltered = currentFilter && currentFilter.size < locations.length;
  
  const filteredLocs = useMemo(() => {
    if (!search) return locations;
    const s = search.toLowerCase();
    return locations.filter(l => l.name.toLowerCase().includes(s) || (l.sub && l.sub.toLowerCase().includes(s)));
  }, [locations, search]);

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
        <button 
          className={`sort-btn ${currentSort === 'pct' ? 'active' : ''}`}  
          onClick={() => onSortChange('pct')}
        >
          الجاهزية <span className="sort-arrow">{currentSort === 'pct' ? '↑' : ''}</span>
        </button>
        <button 
          className={`sort-btn ${currentSort === 'date' ? 'active' : ''}`}
          onClick={() => onSortChange('date')}
        >
          آخر زيارة <span className="sort-arrow">{currentSort === 'date' ? '↑' : ''}</span>
        </button>
      </div>
    </>
  );
}
