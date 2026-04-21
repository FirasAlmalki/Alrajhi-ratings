const SB_URL = 'https://ectajbmqxucrrbyymbbp.supabase.co';
const SB_KEY = 'sb_publishable_MZfGz7I6NLLR95_DRcM_zQ_zsH8JRSn';

export async function sbReq(path: string, opts: any = {}) {
  const { method = 'GET', body, prefer } = opts;
  const h: any = { 
    'apikey': SB_KEY, 
    'Authorization': 'Bearer ' + SB_KEY, 
    'Content-Type': 'application/json' 
  };
  if (prefer) h['Prefer'] = prefer;
  
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { 
    method, 
    headers: h, 
    body: body ? JSON.stringify(body) : undefined 
  });
  
  if (method === 'DELETE' || prefer === 'return=minimal') return;
  
  if (!r.ok) {
    throw new Error(`Supabase request failed: ${r.statusText}`);
  }
  
  return r.json();
}

export const sbGetAccounts = () => sbReq('accounts?select=*&order=created_at.asc');
export const sbAddAccount = (n: string, pw: string, perms: any) => sbReq('accounts', { method:'POST', prefer:'return=minimal', body:{ name:n, password:pw, permissions:perms } });
export const sbUpdatePerms = (id: string | number, perms: any) => sbReq(`accounts?id=eq.${id}`, { method:'PATCH', prefer:'return=minimal', body:{ permissions:perms } });
export const sbDeleteAccount = (id: string | number) => sbReq(`accounts?id=eq.${id}`, { method:'DELETE' });
