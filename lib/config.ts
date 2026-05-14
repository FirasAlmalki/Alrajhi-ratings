export const ADMIN_PASSWORDS: Record<string, string> = { 'Fso': 'admin' };

export const STORE_KEYS: Record<string, string>  = { arafa:'rj_arafa', mina:'rj_mina', masaken:'rj_masaken' };
export const DATE_KEYS: Record<string, string>   = { arafa:'rj_hdate_arafa', mina:'rj_hdate_mina', masaken:'rj_hdate_masaken' };
export const PAGE_LABELS: Record<string, string> = { home:'الرئيسية', arafa:'عرفة', mina:'منى', masaken:'المساكن', upload:'الإعدادات', users:'إدارة المستخدمين', reports:'التقارير', 'manage-reports':'إدارة التقارير', 'madar_reports':'المحاضر', 'estemaarat':'الاستمارات', 'estemaarat_items_report':'تقرير عناصر الاستمارات', 'egypt_flights_makkah':'وصول رحلات مصر (جدة-مكة)', 'egypt_flights_madinah':'وصول رحلات مصر (المدينة المنورة)' };
export const PAGE_DESCS: Record<string, string>  = { masaken:'آخر تقييمات جميع المساكن', mina:'آخر تقييمات جميع مخيمات منى', arafa:'آخر تقييمات جميع مخيمات عرفة' };

export interface Phase {
  key: string;
  label: string;
  icon: string;
  desc: string;
}

export const PHASES: Phase[] = [
  { key:'arafa',   label:'عرفة',    icon:'🕌', desc:'مخيمات عرفة' },
  { key:'mina',    label:'منى',     icon:'⛺', desc:'مخيمات منى' },
  { key:'masaken', label:'المساكن', icon:'🏨', desc:'مواقع المساكن' },
];

export const PHASE_GROUPS = [
  { label: 'مرحلة الجاهزية', sections: PHASES }
];

export interface Report {
  key: string;
  label: string;
  desc: string;
  icon: string;
  file: string;
}

export const REPORTS: Report[] = [
  {
    key:   'pilgrim_heatmap',
    label: 'خريطة وصول الحجاج',
    desc:  'خريطة وصول الحجاج حسب المدينة والساعة والتاريخ',
    icon:  '🕋',
    file:  '/reports/pilgrim_heatmap.html'
  },
  {
    key:   'daily_report',
    label: 'التقرير اليومي',
    desc:  'إنشاء التقرير اليومي',
    icon:  '📋',
    file:  '/reports/daily_report.html'
  },
  {
    key:   'daily_report_list',
    label: 'سجل التقارير اليومية',
    desc:  'عرض وإدارة التقارير اليومية',
    icon:  '📁',
    file:  '/reports/daily_report_list.html'
  },
  {
    key:   'pakistan_flights',
    label: 'وصول رحلات باكستان إلى مكة المكرمة',
    desc:  'تقويم وصول حجاج باكستان إلى مكة المكرمة',
    icon:  '✈️',
    file:  '/reports/pakistan_flights.html'
  },
  {
    key:   'egypt_flights_makkah',
    label: 'وصول رحلات مصر (جدة-مكة)',
    desc:  'تقويم وصول حجاج مصر إلى مكة المكرمة',
    icon:  '✈️',
    file:  '/reports/egypt_flights_makkah.html'
  },
  {
    key:   'egypt_flights_madinah',
    label: 'وصول رحلات مصر (المدينة المنورة)',
    desc:  'تقويم وصول حجاج مصر إلى المدينة المنورة',
    icon:  '✈️',
    file:  '/reports/egypt_flights_madinah.html'
  }
];

export const MADAR: Report[] = [
  {
    key:   'madar_reports',
    label: 'المحاضر',
    desc:  'سجل المحاضر الميدانية',
    icon:  '📄',
    file:  '/reports/madar_reports.html'
  },
  {
    key:   'estemaarat',
    label: 'الاستمارات',
    desc:  'استمارات الاستقبال والزيارات والمغادرة',
    icon:  '📋',
    file:  '/reports/estemaarat.html'
  },
  {
    key:   'estemaarat_items_report',
    label: 'تقرير عناصر الاستمارات',
    desc:  'تحليل الأسئلة الأكثر حصولاً على إجابات لا',
    icon:  '📊',
    file:  '/reports/estemaarat_items_report.html'
  }
];

export const WEBHOOK_DEFAULTS: Record<string, string> = {
  mina:    'https://n8n.thelpw.com/webhook/mena',
  arafa:   'https://n8n.thelpw.com/webhook/arafa',
  masaken: 'https://n8n.thelpw.com/webhook/masaken',
  madar:   'https://n8n.thelpw.com/webhook/mahadher'
};

export const WEBHOOK_NAMES: Record<string, string> = { arafa:'عرفة', mina:'منى', masaken:'المساكن', madar:'محاضر' };
export const WH_KEY = 'rj_webhook_urls';

export function getWebhookUrl(cat: string): string {
  if (typeof window === 'undefined') return WEBHOOK_DEFAULTS[cat];
  try { 
    const s = localStorage.getItem(WH_KEY); 
    return (s ? JSON.parse(s) : {})[cat] || WEBHOOK_DEFAULTS[cat]; 
  }
  catch { return WEBHOOK_DEFAULTS[cat]; }
}

export function saveWebhookUrls(urls: Record<string, string>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WH_KEY, JSON.stringify(urls));
  }
}

export const EXPORT_COLS = [
  { key:'ph',      label:'اسم المرحلة' },
  { key:'tp',      label:'النوع' },
  { key:'raw',     label:'الموقع' },
  { key:'dateStr', label:'تاريخ آخر الزيارة' },
  { key:'q',       label:'السؤال' },
  { key:'a',       label:'الإجابة' },
];

export const DATA_VERSION = 'v4';
