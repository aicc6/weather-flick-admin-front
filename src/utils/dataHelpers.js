/**
 * 데이터 헬퍼 유틸리티
 */

/**
 * 값이 비어있는지 확인
 * @param {*} value - 확인할 값
 * @returns {boolean} 비어있으면 true
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

/**
 * 테이블에 표시할 값 포맷
 * @param {*} value - 포맷할 값
 * @param {string} defaultValue - 기본값
 * @returns {string} 포맷된 값
 */
export const formatTableValue = (value, defaultValue = '-') => {
  if (isEmpty(value)) return defaultValue
  return value
}

/**
 * 주소 표시 포맷
 * @param {string} address - 주소
 * @returns {string} 포맷된 주소
 */
export const formatAddress = (address) => {
  if (!address || address.trim() === '') return '-'
  // 너무 긴 주소는 축약
  if (address.length > 50) {
    return address.substring(0, 47) + '...'
  }
  return address
}

/**
 * 날짜 포맷
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷된 날짜
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul',
    }).format(date)
  } catch {
    return '-'
  }
}

/**
 * 전화번호 포맷
 * @param {string} tel - 전화번호
 * @returns {string} 포맷된 전화번호
 */
export const formatTel = (tel) => {
  if (!tel || tel.trim() === '') return '-'
  // 하이픈이 없는 번호에 하이픈 추가
  const cleaned = tel.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  return tel
}