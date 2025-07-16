/**
 * 권한 상수 정의
 * 백엔드의 권한명과 일치해야 함
 */

// 사용자 관리 권한
export const USER_PERMISSIONS = {
  READ: 'users.read',
  WRITE: 'users.write',
  DELETE: 'users.delete',
  EXPORT: 'users.export',
}

// 리뷰 관리 권한
export const REVIEW_PERMISSIONS = {
  READ: 'reviews.read',
  WRITE: 'reviews.write',
  DELETE: 'reviews.delete',
  MODERATE: 'reviews.moderate',
}

// 지원 문의 권한
export const SUPPORT_PERMISSIONS = {
  READ: 'support.read',
  WRITE: 'support.write',
  DELETE: 'support.delete',
  ASSIGN: 'support.assign',
}

// 여행지 관리 권한
export const DESTINATION_PERMISSIONS = {
  READ: 'destinations.read',
  WRITE: 'destinations.write',
  DELETE: 'destinations.delete',
  PUBLISH: 'destinations.publish',
}

// 콘텐츠 관리 권한
export const CONTENT_PERMISSIONS = {
  READ: 'content.read',
  WRITE: 'content.write',
  DELETE: 'content.delete',
  PUBLISH: 'content.publish',
}

// 추천 시스템 권한
export const RECOMMENDATION_PERMISSIONS = {
  READ: 'recommendations.read',
  WRITE: 'recommendations.write',
  DELETE: 'recommendations.delete',
  CONFIGURE: 'recommendations.configure',
}

// 프로모션 관리 권한
export const PROMOTION_PERMISSIONS = {
  READ: 'promotions.read',
  WRITE: 'promotions.write',
  DELETE: 'promotions.delete',
  PUBLISH: 'promotions.publish',
}

// 시스템 관리 권한
export const SYSTEM_PERMISSIONS = {
  READ: 'system.read',
  WRITE: 'system.write',
  DELETE: 'system.delete',
  CONFIGURE: 'system.configure',
}

// 역할 관리 권한
export const ROLE_PERMISSIONS = {
  READ: 'roles.read',
  WRITE: 'roles.write',
  DELETE: 'roles.delete',
  ASSIGN: 'roles.assign',
}

// 로그 조회 권한
export const LOG_PERMISSIONS = {
  READ: 'logs.read',
  WRITE: 'logs.write',
  DELETE: 'logs.delete',
  EXPORT: 'logs.export',
}

// 알림 관리 권한
export const NOTIFICATION_PERMISSIONS = {
  READ: 'notifications.read',
  WRITE: 'notifications.write',
  DELETE: 'notifications.delete',
  SEND: 'notifications.send',
}

// 대시보드 권한
export const DASHBOARD_PERMISSIONS = {
  READ: 'dashboard.read',
  WRITE: 'dashboard.write',
  DELETE: 'dashboard.delete',
  CONFIGURE: 'dashboard.configure',
}

// 보고서 권한
export const REPORT_PERMISSIONS = {
  READ: 'reports.read',
  WRITE: 'reports.write',
  DELETE: 'reports.delete',
  EXPORT: 'reports.export',
}

// AI 모델 관리 권한
export const AI_MODEL_PERMISSIONS = {
  READ: 'ai_models.read',
  WRITE: 'ai_models.write',
  DELETE: 'ai_models.delete',
  TRAIN: 'ai_models.train',
}

// 역할 상수
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  USER_MANAGER: 'user_manager',
  CONTENT_MANAGER: 'content_manager',
  DATA_ANALYST: 'data_analyst',
}
