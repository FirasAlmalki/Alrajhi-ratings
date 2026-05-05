"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { PHASES, REPORTS } from '../lib/config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
}

export default function Sidebar({ isOpen, onClose, currentPage }: SidebarProps) {
  const router = useRouter();
  const { role, permissions, logout } = useApp();
  const [phaseCollapsed, setPhaseCollapsed] = useState(false);
  const [madarCollapsed, setMadarCollapsed] = useState(false);

  const isAdmin = role === 'admin';

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const hasAnyReport = isAdmin || REPORTS.some(r => permissions['report_' + r.key]);

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/Alrajhi.png" alt="الراجحي" className="logo-img-sm" />
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        {/* الرئيسية */}
        <div className="sidebar-section">
          <button className={`sidebar-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => navigate('/')}>الرئيسية</button>
        </div>
        <div className="sidebar-divider"></div>

        {/* الإدارة (أدمن فقط) */}
        {isAdmin && (
          <>
            <div className="sidebar-section">
              <div className="sidebar-section-label">الإدارة</div>
              <button className={`sidebar-item sub ${currentPage === 'users' ? 'active' : ''}`} onClick={() => navigate('/admin/users')}>إدارة المستخدمين</button>
              <button className={`sidebar-item sub ${currentPage === 'manage-reports' ? 'active' : ''}`} onClick={() => navigate('/admin/reports')}>إدارة التقارير</button>
            </div>
            <div className="sidebar-divider"></div>
          </>
        )}

        {/* التقارير */}
        {hasAnyReport && (
          <>
            <div className="sidebar-section">
              <button className={`sidebar-item ${currentPage === 'reports' ? 'active' : ''}`} onClick={() => navigate('/reports')}>التقارير</button>
            </div>
            <div className="sidebar-divider"></div>
          </>
        )}

        {/* مرحلة الجاهزية — collapsible */}
        <div className="sidebar-section">
          <div className="sidebar-phase-header" onClick={() => setPhaseCollapsed(!phaseCollapsed)}>
            <span className="sidebar-phase-label">مرحلة الجاهزية</span>
            <span className={`phase-arrow ${phaseCollapsed ? 'collapsed' : ''}`}>▼</span>
          </div>
          <div className={`phase-items ${phaseCollapsed ? 'collapsed' : ''}`} style={phaseCollapsed ? { maxHeight: 0 } : { maxHeight: '500px' }}>
            {isAdmin && (
              <button className={`sidebar-item sub ${currentPage === 'upload' ? 'active' : ''}`} onClick={() => navigate('/admin/settings')}>الإعدادات</button>
            )}
            
            {PHASES.map(ph => {
              if (!isAdmin && !permissions[ph.key]) return null;
              return (
                <button 
                  key={ph.key}
                  className={`sidebar-item sub ${currentPage === ph.key ? 'active' : ''}`} 
                  onClick={() => navigate(`/${ph.key}`)}
                >
                  {ph.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* مدار */}
        {(isAdmin || permissions['report_madar_reports']) && (
          <>
            <div className="sidebar-divider"></div>
            <div className="sidebar-section">
              <div className="sidebar-phase-header" onClick={() => setMadarCollapsed(!madarCollapsed)}>
                <span className="sidebar-phase-label">مدار</span>
                <span className={`phase-arrow ${madarCollapsed ? 'collapsed' : ''}`}>▼</span>
              </div>
              <div className={`phase-items ${madarCollapsed ? 'collapsed' : ''}`} style={madarCollapsed ? { maxHeight: 0 } : { maxHeight: '500px' }}>
                <button
                  className={`sidebar-item sub ${currentPage === 'madar_reports' ? 'active' : ''}`}
                  onClick={() => navigate('/reports/madar_reports')}
                >
                  المحاضر
                </button>
              </div>
            </div>
          </>
        )}

        <div className="sidebar-logout">
          <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
        </div>
      </div>
    </>
  );
}
