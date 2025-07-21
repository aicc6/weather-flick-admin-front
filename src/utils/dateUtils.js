/**
 * 관리자 대시보드용 날짜/시간 포맷팅 유틸리티
 * 모든 시간 정보를 한국 시간(Asia/Seoul)으로 일관되게 표시
 */

// 한국 시간대 상수
const KST_TIMEZONE = 'Asia/Seoul';
const KO_LOCALE = 'ko-KR';

/**
 * 관리자 대시보드용 기본 날짜 포맷 (기존 dataHelpers.js 대체)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜 문자열 (YYYY-MM-DD)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: KST_TIMEZONE,
    }).format(date);
  } catch (error) {
    console.warn('날짜 형식 오류:', dateString, error);
    return '-';
  }
};

/**
 * 관리자 대시보드용 날짜시간 포맷
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @param {boolean} includeSeconds - 초 포함 여부
 * @returns {string} 포맷된 날짜시간 문자열
 */
export const formatDateTime = (dateString, includeSeconds = false) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: KST_TIMEZONE,
    };
    
    if (includeSeconds) {
      options.second = '2-digit';
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, options).format(date);
  } catch (error) {
    console.warn('날짜시간 형식 오류:', dateString, error);
    return '-';
  }
};

/**
 * 배치 작업용 날짜시간 포맷 (기존 batch-management.jsx 포맷 대체)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜시간 문자열
 */
export const formatBatchDateTime = (dateString) => {
  if (!dateString) return '데이터 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: KST_TIMEZONE,
    }).format(date);
  } catch (error) {
    console.warn('배치 날짜시간 형식 오류:', dateString, error);
    return '오류';
  }
};

/**
 * 사용자 상세 정보용 날짜 포맷 (기존 UserDetail.jsx 포맷 대체)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜시간 문자열
 */
export const formatUserDetailDate = (dateString) => {
  if (!dateString) return '정보 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: KST_TIMEZONE,
    }).format(date);
  } catch (error) {
    console.warn('사용자 상세 날짜 형식 오류:', dateString, error);
    return '정보 없음';
  }
};

/**
 * 날씨 데이터용 날짜시간 포맷
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜시간 문자열
 */
export const formatWeatherDateTime = (dateString) => {
  if (!dateString) return '데이터 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    const day = date.toLocaleDateString(KO_LOCALE, {
      day: 'numeric',
      timeZone: KST_TIMEZONE
    });
    
    const time = date.toLocaleTimeString(KO_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: KST_TIMEZONE
    });
    
    return `${day}일 ${time}`;
  } catch (error) {
    console.warn('날씨 날짜시간 형식 오류:', dateString, error);
    return '데이터 없음';
  }
};

/**
 * 관리자 로그인 시간 포맷
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 로그인 시간
 */
export const formatLoginTime = (dateString) => {
  if (!dateString) return '로그인 기록 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: KST_TIMEZONE,
    }).format(date);
  } catch (error) {
    console.warn('로그인 시간 형식 오류:', dateString, error);
    return '형식 오류';
  }
};

/**
 * 상대적 시간 표시 (관리자용)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 상대적 시간 문자열
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '시간 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    console.warn('상대적 시간 형식 오류:', dateString, error);
    return '형식 오류';
  }
};

/**
 * 현재 한국 시간의 타임스탬프를 반환
 * @returns {string} 한국 시간 기준 타임스탬프
 */
export const getCurrentTimestamp = () => {
  return new Date().toLocaleTimeString(KO_LOCALE, {
    timeZone: KST_TIMEZONE,
    hour12: false
  });
};

/**
 * 관리자 대시보드용 통계 기간 포맷
 * @param {string} startDate - 시작일
 * @param {string} endDate - 종료일
 * @returns {string} 포맷된 기간 문자열
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '기간 설정 없음';
  
  try {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    if (start === end) {
      return start;
    }
    
    return `${start} ~ ${end}`;
  } catch (error) {
    console.warn('기간 형식 오류:', startDate, endDate, error);
    return '기간 형식 오류';
  }
};

/**
 * API 응답 시간 데이터를 안전하게 파싱
 * @param {string} dateString - API에서 받은 날짜 문자열
 * @returns {Date|null} 파싱된 Date 객체 또는 null
 */
export const safeParseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date;
  } catch (error) {
    console.warn('날짜 파싱 오류:', dateString, error);
    return null;
  }
};

// 기본 내보내기
export default {
  formatDate,
  formatDateTime,
  formatBatchDateTime,
  formatUserDetailDate,
  formatWeatherDateTime,
  formatLoginTime,
  formatRelativeTime,
  getCurrentTimestamp,
  formatDateRange,
  safeParseDate
};