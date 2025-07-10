/**
 * 시스템 상태 관련 상수 정의
 * 백엔드 상태 코드와 프론트엔드 UI 매핑
 */

// 시스템 상태 상수 (백엔드와 동일)
export const SYSTEM_STATUS = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  UNHEALTHY: 'UNHEALTHY',
  UNKNOWN: 'UNKNOWN',
}

// 서비스 상태 상수 (백엔드와 동일)
export const SERVICE_STATUS = {
  UP: 'UP',
  DOWN: 'DOWN',
  MAINTENANCE: 'MAINTENANCE',
  PARTIAL: 'PARTIAL',
}

// 건강 상태 레벨 상수 (백엔드와 동일)
export const HEALTH_LEVEL = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
}

// 상태별 색상 매핑
export const STATUS_COLORS = {
  [SYSTEM_STATUS.HEALTHY]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    ring: 'ring-green-100',
    indicator: 'bg-green-500',
  },
  [SYSTEM_STATUS.DEGRADED]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    ring: 'ring-yellow-100',
    indicator: 'bg-yellow-500',
  },
  [SYSTEM_STATUS.UNHEALTHY]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    ring: 'ring-red-100',
    indicator: 'bg-red-500',
  },
  [SYSTEM_STATUS.UNKNOWN]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    ring: 'ring-gray-100',
    indicator: 'bg-gray-500',
  },

  // 서비스 상태 색상
  [SERVICE_STATUS.UP]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    indicator: 'bg-green-500',
  },
  [SERVICE_STATUS.DOWN]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    indicator: 'bg-red-500',
  },
  [SERVICE_STATUS.MAINTENANCE]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    indicator: 'bg-blue-500',
  },
  [SERVICE_STATUS.PARTIAL]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    indicator: 'bg-yellow-500',
  },
}

// 상태별 아이콘 매핑
export const STATUS_ICONS = {
  [SYSTEM_STATUS.HEALTHY]: '✅',
  [SYSTEM_STATUS.DEGRADED]: '⚠️',
  [SYSTEM_STATUS.UNHEALTHY]: '❌',
  [SYSTEM_STATUS.UNKNOWN]: '❓',

  [SERVICE_STATUS.UP]: '🟢',
  [SERVICE_STATUS.DOWN]: '🔴',
  [SERVICE_STATUS.MAINTENANCE]: '🔵',
  [SERVICE_STATUS.PARTIAL]: '🟡',
}

// 상태별 한국어 텍스트 매핑
export const STATUS_TEXT = {
  [SYSTEM_STATUS.HEALTHY]: '정상',
  [SYSTEM_STATUS.DEGRADED]: '성능 저하',
  [SYSTEM_STATUS.UNHEALTHY]: '장애',
  [SYSTEM_STATUS.UNKNOWN]: '알 수 없음',

  [SERVICE_STATUS.UP]: '정상',
  [SERVICE_STATUS.DOWN]: '중단',
  [SERVICE_STATUS.MAINTENANCE]: '점검 중',
  [SERVICE_STATUS.PARTIAL]: '일부 장애',

  [HEALTH_LEVEL.CRITICAL]: '심각',
  [HEALTH_LEVEL.WARNING]: '경고',
  [HEALTH_LEVEL.INFO]: '정보',
  [HEALTH_LEVEL.SUCCESS]: '성공',
}

// 건강 상태 레벨별 색상
export const HEALTH_LEVEL_COLORS = {
  [HEALTH_LEVEL.CRITICAL]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    indicator: 'bg-red-500',
  },
  [HEALTH_LEVEL.WARNING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    indicator: 'bg-yellow-500',
  },
  [HEALTH_LEVEL.INFO]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    indicator: 'bg-blue-500',
  },
  [HEALTH_LEVEL.SUCCESS]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    indicator: 'bg-green-500',
  },
}

// 상태 우선순위 (높을수록 심각)
export const STATUS_PRIORITY = {
  [SYSTEM_STATUS.HEALTHY]: 0,
  [SYSTEM_STATUS.DEGRADED]: 1,
  [SYSTEM_STATUS.UNHEALTHY]: 2,
  [SYSTEM_STATUS.UNKNOWN]: 3,

  [SERVICE_STATUS.UP]: 0,
  [SERVICE_STATUS.PARTIAL]: 1,
  [SERVICE_STATUS.MAINTENANCE]: 1,
  [SERVICE_STATUS.DOWN]: 2,

  [HEALTH_LEVEL.SUCCESS]: 0,
  [HEALTH_LEVEL.INFO]: 1,
  [HEALTH_LEVEL.WARNING]: 2,
  [HEALTH_LEVEL.CRITICAL]: 3,
}

// 전체 상태 설정 (빠른 접근용)
export const STATUS_CONFIG = {
  [SYSTEM_STATUS.HEALTHY]: {
    text: STATUS_TEXT[SYSTEM_STATUS.HEALTHY],
    colors: STATUS_COLORS[SYSTEM_STATUS.HEALTHY],
    icon: STATUS_ICONS[SYSTEM_STATUS.HEALTHY],
    priority: STATUS_PRIORITY[SYSTEM_STATUS.HEALTHY],
  },
  [SYSTEM_STATUS.DEGRADED]: {
    text: STATUS_TEXT[SYSTEM_STATUS.DEGRADED],
    colors: STATUS_COLORS[SYSTEM_STATUS.DEGRADED],
    icon: STATUS_ICONS[SYSTEM_STATUS.DEGRADED],
    priority: STATUS_PRIORITY[SYSTEM_STATUS.DEGRADED],
  },
  [SYSTEM_STATUS.UNHEALTHY]: {
    text: STATUS_TEXT[SYSTEM_STATUS.UNHEALTHY],
    colors: STATUS_COLORS[SYSTEM_STATUS.UNHEALTHY],
    icon: STATUS_ICONS[SYSTEM_STATUS.UNHEALTHY],
    priority: STATUS_PRIORITY[SYSTEM_STATUS.UNHEALTHY],
  },
  [SYSTEM_STATUS.UNKNOWN]: {
    text: STATUS_TEXT[SYSTEM_STATUS.UNKNOWN],
    colors: STATUS_COLORS[SYSTEM_STATUS.UNKNOWN],
    icon: STATUS_ICONS[SYSTEM_STATUS.UNKNOWN],
    priority: STATUS_PRIORITY[SYSTEM_STATUS.UNKNOWN],
  },
}

// 레거시 상태 매핑 (기존 코드 호환성)
export const LEGACY_STATUS_MAPPING = {
  정상: SYSTEM_STATUS.HEALTHY,
  연결됨: SERVICE_STATUS.UP,
  문제발생: SYSTEM_STATUS.UNHEALTHY,
  연결실패: SERVICE_STATUS.DOWN,
  타임아웃: SERVICE_STATUS.PARTIAL,
  '키 미설정': SERVICE_STATUS.MAINTENANCE,
}
