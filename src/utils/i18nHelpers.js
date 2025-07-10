/**
 * i18n 관련 헬퍼 함수들
 * API 응답, 오류 메시지, 날짜/시간 포맷팅 등의 다국어 처리
 */

import { getCurrentLanguage, hasTranslation } from '../i18n/config'

/**
 * API 오류 메시지를 다국어로 변환
 * @param {string} errorCode - 오류 코드
 * @param {string} defaultMessage - 기본 메시지
 * @param {Function} t - 번역 함수
 * @returns {string} 번역된 오류 메시지
 */
export const translateError = (errorCode, defaultMessage, t) => {
  const errorKey = `errors.${errorCode}`

  if (hasTranslation(errorKey)) {
    return t(errorKey)
  }

  // 일반적인 HTTP 상태 코드 처리
  const httpErrors = {
    400: 'messages.validation_error',
    401: 'messages.unauthorized',
    403: 'messages.forbidden',
    404: 'messages.not_found',
    500: 'messages.server_error',
    503: 'messages.maintenance',
  }

  if (httpErrors[errorCode] && hasTranslation(httpErrors[errorCode])) {
    return t(httpErrors[errorCode])
  }

  return defaultMessage || t('messages.unknown_error')
}

/**
 * API 성공 메시지를 다국어로 변환
 * @param {string} action - 액션 타입 (create, update, delete 등)
 * @param {string} resource - 리소스 타입 (user, travel 등)
 * @param {Function} t - 번역 함수
 * @returns {string} 번역된 성공 메시지
 */
export const translateSuccess = (action, resource, t) => {
  const successKey = `messages.${action}_success`

  if (hasTranslation(successKey)) {
    return t(successKey)
  }

  // 리소스별 메시지 처리
  const resourceKey = `${resource}.${action}_success`
  if (hasTranslation(resourceKey)) {
    return t(resourceKey)
  }

  return t('messages.operation_success')
}

/**
 * 날짜를 현재 언어에 맞게 포맷팅
 * @param {Date|string} date - 날짜
 * @param {Object} options - Intl.DateTimeFormat 옵션
 * @returns {string} 포맷된 날짜
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''

  const currentLang = getCurrentLanguage()
  const dateObj = date instanceof Date ? date : new Date(date)

  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  return new Intl.DateTimeFormat(currentLang, {
    ...defaultOptions,
    ...options,
  }).format(dateObj)
}

/**
 * 날짜와 시간을 현재 언어에 맞게 포맷팅
 * @param {Date|string} datetime - 날짜시간
 * @param {Object} options - Intl.DateTimeFormat 옵션
 * @returns {string} 포맷된 날짜시간
 */
export const formatDateTime = (datetime, options = {}) => {
  if (!datetime) return ''

  const currentLang = getCurrentLanguage()
  const dateObj = datetime instanceof Date ? datetime : new Date(datetime)

  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }

  return new Intl.DateTimeFormat(currentLang, {
    ...defaultOptions,
    ...options,
  }).format(dateObj)
}

/**
 * 숫자를 현재 언어에 맞게 포맷팅
 * @param {number} number - 숫자
 * @param {Object} options - Intl.NumberFormat 옵션
 * @returns {string} 포맷된 숫자
 */
export const formatNumber = (number, options = {}) => {
  if (typeof number !== 'number') return number

  const currentLang = getCurrentLanguage()
  return new Intl.NumberFormat(currentLang, options).format(number)
}

/**
 * 통화를 현재 언어에 맞게 포맷팅
 * @param {number} amount - 금액
 * @param {string} currency - 통화 코드 (기본: KRW)
 * @param {Object} options - Intl.NumberFormat 옵션
 * @returns {string} 포맷된 통화
 */
