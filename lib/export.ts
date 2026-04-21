import * as XLSX from 'xlsx-js-style';
import { EXPORT_COLS, PAGE_LABELS } from './config';

function isHafrQ(q: string) { return q.includes('أعمال حفر أمام البوابة'); }

// Returns true if this item should appear in the exported "failed items" list
function isItemFailed(item: any, page: string) {
  if (page === 'arafa' || page === 'mina') {
    if (isHafrQ(item.q)) return item.a === 'نعم'; // حفر معكوس
    return item.a === 'لا';
  }
  // مساكن: سؤال الفتح يُستثنى، معتمرين/نزلاء: نعم = سلبي، باقي: لا = سلبي
  if (item.q.includes('مقر السكن مفتوح')) return item.a === 'لا'; // مغلق = سلبي
  if (item.q.includes('معتمرين') || item.q.includes('نزلاء في مقر السكن')) return item.a === 'نعم';
  return item.a === 'لا';
}

export function doExport(page: string, data: any, selectedCols: string[], filters: Set<string> | null) {
  if (!data || !data.locations) return;
  const selCols = EXPORT_COLS.filter(c => selectedCols.includes(c.key));
  if (!selCols.length) return;

  const filteredLocs = data.locations.filter((l: any) => !filters || filters.has(l.key));

  // مساكن: جميع البنود — غيرها: البنود السلبية فقط
  const exportAll = page === 'masaken';
  const rows: any[][] = [selCols.map(c => c.label)];
  for (const loc of filteredLocs) {
    for (const item of (loc.allItems || [])) {
      if (!exportAll && !isItemFailed(item, page)) continue;
      rows.push(selCols.map(c => item[c.key] || ''));
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');

  // Al Rajhi brand styles
  const S_HEADER = {
    font: { bold:true, color:{ rgb:'F5F0E8' }, sz:12, name:'Arial' },
    fill: { patternType:'solid', fgColor:{ rgb:'0C2550' } },
    alignment: { horizontal:'center', vertical:'center', wrapText:true, readingOrder:2 },
    border: {
      top:    { style:'thin',   color:{ rgb:'C9A84C' } },
      bottom: { style:'medium', color:{ rgb:'C9A84C' } },
      left:   { style:'thin',   color:{ rgb:'C9A84C' } },
      right:  { style:'thin',   color:{ rgb:'C9A84C' } }
    }
  };
  const S_ODD = {
    font: { sz:11, color:{ rgb:'1B2535' }, name:'Arial' },
    fill: { patternType:'solid', fgColor:{ rgb:'FFFFFF' } },
    alignment: { vertical:'center', wrapText:true, readingOrder:2 },
    border: { bottom:{ style:'thin', color:{ rgb:'D9E2EE' } }, left:{ style:'thin', color:{ rgb:'D9E2EE' } }, right:{ style:'thin', color:{ rgb:'D9E2EE' } } }
  };
  const S_EVEN = {
    font: { sz:11, color:{ rgb:'1B2535' }, name:'Arial' },
    fill: { patternType:'solid', fgColor:{ rgb:'E8EDF7' } },
    alignment: { vertical:'center', wrapText:true, readingOrder:2 },
    border: { bottom:{ style:'thin', color:{ rgb:'D9E2EE' } }, left:{ style:'thin', color:{ rgb:'D9E2EE' } }, right:{ style:'thin', color:{ rgb:'D9E2EE' } } }
  };
  // Answer column highlight: نعم = green, لا = red
  const answerColIdx = selCols.findIndex(c => c.key === 'a');
  const S_YES   = { ...S_ODD,  font: { ...S_ODD.font,  bold:true, color:{ rgb:'1E6B47' } }, fill: { patternType:'solid', fgColor:{ rgb:'D6F0E4' } } };
  const S_NO    = { ...S_ODD,  font: { ...S_ODD.font,  bold:true, color:{ rgb:'8B1A1A' } }, fill: { patternType:'solid', fgColor:{ rgb:'FAE0E0' } } };
  const S_YES_E = { ...S_EVEN, font: { ...S_EVEN.font, bold:true, color:{ rgb:'1E6B47' } }, fill: { patternType:'solid', fgColor:{ rgb:'C4EDD6' } } };
  const S_NO_E  = { ...S_EVEN, font: { ...S_EVEN.font, bold:true, color:{ rgb:'8B1A1A' } }, fill: { patternType:'solid', fgColor:{ rgb:'F5CECD' } } };

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      if (R === 0) {
        ws[addr].s = S_HEADER;
      } else {
        const isEven = R % 2 === 0, cellVal = String(ws[addr].v || '');
        if (C === answerColIdx && answerColIdx >= 0) {
          ws[addr].s = cellVal === 'نعم' ? (isEven ? S_YES_E : S_YES) : cellVal === 'لا' ? (isEven ? S_NO_E : S_NO) : (isEven ? S_EVEN : S_ODD);
        } else {
          ws[addr].s = isEven ? S_EVEN : S_ODD;
        }
      }
    }
  }

  ws['!rows'] = [{ hpt: 28 }];
  for (let i = 1; i <= range.e.r; i++) ws['!rows'].push({ hpt: 20 });
  ws['!cols'] = selCols.map(c => ({ wch: c.key === 'q' ? 52 : c.key === 'raw' ? 38 : c.key === 'dateStr' ? 18 : 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, PAGE_LABELS[page] || 'تصدير');
  const fname = `تقييم_${PAGE_LABELS[page] || page}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fname);
}
