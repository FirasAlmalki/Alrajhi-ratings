"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { sbGetAccounts, sbUpdatePerms } from '../../../lib/supabase';
import { REPORTS } from '../../../lib/config';

export default function ManageReportsPage() {
  const router = useRouter();
  const { role } = useApp();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin') {
      router.push('/');
      return;
    }
    loadAccounts();
  }, [role, router]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const list = await sbGetAccounts();
      setAccounts(list || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const toggleReportPerm = async (accId: number, reportKey: string, checked: boolean) => {
    const acc = accounts.find(a => a.id === accId);
    if (!acc) return;
    const perms = { ...acc.permissions, ['report_' + reportKey]: checked };
    try {
      await sbUpdatePerms(accId, perms);
      setAccounts(accounts.map(a => a.id === accId ? { ...a, permissions: perms } : a));
    } catch {
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  if (role !== 'admin') return null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">إدارة التقارير</div>
        <div className="page-date">تحديد من يمكنه رؤية كل تقرير</div>
      </div>
      
      {REPORTS.map(r => (
        <div key={r.key} className="upload-card" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '22px' }}>{r.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gold)' }}>{r.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{r.desc}</div>
            </div>
          </div>
          
          <div style={{ marginTop: '10px' }}>
            {loading ? '⏳ جاري التحميل...' : accounts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>لا توجد حسابات</div>
            ) : (
              <>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>الأقسام التي تملك صلاحية عرض هذا التقرير:</div>
                {accounts.map(acc => {
                  const checked = !!(acc.permissions && acc.permissions['report_' + r.key]);
                  return (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid rgba(46,61,80,.3)' }}>
                      <input 
                        type="checkbox" 
                        id={`rp_${r.key}_${acc.id}`} 
                        checked={checked}
                        onChange={e => toggleReportPerm(acc.id, r.key, e.target.checked)}
                        style={{ width: '15px', height: '15px', accentColor: 'var(--gold)', cursor: 'pointer' }}
                      />
                      <label htmlFor={`rp_${r.key}_${acc.id}`} style={{ fontSize: '13px', cursor: 'pointer' }}>{acc.name}</label>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
