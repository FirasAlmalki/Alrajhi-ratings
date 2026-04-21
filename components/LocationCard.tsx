"use client";

import React, { useState } from 'react';

interface LocationCardProps {
  loc: any;
  isMasaken: boolean;
}

export default function LocationCard({ loc, isMasaken }: LocationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const pctVal = Math.round(loc.pct * 100);
  const is100 = pctVal === 100;
  const barColor = is100 ? 'var(--green)' : 'var(--gold)';
  const badgePctClass = is100 ? 'badge badge-pct-100' : 'badge badge-pct';
  const visitDate = loc.dateDisplay || '';

  let failBadge = null;
  if (loc.isClosed) {
    failBadge = <span className="badge badge-fail">مغلق</span>;
  } else if (loc.isWrongLocation) {
    failBadge = <span className="badge" style={{ background: 'rgba(230,126,34,.15)', color: '#e67e22', border: '1px solid rgba(230,126,34,.3)' }}>موقع خاطئ</span>;
  } else if (loc.hasGuests) {
    failBadge = <span className="badge" style={{ background: 'rgba(231,76,60,.12)', color: '#e74c3c', border: '1px solid rgba(231,76,60,.3)' }}>معتمرين</span>;
  } else if (loc.failedList.length > 0) {
    failBadge = <span className="badge badge-fail">{loc.failedList.length} بند</span>;
  } else {
    failBadge = <span className="badge badge-ok">مكتمل</span>;
  }

  const renderDetails = () => {
    if (loc.isClosed) {
      return (
        <>
          <div className="all-done" style={{ color: '#e74c3c' }}>✕ مقر السكن مغلق</div>
          {loc.failedList.length > 0 && (
            <>
              <div className="details-subtitle" style={{ marginTop: '8px' }}>البنود التي لم تُنفذ ({loc.failedList.length})</div>
              {loc.failedList.map((q: string, i: number) => (
                <div key={i} className="detail-row"><div className="detail-dot"></div><div>{q}</div></div>
              ))}
            </>
          )}
        </>
      );
    }
    if (loc.isWrongLocation) {
      return (
        <>
          <div className="all-done" style={{ color: '#e67e22' }}>✕ موقع السكن غير صحيح</div>
          {loc.failedList.length > 0 && (
            <>
              <div className="details-subtitle" style={{ marginTop: '8px' }}>البنود التي لم تُنفذ ({loc.failedList.length})</div>
              {loc.failedList.map((q: string, i: number) => (
                <div key={i} className="detail-row"><div className="detail-dot"></div><div>{q}</div></div>
              ))}
            </>
          )}
        </>
      );
    }
    if (loc.hasGuests) {
      return (
        <>
          <div className="all-done" style={{ color: '#e74c3c' }}>⚠️ يوجد معتمرين في المقر</div>
          {loc.failedList.length > 0 && (
            <>
              <div className="details-subtitle" style={{ marginTop: '8px' }}>البنود التي لم تُنفذ ({loc.failedList.length})</div>
              {loc.failedList.map((q: string, i: number) => (
                <div key={i} className="detail-row"><div className="detail-dot"></div><div>{q}</div></div>
              ))}
            </>
          )}
        </>
      );
    }
    if (loc.failedList.length > 0) {
      return (
        <>
          <div className="details-subtitle">البنود التي لم تُنفذ ({loc.failedList.length})</div>
          {loc.failedList.map((q: string, i: number) => (
            <div key={i} className="detail-row"><div className="detail-dot"></div><div>{q}</div></div>
          ))}
        </>
      );
    }
    return <div className="all-done">✓ جميع البنود منفذة</div>;
  };

  return (
    <div className={`loc-card ${expanded ? 'expanded' : ''}`} data-key={loc.key}>
      <div className="loc-header" onClick={() => setExpanded(!expanded)}>
        <div className="loc-name">
          {loc.name}
          {loc.sub && <div className="loc-sub">{loc.sub}</div>}
          {visitDate && <div className="loc-visit">{visitDate}</div>}
        </div>
        <div className="loc-meta">
          <span className={badgePctClass}>{pctVal}%</span>
          {failBadge}
          <span className="expand-arrow">▼</span>
        </div>
      </div>
      <div className="pct-bar-wrap">
        <div className="pct-bar" style={{ width: `${pctVal}%`, background: barColor }}></div>
      </div>
      <div className="loc-details">
        {renderDetails()}
      </div>
    </div>
  );
}
