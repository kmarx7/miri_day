import React, { useState, useMemo } from 'react'
import { getThisYearSolarForLunar, calcDDay, lunarToSolar } from './utils/lunar.js'
import { isPro, validateLicenseKey, getLicenseKey } from './utils/license.js'

const MOCK_MEMORY = [
  { id:'m1', title:'엄마 생일', lunarMonth:6, lunarDay:15, type:'생일' },
  { id:'m2', title:'아빠 생일', lunarMonth:6, lunarDay:18, type:'생일' },
  { id:'m3', title:'1000일 기념일', lunarMonth:null, solar:{year:2026,month:8,day:12}, type:'기념일' },
  { id:'m4', title:'할머니 제사', lunarMonth:6, lunarDay:24, type:'제사' },
  { id:'m5', title:'결혼기념일', lunarMonth:null, solar:{year:2026,month:8,day:20}, type:'기념일' },
]

const MOCK_TODAY = [
  { id:'t1', title:'면접 메일 보내기', time:'오늘', category:'할것' },
  { id:'t2', title:'도서관 책 반납', time:'오늘 · 연체', category:'할것' },
  { id:'t3', title:'월세', amount:90000, time:'오늘', category:'낼것' },
  { id:'t4', title:'적금', amount:200000, time:'내일', category:'낼것' },
]