export const formatCurrency = (amount, currency = 'KRW', options = {}) => {
  if (typeof amount !== 'number') return amount

  const currentLang = getCurrentLanguage()
  const defaultOptions = {
    style: 'currency',
    currency: currency,
  }

  return new Intl.NumberFormat(currentLang, {
    ...defaultOptions,
    ...options,
  }).format(amount)
}

/**
 * 상대 시간을 현재 언어에 맞게 포맷팅
 * @param {Date|string} date - 날짜
 * @param {Function} t - 번역 함수
 * @returns {string} 상대 시간
 */
export const formatRelativeTime = (date, t) => {
  if (!date) return ''

  const now = new Date()
  const dateObj = date instanceof Date ? date : new Date(date)
  const diffMs = now - dateObj
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) {
    return t('time.just_now')
  } else if (diffMinutes < 60) {
    return t('time.minutes_ago', { count: diffMinutes })
  } else if (diffHours < 24) {
    return t('time.hours_ago', { count: diffHours })
  } else if (diffDays < 7) {
    return t('time.days_ago', { count: diffDays })
  } else {
    return formatDate(dateObj)
  }
}

/**
 * 파일 크기를 현재 언어에 맞게 포맷팅
 * @param {number} bytes - 바이트 수
 * @param {Function} t - 번역 함수
 * @returns {string} 포맷된 파일 크기
 */
export const formatFileSize = (bytes, _t) => {
  if (typeof bytes !== 'number') return ''

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  const formattedSize = formatNumber(size, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  })

  return `${formattedSize} ${units[unitIndex]}`
}

/**
 * 페이지네이션 정보를 다국어로 포맷팅
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 * @param {number} totalItems - 전체 아이템 수
 * @param {number} itemsPerPage - 페이지당 아이템 수
 * @param {Function} t - 번역 함수
 * @returns {Object} 포맷된 페이지네이션 정보
 */
export const formatPaginationInfo = (
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  t,
) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return {
    current: currentPage,
    total: totalPages,
    showing: t('pagination.showing', {
      start: startItem,
      end: endItem,
      total: totalItems,
    }),
    range: `${startItem}-${endItem}`,
    totalItems,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }
}

/**
 * 폼 유효성 검사 오류를 다국어로 변환
 * @param {Object} errors - 유효성 검사 오류 객체
 * @param {Function} t - 번역 함수
 * @returns {Object} 번역된 오류 메시지 객체
 */
export const translateValidationErrors = (errors, t) => {
  const translatedErrors = {}

  Object.keys(errors).forEach((field) => {
    const error = errors[field]

    if (typeof error === 'string') {
      // 간단한 문자열 오류
      translatedErrors[field] = translateError(error, error, t)
    } else if (error && error.type) {
      // 유효성 검사 타입별 오류
      const errorKey = `validation.${error.type}`
      if (hasTranslation(errorKey)) {
        translatedErrors[field] = t(errorKey, error.params || {})
      } else {
        translatedErrors[field] = error.message || t('validation.invalid')
      }
    } else {
      translatedErrors[field] = error.message || t('validation.invalid')
    }
  })

  return translatedErrors
}

/**
 * 사용자 역할을 다국어로 번역
 * @param {string} role - 사용자 역할
 * @param {Function} t - 번역 함수
 * @returns {string} 번역된 역할명
 */
export const translateUserRole = (role, t) => {
  const roleKey = `users.${role}`
  return hasTranslation(roleKey) ? t(roleKey) : role
}

/**
 * 상태값을 다국어로 번역
 * @param {string} status - 상태값
 * @param {string} category - 카테고리 (user, travel, system 등)
 * @param {Function} t - 번역 함수
 * @returns {string} 번역된 상태명
 */
export const translateStatus = (status, category, t) => {
  const statusKey = `${category}.${status}`
  return hasTranslation(statusKey) ? t(statusKey) : status
}

export default {
  translateError,
  translateSuccess,
  formatDate,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  formatFileSize,
  formatPaginationInfo,
  translateValidationErrors,
  translateUserRole,
  translateStatus,
}
