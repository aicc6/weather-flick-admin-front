/**
 * 시스템 상태 관련 유틸리티 함수
 * 상태 코드를 UI 요소로 변환하는 기능 제공
 */

import {
  SYSTEM_STATUS,
  SERVICE_STATUS,
  HEALTH_LEVEL,
  STATUS_TEXT,
  STATUS_COLORS,
  STATUS_ICONS,
  STATUS_CONFIG,
  HEALTH_LEVEL_COLORS,
  STATUS_PRIORITY,
  LEGACY_STATUS_MAPPING,
} from '../constants/systemStatus'

/**
 * 상태 코드에 따른 텍스트 반환
 * @param {string} status - 상태 코드
 * @returns {string} 한국어 상태 텍스트
 */
export const getStatusText = (status) => {
  return STATUS_TEXT[status] || status || '알 수 없음'
}

/**
 * 상태 코드에 따른 색상 클래스 반환
 * @param {string} status - 상태 코드
 * @param {string} type - 색상 타입 ('bg', 'text', 'border', 'indicator')
 * @returns {string} Tailwind CSS 클래스
 */
export const getStatusColor = (status, type = 'bg') => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS[SYSTEM_STATUS.UNKNOWN]
  return colors[type] || ''
}

/**
 * 상태 코드에 따른 아이콘 반환
 * @param {string} status - 상태 코드
 * @returns {string} 이모지 아이콘
 */
export const getStatusIcon = (status) => {
  return STATUS_ICONS[status] || STATUS_ICONS[SYSTEM_STATUS.UNKNOWN]
}

/**
 * 건강 상태 레벨에 따른 색상 클래스 반환
 * @param {string} healthLevel - 건강 상태 레벨
 * @param {string} type - 색상 타입 ('bg', 'text', 'border', 'indicator')
 * @returns {string} Tailwind CSS 클래스
 */
export const getHealthLevelColor = (healthLevel, type = 'bg') => {
  const colors =
    HEALTH_LEVEL_COLORS[healthLevel] || HEALTH_LEVEL_COLORS[HEALTH_LEVEL.INFO]
  return colors[type] || ''
}

/**
 * 상태의 심각도 비교
 * @param {string} status1 - 첫 번째 상태
 * @param {string} status2 - 두 번째 상태
 * @returns {number} 비교 결과 (-1: status1이 덜 심각, 0: 동일, 1: status1이 더 심각)
 */
export const compareStatusSeverity = (status1, status2) => {
  const priority1 = STATUS_PRIORITY[status1] || 0
  const priority2 = STATUS_PRIORITY[status2] || 0

  if (priority1 < priority2) return -1
  if (priority1 > priority2) return 1
  return 0
}

/**
 * 가장 심각한 상태 반환
 * @param {Array<string>} statuses - 상태 목록
 * @returns {string} 가장 심각한 상태
 */
export const getMostSevereStatus = (statuses) => {
  if (!Array.isArray(statuses) || statuses.length === 0) {
    return SYSTEM_STATUS.UNKNOWN
  }

  return statuses.reduce((mostSevere, current) => {
    return compareStatusSeverity(current, mostSevere) > 0 ? current : mostSevere
  }, statuses[0])
}

/**
 * 레거시 상태를 새 상태 코드로 변환
 * @param {string} legacyStatus - 레거시 상태 텍스트
 * @returns {string} 새로운 상태 코드
 */
export const mapLegacyStatus = (legacyStatus) => {
  return LEGACY_STATUS_MAPPING[legacyStatus] || SYSTEM_STATUS.UNKNOWN
}

/**
 * 상태에 따른 Badge 컴포넌트 props 생성
 * @param {string} status - 상태 코드
 * @returns {Object} Badge 컴포넌트용 props
 */
export const getStatusBadgeProps = (status) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[SYSTEM_STATUS.UNKNOWN]

  return {
    variant: getStatusVariant(status),
    className: `${config.colors.bg} ${config.colors.text} ${config.colors.border}`,
    children: `${config.icon} ${config.text}`,
  }
}

/**
 * 상태에 따른 Badge variant 반환
 * @param {string} status - 상태 코드
 * @returns {string} Badge variant
 */
