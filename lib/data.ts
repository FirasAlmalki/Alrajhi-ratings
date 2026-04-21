import { getWebhookUrl } from './config';

export function extractKey(rawStr: string, category: string): string {
  const parts = rawStr.split('|').map(p => p.trim()).filter(Boolean);
  if (category === 'masaken' && parts.length >= 3) return parts[2];
  return parts[0];
}

export function extractDisplay(rawStr: string, category: string): { name: string, sub: string } {
  const parts = rawStr.split('|').map(p => p.trim()).filter(Boolean);
  if (category === 'masaken') {
    return { name: parts[0] || '', sub: parts.length >= 2 ? `${parts[1]}${parts[2] ? ' · ' + parts[2] : ''}` : '' };
  }
  return { name: parts[0] || '', sub: '' };
}

// Question where لا = good (reversed logic for حفر)
const HAFR_Q = 'هل توجد أي أعمال حفر أمام البوابة الرئيسية ؟';
function isHafrQ(q: string) { return q.includes('أعمال حفر أمام البوابة'); }

export async function loadFromGSheet(category: string) {
  const url = getWebhookUrl(category);
  if (!url) throw new Error('لا يوجد webhook لهذا القسم');
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('فشل الاتصال');
  const rows = await resp.json();
  return processGSheetRows(rows, category);
}

export function processGSheetRows(rows: any[], category: string) {
  const locMap: Record<string, any> = {};
  rows.forEach(r => {
    const raw = String(r['الموقع'] || '').trim(), q = String(r['السؤال'] || '').trim(), a = String(r['الاجابة'] || '').trim();
    if (!raw || !q) return;
    const key = extractKey(raw, category);
    const dateDisplay = String(r['تاريخ اخر الزيارة'] || '').trim();
    const dm = dateDisplay.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const dateSort = dm ? `${dm[3]}-${dm[1].padStart(2, '0')}-${dm[2].padStart(2, '0')}` : ''; // M/D/YYYY → YYYY-MM-DD
    
    if (!locMap[key]) { 
      const { name, sub } = extractDisplay(raw, category); 
      locMap[key] = { key, name, sub, items: [], dateEntries: [] }; 
    }
    
    locMap[key].items.push({ ph: String(r['اسم المرحلة'] || ''), tp: String(r['النوع'] || ''), raw, dateStr: dateDisplay, q, a });
    if (dateSort) locMap[key].dateEntries.push({ sort: dateSort, display: dateDisplay });
  });

  const locations = [];
  for (const loc of Object.values(locMap)) {
    const items = loc.items, total = items.length;
    const maxEntry = loc.dateEntries.reduce((b: any, e: any) => (!b || e.sort > b.sort) ? e : b, null);
    let pct = 0, failedList: string[] = [], isClosed = false, isWrongLocation = false;

    if (category === 'masaken') {
      const isOpenQ     = (q: string) => q.includes('مقر السكن مفتوح');
      const isGuestQ    = (q: string) => q.includes('معتمرين') || q.includes('نزلاء في مقر السكن');
      const isLocationQ = (q: string) => q.includes('موقع السكن صحيح');
      
      const hasOpenQuestion = items.some((x: any) => isOpenQ(x.q));
      isClosed         = hasOpenQuestion && items.some((x: any) => isOpenQ(x.q) && x.a === 'لا');
      isWrongLocation  = items.some((x: any) => isLocationQ(x.q) && x.a === 'لا');
      const hasGuests  = items.some((x: any) => isGuestQ(x.q) && x.a === 'نعم');
      const other      = items.filter((x: any) => !isOpenQ(x.q) && !isGuestQ(x.q));
      
      if (isClosed || isWrongLocation) pct = 0;
      else if (hasGuests) pct = 0;   // معتمرين = صفر (سلبي)
      else pct = other.length > 0 ? other.filter((x: any) => x.a === 'نعم').length / other.length : 0;
      
      failedList = other.filter((x: any) => x.a === 'لا').map((x: any) => x.q);
    } else {
      // عرفة / منى: حفر معكوس — لا = جيد
      if (total > 0) {
        const c = items.filter((x: any) => (x.a === 'نعم' && !isHafrQ(x.q)) || (x.a === 'لا' && isHafrQ(x.q))).length;
        pct = c / total;
      }
      failedList = items.filter((x: any) => (x.a === 'لا' && !isHafrQ(x.q)) || (x.a === 'نعم' && isHafrQ(x.q))).map((x: any) => x.q);
    }
    
    const hasGuests = category === 'masaken'
      ? loc.items.some((x: any) => (x.q.includes('معتمرين') || x.q.includes('نزلاء في مقر السكن')) && x.a === 'نعم')
      : false;
      
    locations.push({
      key: loc.key, name: loc.name, sub: loc.sub,
      pct, totalItems: total, failedList, isClosed, isWrongLocation, hasGuests,
      date: maxEntry?.sort || null, dateDisplay: maxEntry?.display || '',
      allItems: loc.items
    });
  }
  
  return { locations, maxDate: null };
}
