"use client";

import React, { useState } from 'react';
import { EXPORT_COLS } from '../lib/config';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (selectedCols: string[]) => void;
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set(EXPORT_COLS.map(c => c.key)));

  if (!isOpen) return null;

  const toggleCol = (key: string) => {
    const next = new Set(selectedCols);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedCols(next);
  };

  const handleExport = () => {
    onExport(Array.from(selectedCols));
  };

  return (
    <>
      <div className="export-overlay open" onClick={onClose}></div>
      <div className="export-modal open">
        <div className="export-modal-title">📊 اختر الأعمدة للتصدير</div>
        <div>
          {EXPORT_COLS.map(c => (
            <div key={c.key} className="export-col-item">
              <input 
                type="checkbox" 
                id={`ec_${c.key}`} 
                checked={selectedCols.has(c.key)}
                onChange={() => toggleCol(c.key)}
              />
              <label htmlFor={`ec_${c.key}`}>{c.label}</label>
            </div>
          ))}
        </div>
        <div className="export-modal-actions">
          <button className="do-export-btn" onClick={handleExport}>تصدير</button>
          <button className="cancel-export-btn" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </>
  );
}