export const getStatusVariant = (status) => {
  switch (status) {
    case SYSTEM_STATUS.HEALTHY:
    case SERVICE_STATUS.UP:
    case HEALTH_LEVEL.SUCCESS:
      return 'success'
    case SYSTEM_STATUS.DEGRADED:
    case SERVICE_STATUS.PARTIAL:
    case HEALTH_LEVEL.WARNING:
      return 'warning'
    case SYSTEM_STATUS.UNHEALTHY:
    case SERVICE_STATUS.DOWN:
    case HEALTH_LEVEL.CRITICAL:
      return 'destructive'
    case SERVICE_STATUS.MAINTENANCE:
    case HEALTH_LEVEL.INFO:
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * 응답 시간을 사람이 읽기 쉬운 형태로 변환
 * @param {number|string} responseTime - 응답 시간 (밀리초 또는 문자열)
 * @returns {string} 형식화된 응답 시간
 */
export const formatResponseTime = (responseTime) => {
  if (typeof responseTime === 'string') {
    return responseTime
  }

  if (typeof responseTime !== 'number' || responseTime < 0) {
    return '-'
  }

  if (responseTime < 1000) {
    return `${Math.round(responseTime)}ms`
  } else {
    return `${(responseTime / 1000).toFixed(2)}s`
  }
}

/**
 * 가동 시간을 사람이 읽기 쉬운 형태로 변환
 * @param {number} uptimeSeconds - 가동 시간 (초)
 * @returns {string} 형식화된 가동 시간
 */
export const formatUptime = (uptimeSeconds) => {
  if (typeof uptimeSeconds !== 'number' || uptimeSeconds < 0) {
    return '알 수 없음'
  }

  const days = Math.floor(uptimeSeconds / 86400)
  const hours = Math.floor((uptimeSeconds % 86400) / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)

  if (days > 0) {
    return `${days}일 ${hours}시간 ${minutes}분`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  } else {
    return `${minutes}분`
  }
}

/**
 * 시스템 리소스 사용률에 따른 상태 결정
 * @param {number} usage - 사용률 (0-100)
 * @param {Object} thresholds - 임계값 {warning: number, critical: number}
 * @returns {string} 상태 코드
 */
export const getResourceStatus = (
  usage,
  thresholds = { warning: 70, critical: 90 },
) => {
  if (usage >= thresholds.critical) {
    return HEALTH_LEVEL.CRITICAL
  } else if (usage >= thresholds.warning) {
    return HEALTH_LEVEL.WARNING
  } else {
    return HEALTH_LEVEL.SUCCESS
  }
}

/**
 * 마지막 체크 시간을 상대 시간으로 변환
 * @param {string|Date} lastCheck - 마지막 체크 시간
 * @returns {string} 상대 시간 (예: "5분 전")
 */
export const formatLastCheck = (lastCheck) => {
  if (!lastCheck) {
    return '알 수 없음'
  }

  const now = new Date()
  const checkTime = new Date(lastCheck)
  const diffMs = now - checkTime
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) {
    return '방금 전'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60)
    return `${hours}시간 전`
  } else {
    const days = Math.floor(diffMinutes / 1440)
    return `${days}일 전`
  }
}

/**
 * 상태 데이터의 유효성 검사
 * @param {Object} statusData - 상태 데이터
 * @returns {boolean} 유효성 여부
 */
export const validateStatusData = (statusData) => {
  if (!statusData || typeof statusData !== 'object') {
    return false
  }

  const requiredFields = ['overall_status', 'service_status', 'health_level']
  return requiredFields.every((field) =>
    Object.prototype.hasOwnProperty.call(statusData, field),
  )
}

/**
 * 상태 데이터 정규화 (레거시 데이터 지원)
 * @param {Object} rawData - 원시 상태 데이터
 * @returns {Object} 정규화된 상태 데이터
 */
export const normalizeStatusData = (rawData) => {
  if (!rawData) {
    return null
  }

  // 새로운 형식인 경우 그대로 반환
  if (validateStatusData(rawData)) {
    return rawData
  }

  // 레거시 형식 변환
  const normalized = {
    overall_status: mapLegacyStatus(rawData.service_status || rawData.status),
    service_status: mapLegacyStatus(rawData.service_status || rawData.status),
    health_level: HEALTH_LEVEL.INFO,
    message: rawData.message || '',
    last_check: rawData.last_check || new Date().toISOString(),
    uptime_seconds: rawData.uptime_seconds || 0,
    database: rawData.database || {},
    external_apis: rawData.external_apis || {},
    details: rawData.details || {},
  }

  return normalized
}