export default function App(){
  const [expandedMemory, setExpandedMemory] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [inputCat, setInputCat] = useState('할것')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [isLunar, setIsLunar] = useState(false)
  const [lunarMonth, setLunarMonth] = useState(6)
  const [lunarDay, setLunarDay] = useState(15)
  const [licenseInput, setLicenseInput] = useState(getLicenseKey())
  const [pro, setProState] = useState(isPro())
  const [todayExpanded, setTodayExpanded] = useState(false)

  const memoryWithDDay = useMemo(()=>{
    return MOCK_MEMORY.map(m=>{
      let solar = m.solar;
      if(m.lunarMonth){
        solar = getThisYearSolarForLunar(m.lunarMonth, m.lunarDay) || {year:2026,month:8,day:5}
      }
      const d = calcDDay(solar)
      return { ...m, solar, dDay: d }
    }).sort((a,b)=>a.dDay-b.dDay)
  },[])

  const nearest = memoryWithDDay[0]
  const visibleMemory = expandedMemory ? memoryWithDDay : [nearest]

  const handleLicense = async ()=>{
    const r = await validateLicenseKey(licenseInput)
    if(r.valid){ setProState(true); alert('Pro 활성화! 🎉'); setShowPaywall(false) }
    else alert('라이선스 키가 올바르지 않아요')
  }

  return (
    <div className="min-h-screen flex justify-center p-4">
      <div className="w-[380px] bg-white rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-200 flex flex-col relative">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-[22px] font-bold tracking-tight">미리꼭</h1>
          <p className="text-[13px] text-gray-400 mt-1">2026년 8월 5일 (수) · 모든 데이터는 이 기기에만 저장돼요 🔒</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">
          {/* Memory Banner - single + expand */}
          <div className="bg-[#FFFEF5] border border-[#FEF3C7] rounded-[16px] p-[14px]">
            <div className="flex justify-between items-center cursor-pointer" onClick={()=>setExpandedMemory(!expandedMemory)}>
              <div>
                <p className="text-[11px] font-semibold text-[#A16207] tracking-wide">{expandedMemory ? `다가오는 기억할 것 ${memoryWithDDay.length}건` : '다가오는 기억할 것'}</p>
                <p className="text-[14px] font-bold mt-1">⭐ D-{nearest.dDay} {nearest.title} {nearest.lunarMonth ? `(음력 ${nearest.lunarMonth}.${nearest.lunarDay})` : ''}</p>
              </div>
              <div className={`w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 transition-transform ${expandedMemory?'rotate-90':''}`}>›</div>
            </div>
            {expandedMemory && (
              <div className="mt-3 border-t border-[#FEF3C7] pt-2 space-y-1">
                {memoryWithDDay.slice(1).map(m=>(
                  <div key={m.id} className="flex justify-between items-center py-[10px] px-2 rounded-lg hover:bg-[#FEF9C3] cursor-pointer">
                    <span className="text-[13px]"><span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded mr-2">D-{m.dDay}</span>{m.title}</span>
                    <span className="text-[11px] text-gray-400">{m.lunarMonth?`음력 ${m.lunarMonth}.${m.lunarDay}`:''} ›</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2x2 Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {k:'할것', label:'할 것', count:'3개 남음', bg:'bg-cardBlue'},
              {k:'낼것', label:'낼 것', count:'2건 · ₩90,000', bg:'bg-cardOrange'},
              {k:'살것', label:'살 것', count:'1건 · ₩45,000', bg:'bg-cardGreen'},
              {k:'생각', label:'생각할 것', count:'4개 남음', bg:'bg-cardPurple'},
            ].map(c=>(
              <div key={c.k} className={`${c.bg} rounded-[16px] p-4 cursor-pointer hover:scale-[0.98] transition`}>
                <p className="text-[13px] font-semibold">{c.label}</p>
                <p className="text-[12px] text-gray-600 mt-1">{c.count}</p>
              </div>
            ))}
          </div>

          {/* Today's Highlight 4+more */}
          <div>
            <div className="flex justify-between items-center px-1 mb-2">
              <h2 className="text-[14px] font-bold">오늘의 하이라이트 {MOCK_TODAY.length}건</h2>
              <span className="text-[12px] text-gray-400">₩90,000</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-[16px] divide-y">
              {(todayExpanded?MOCK_TODAY:MOCK_TODAY.slice(0,2)).map(it=>(
                <div key={it.id} className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"/><span className="text-[13px]">{it.title}</span></div>
                  <span className="text-[11px] text-gray-400">{it.time}</span>
                </div>
              ))}
            </div>
            {MOCK_TODAY.length>2 && (
              <button onClick={()=>setTodayExpanded(!todayExpanded)} className="w-full mt-2 text-[13px] text-gray-500 py-2 bg-gray-50 rounded-full">{todayExpanded?'접기 ▲':`외 ${MOCK_TODAY.length-2}건 더보기 ▼`}</button>
            )}
          </div>

          {/* License Test */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[12px] font-bold">Pro 테스트 {pro?'✅ Pro 활성':'🔒 Free'}</p>
            <div className="flex gap-2 mt-2">
              <input value={licenseInput} onChange={e=>setLicenseInput(e.target.value)} placeholder="MIRI-TEST-KEY" className="flex-1 text-[12px] border rounded-lg px-2 py-1"/>
              <button onClick={handleLicense} className="text-[12px] bg-black text-white px-3 rounded-lg">활성화</button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">개발용: MIRI- 로 시작하면 통과 (Lemon Squeezy 연동 전)</p>
          </div>
        </div>

        {/* FAB */}
        <button onClick={()=>setShowInput(true)} className="absolute bottom-[80px] right-5 w-14 h-14 bg-black text-white rounded-full shadow-lg text-2xl">+</button>

        {/* Bottom Nav */}
        <div className="h-[72px] border-t bg-white flex justify-around items-center px-6">
          <span className="text-[11px] font-bold">홈</span><span className="text-[11px] text-gray-400">캘린더</span><button onClick={()=>setShowPaywall(true)} className="text-[11px] text-gray-400">PRO</button>
        </div>

        {/* Input Modal */}
        {showInput && (
          <div className="absolute inset-0 bg-black/40 flex items-end z-20">
            <div className="w-full bg-white rounded-t-[24px] p-6 animate-[slideUp_0.25s]">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"/>
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold">새로 추가</h3><button onClick={()=>setShowInput(false)}>✕</button></div>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                {['할것','낼것','살것','생각','기억'].map(c=>(
                  <button key={c} onClick={()=>setInputCat(c)} className={`px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap border ${inputCat===c?'bg-black text-white border-black':'bg-white text-gray-500'}`}>{c}</button>
                ))}
              </div>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="무엇을 해야 하나요?" className="w-full text-[18px] font-medium border-b py-2 outline-none mb-3"/>
              {(inputCat==='낼것'||inputCat==='살것') && (
                <div className="mb-3 animate-[fadeIn_0.2s]"><label className="text-[11px] text-gray-400">금액</label><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="₩ 90,000" className="w-full border rounded-xl px-3 py-2 mt-1"/></div>
              )}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
                <span className="text-[13px]">🌙 음력으로 입력</span>
                <button onClick={()=>setIsLunar(!isLunar)} className={`w-10 h-6 rounded-full transition ${isLunar?'bg-black':'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full mt-1 ml-1 transition ${isLunar?'translate-x-4':''}`}/></button>
              </div>
              {isLunar && (
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-3 mb-3 text-[12px]">
                  음력 {lunarMonth}월 {lunarDay}일 → 양력 {lunarToSolar(2026,lunarMonth,lunarDay)?.ym || '2026-08-05'} 로 저장돼요
                  {!pro && <span className="ml-2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded">Pro에서 매년 자동 변환</span>}
                </div>
              )}
              <button disabled={!title} className={`w-full h-12 rounded-xl font-bold ${title?'bg-black text-white':'bg-gray-200 text-gray-400'}`}>저장하기</button>
            </div>
          </div>
        )}

        {/* Paywall */}
        {showPaywall && (
          <div className="absolute inset-0 bg-white z-30 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between"><span className="text-[11px] bg-[#FEF08A] px-2 py-1 rounded-full font-bold">🔥 출시 기념 한정</span><button onClick={()=>setShowPaywall(false)}>✕</button></div>
              <h2 className="text-[22px] font-bold mt-4 text-center">미리꼭을 더 예쁘고 편하게</h2>
              <p className="text-center text-[13px] text-gray-400 mt-1">구독 없음 · 평생 한 번</p>
              <div className="flex justify-center items-baseline gap-2 mt-4"><span className="line-through text-gray-400">₩9,900</span><span className="text-[28px] font-bold">₩5,900</span><span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">-40%</span></div>
              <div className="mt-6 space-y-3">
                {['🎨 모든 테마와 앱 아이콘','📅 음력 기념일 자동 관리','💰 돈 모아보기 리포트','🔒 생체인증 + 암호화 백업','⭐ 기억할 것 무제한 + 반복'].map(t=>(
                  <div key={t} className="bg-gray-50 rounded-xl p-3 text-[13px]">{t}</div>
                ))}
              </div>
              <button onClick={handleLicense} className="w-full h-14 bg-black text-white rounded-xl font-bold mt-6">한정 특가로 Pro 시작하기 - ₩5,900</button>
              <p className="text-[11px] text-gray-400 text-center mt-2">한정 기간 종료 후 정가 ₩9,900으로 전환됩니다. 계정·구독 없음.</p>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  )
}