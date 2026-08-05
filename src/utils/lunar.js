import { Lunar, Solar } from 'lunar-javascript'

// 음력 -> 양력 변환
export function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap=false){
  try{
    const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
    if(isLeap) {
      // 윤달 처리 필요시
    }
    const solar = lunar.getSolar();
    return { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay(), ym: solar.toYmd() };
  }catch(e){
    console.error(e); return null;
  }
}

// 매년 음력 기념일의 올해 양력 구하기 (D-Day용)
export function getThisYearSolarForLunar(lunarMonth, lunarDay){
  const now = new Date();
  let year = now.getFullYear();
  let result = lunarToSolar(year, lunarMonth, lunarDay);
  // 이미 지났으면 내년으로
  if(result){
    const d = new Date(result.year, result.month-1, result.day);
    if(d < now){
      const next = lunarToSolar(year+1, lunarMonth, lunarDay);
      return next;
    }
  }
  return result;
}

// D-Day 계산
export function calcDDay(solarYmd){
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(solarYmd.year, solarYmd.month-1, solarYmd.day);
  const diff = Math.ceil((target - today)/ (1000*60*60*24));
  return diff;
}