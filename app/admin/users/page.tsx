"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { sbGetAccounts, sbAddAccount, sbUpdatePerms, sbDeleteAccount, sbUpdateAccount } from '../../../lib/supabase';
import { PHASES, REPORTS, MADAR } from '../../../lib/config';

export default function UsersPage() {
  const router = useRouter();
  const { role } = useApp();

  const [accounts, setAccounts]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [newName, setNewName]     = useState('');
  const [newPw, setNewPw]         = useState('');
  const [msg, setMsg]             = useState('');

  // Edit modal state
  const [editAcc, setEditAcc]     = useState<any>(null);
  const [editName, setEditName]   = useState('');
  const [editPw, setEditPw]       = useState('');
  const [editMsg, setEditMsg]     = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (role !== 'admin') { router.push('/'); return; }
    loadAccounts();
  }, [role, router]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const list = await sbGetAccounts();
      setAccounts(list || []);
    } catch {
      setMsg('فشل في تحميل الحسابات');
    }
    setLoading(false);
  };

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleAddAccount = async () => {
    const n = newName.trim(), p = newPw.trim();
    if (!n || !p) { showMsg('الرجاء إدخال الاسم وكلمة المرور'); return; }
    try {
      await sbAddAccount(n, p, { arafa:true, mina:true, masaken:true });
      setNewName(''); setNewPw('');
      showMsg('✓ تم إضافة الحساب بنجاح');
      loadAccounts();
    } catch {
      showMsg('✕ فشل في إضافة الحساب (ربما الاسم أو كلمة المرور موجودة مسبقاً)');
    }
  };

  const togglePerm = async (id: number, key: string, val: boolean) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    const perms = { ...acc.permissions, [key]: val };
    try {
      await sbUpdatePerms(id, perms);
      setAccounts(accounts.map(a => a.id === id ? { ...a, permissions: perms } : a));
    } catch { showMsg('✕ حدث خطأ أثناء الحفظ'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد الحذف؟')) return;
    try { await sbDeleteAccount(id); loadAccounts(); }
    catch { showMsg('✕ فشل الحذف'); }
  };

  const openEdit = (acc: any) => {
    setEditAcc(acc);
    setEditName(acc.name);
    setEditPw('');
    setEditMsg('');
  };

  const handleEditSave = async () => {
    const n = editName.trim();
    if (!n) { setEditMsg('الاسم لا يمكن أن يكون فارغاً'); return; }
    setEditSaving(true);
    setEditMsg('');
    try {
      const fields: { name?: string; password?: string } = { name: n };
      if (editPw.trim()) fields.password = editPw.trim();
      await sbUpdateAccount(editAcc.id, fields);
      setAccounts(accounts.map(a => a.id === editAcc.id ? { ...a, name: n, ...(fields.password ? { password: fields.password } : {}) } : a));
      setEditAcc(null);
      showMsg('✓ تم تعديل الحساب');
    } catch {
      setEditMsg('حدث خطأ، حاول مرة أخرى');
    } finally {
      setEditSaving(false);
    }
  };

  if (role !== 'admin') return null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">إدارة المستخدمين</div>
        <div className="page-date">إضافة وإدارة صلاحيات الأقسام</div>
      </div>

      <div className="upload-card" style={{ borderColor: 'rgba(76,175,138,.3)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم القسم"
            style={{ flex:1, minWidth:'120px', background:'var(--deep-navy)', border:'1px solid var(--card-border)', borderRadius:'8px', padding:'8px 12px', color:'var(--text-main)', fontFamily:'inherit', fontSize:'13px' }} />
          <input value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="كلمة المرور"
            style={{ flex:1, minWidth:'100px', background:'var(--deep-navy)', border:'1px solid var(--card-border)', borderRadius:'8px', padding:'8px 12px', color:'var(--text-main)', fontFamily:'inherit', fontSize:'13px' }} />
          <button className="export-btn" onClick={handleAddAccount}>+ إضافة</button>
        </div>
        {msg && <div style={{ fontSize:'12px', marginTop:'6px', color: msg.includes('✕') ? '#e74c3c' : 'var(--green)' }}>{msg}</div>}

        <div style={{ marginTop: '14px' }}>
          {loading ? '⏳ جاري التحميل...' : accounts.length === 0 ? 'لا يوجد مستخدمين' : (
            accounts.map(acc => (
              <div key={acc.id} style={{ background:'var(--card-bg)', border:'1px solid var(--card-border)', borderRadius:'12px', padding:'14px', marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'var(--gold)' }}>{acc.name}</div>
                    <div style={{ fontSize:'11px', color:'var(--text-muted)', fontFamily:'monospace', marginTop:'2px' }}>{acc.password}</div>
                  </div>
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button className="export-btn" style={{ fontSize:'12px', padding:'5px 12px' }} onClick={() => openEdit(acc)}>تعديل</button>
                    <button className="delete-btn" onClick={() => handleDelete(acc.id)}>حذف</button>
                  </div>
                </div>

                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>صلاحيات النماذج الميدانية:</div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'10px' }}>
                  {PHASES.map(ph => {
                    const checked = !!(acc.permissions && acc.permissions[ph.key]);
                    return (
                      <label key={ph.key} style={{ display:'flex', alignItems:'center', gap:'4px', background:'var(--deep-navy)', padding:'4px 10px', borderRadius:'6px', fontSize:'12px', border:'1px solid var(--card-border)' }}>
                        <input type="checkbox" checked={checked} onChange={e => togglePerm(acc.id, ph.key, e.target.checked)} style={{ accentColor:'var(--gold)' }} />
                        {ph.label}
                      </label>
                    );
                  })}
                </div>

                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px', paddingTop:'8px', borderTop:'1px solid var(--card-border)' }}>صلاحيات التقارير والإدارة:</div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {REPORTS.map(r => {
                    const checked = !!(acc.permissions && acc.permissions['report_' + r.key]);
                    return (
                      <label key={r.key} style={{ display:'flex', alignItems:'center', gap:'4px', background:'var(--deep-navy)', padding:'4px 10px', borderRadius:'6px', fontSize:'12px', border:'1px solid var(--card-border)' }}>
                        <input type="checkbox" checked={checked} onChange={e => togglePerm(acc.id, 'report_' + r.key, e.target.checked)} style={{ accentColor:'var(--gold)' }} />
                        {r.label}
                      </label>
                    );
                  })}
                  <label style={{ display:'flex', alignItems:'center', gap:'4px', background:'var(--deep-navy)', padding:'4px 10px', borderRadius:'6px', fontSize:'12px', border:'1px solid var(--card-border)' }}>
                    <input type="checkbox" checked={!!(acc.permissions?.view_all_reports)} onChange={e => togglePerm(acc.id, 'view_all_reports', e.target.checked)} style={{ accentColor:'var(--gold)' }} />
                    صلاحية مدير (رؤية الكل)
                  </label>
                </div>

                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px', paddingTop:'8px', borderTop:'1px solid var(--card-border)' }}>صلاحيات مدار:</div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {MADAR.map(r => {
                    const checked = !!(acc.permissions && acc.permissions['report_' + r.key]);
                    return (
                      <label key={r.key} style={{ display:'flex', alignItems:'center', gap:'4px', background:'var(--deep-navy)', padding:'4px 10px', borderRadius:'6px', fontSize:'12px', border:'1px solid var(--card-border)' }}>
                        <input type="checkbox" checked={checked} onChange={e => togglePerm(acc.id, 'report_' + r.key, e.target.checked)} style={{ accentColor:'var(--gold)' }} />
                        {r.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit account modal */}
      {editAcc && (
        <div className="acct-modal-overlay" onClick={() => setEditAcc(null)}>
          <div className="acct-modal" onClick={e => e.stopPropagation()}>
            <div className="acct-modal-hdr">
              <span className="acct-modal-title">تعديل الحساب</span>
              <button className="acct-modal-close" onClick={() => setEditAcc(null)}>✕ إغلاق</button>
            </div>
            <div className="acct-modal-body">
              <div className="acct-field">
                <label>الاسم</label>
                <input type="text" className="acct-input" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="acct-field">
                <label>كلمة المرور الجديدة (اتركها فارغة إن لم تريد تغييرها)</label>
                <input type="text" className="acct-input" value={editPw} onChange={e => setEditPw(e.target.value)} placeholder="كلمة المرور الجديدة" />
              </div>
              {editMsg && <div className="acct-err">{editMsg}</div>}
            </div>
            <div className="acct-modal-footer">
              <button className="acct-cancel-btn" onClick={() => setEditAcc(null)}>إلغاء</button>
              <button className="acct-save-btn" onClick={handleEditSave} disabled={editSaving}>
                {editSaving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
