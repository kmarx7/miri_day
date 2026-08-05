const LS_KEY = 'mirikkok_pro';
const LICENSE_KEY = 'mirikkok_license';

// 로컬 Pro 상태
export function isPro(){ return localStorage.getItem(LS_KEY) === 'true'; }
export function setPro(v){ localStorage.setItem(LS_KEY, v ? 'true':'false'); }
export function getLicenseKey(){ return localStorage.getItem(LICENSE_KEY) || ''; }

// Lemon Squeezy 라이선스 검증 (실제 API)
// 실제 운영시엔 서버에서 검증해야 하지만, PWA MVP는 클라이언트 검증 + 목업 허용
export async function validateLicenseKey(key){
  if(!key) return { valid: false };
  // 목업: MIRI로 시작하면 통과 (개발용)
  if(key.startsWith('MIRI-') || key.startsWith('TEST-')){
    setPro(true);
    localStorage.setItem(LICENSE_KEY, key);
    return { valid: true, mock: true };
  }
  try{
    const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ license_key: key })
    });
    const data = await res.json();
    const valid = data.valid === true;
    if(valid){
      setPro(true);
      localStorage.setItem(LICENSE_KEY, key);
    }
    return { valid, data };
  }catch(e){
    console.error(e);
    return { valid: false, error: e.message };
  }
}

export function removePro(){
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LICENSE_KEY);
}