/**
 * 관광지 카테고리 매핑 상수
 */

// 관광지 카테고리 코드 매핑
export const TOURIST_ATTRACTION_CATEGORY_MAP = {
  // 한국관광공사 API 기본 카테고리
  'AC': '숙박',
  'C01': '추천코스',
  'EV': '축제/공연/행사',
  'EX': '체험관광',
  'FD': '음식',
  'HS': '역사관광',
  'LS': '레저스포츠',
  'NA': '자연관광',
  'SH': '쇼핑',
  'VE': '문화관광',
  
  // 추가 호환성을 위한 매핑
  'A01': '자연관광',
  'A02': '문화관광',
  'A03': '레저스포츠',
  'A04': '쇼핑',
  'A05': '음식',
  'B01': '숙박',
  'B02': '축제/공연/행사',
  'C02': '가족코스',
  'C03': '나홀로코스',
  'C04': '커플코스',
  'C05': '친구코스',
}

// 카테고리 코드별 색상 매핑
export const CATEGORY_COLOR_MAP = {
  'AC': 'bg-blue-100 text-blue-800',
  'C01': 'bg-purple-100 text-purple-800',
  'EV': 'bg-pink-100 text-pink-800',
  'EX': 'bg-orange-100 text-orange-800',
  'FD': 'bg-yellow-100 text-yellow-800',
  'HS': 'bg-red-100 text-red-800',
  'LS': 'bg-green-100 text-green-800',
  'NA': 'bg-emerald-100 text-emerald-800',
  'SH': 'bg-indigo-100 text-indigo-800',
  'VE': 'bg-violet-100 text-violet-800',
  
  // 기본 색상
  'default': 'bg-gray-100 text-gray-800'
}

// 카테고리 아이콘 매핑
export const CATEGORY_ICON_MAP = {
  'AC': '🏨',
  'C01': '🗺️',
  'EV': '🎭',
  'EX': '🎯',
  'FD': '🍽️',
  'HS': '🏛️',
  'LS': '⚽',
  'NA': '🌿',
  'SH': '🛍️',
  'VE': '🎨',
}

// 카테고리 설명
export const CATEGORY_DESCRIPTION_MAP = {
  'AC': '호텔, 펜션, 민박 등 숙박시설',
  'C01': '추천 여행 코스 및 루트',
  'EV': '축제, 공연, 각종 이벤트',
  'EX': '체험활동 및 프로그램',
  'FD': '음식점, 카페, 맛집',
  'HS': '역사적 장소 및 문화재',
  'LS': '스포츠 및 레크리에이션',
  'NA': '자연 경관 및 관광지',
  'SH': '쇼핑몰, 시장, 상점',
  'VE': '박물관, 미술관, 문화시설',
}

// 카테고리 이름 조회 함수
export const getCategoryName = (categoryCode) => {
  return TOURIST_ATTRACTION_CATEGORY_MAP[categoryCode] || categoryCode || '미분류'
}

// 카테고리 색상 조회 함수
export const getCategoryColor = (categoryCode) => {
  return CATEGORY_COLOR_MAP[categoryCode] || CATEGORY_COLOR_MAP.default
}

// 카테고리 아이콘 조회 함수
export const getCategoryIcon = (categoryCode) => {
  return CATEGORY_ICON_MAP[categoryCode] || '📍'
}

// 카테고리 설명 조회 함수
export const getCategoryDescription = (categoryCode) => {
  return CATEGORY_DESCRIPTION_MAP[categoryCode] || '카테고리 설명 없음'
}

// 카테고리 옵션 배열 (셀렉트 박스용)
export const CATEGORY_OPTIONS = Object.entries(TOURIST_ATTRACTION_CATEGORY_MAP).map(([code, name]) => ({
  value: code,
  label: name,
  icon: CATEGORY_ICON_MAP[code],
  description: CATEGORY_DESCRIPTION_MAP[code],
  color: CATEGORY_COLOR_MAP[code]
}))

// 주요 카테고리만 추출 (빈도 기준)
export const MAIN_CATEGORY_OPTIONS = [
  { value: 'SH', label: '쇼핑', icon: '🛍️' },
  { value: 'VE', label: '문화관광', icon: '🎨' },
  { value: 'HS', label: '역사관광', icon: '🏛️' },
  { value: 'NA', label: '자연관광', icon: '🌿' },
  { value: 'EX', label: '체험관광', icon: '🎯' },
  { value: 'C01', label: '추천코스', icon: '🗺️' },
  { value: 'AC', label: '숙박', icon: '🏨' },
  { value: 'LS', label: '레저스포츠', icon: '⚽' },
]