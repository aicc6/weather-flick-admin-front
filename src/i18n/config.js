/**
 * i18n 설정 파일
 * react-i18next를 사용한 다국어 지원 초기화
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 언어 리소스 import
import ko from './locales/ko.json'
import en from './locales/en.json'

// 지원하는 언어 목록
export const SUPPORTED_LANGUAGES = {
  ko: {
    code: 'ko',
    name: '한국어',
    flag: '🇰🇷',
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  },
}

// 기본 언어
export const DEFAULT_LANGUAGE = 'ko'

// 언어 감지 옵션
const languageDetectorOptions = {
  // 언어 감지 순서: localStorage > 브라우저 언어 > 기본 언어
  order: ['localStorage', 'navigator', 'htmlTag'],

  // localStorage 키 이름
  lookupLocalStorage: 'weather-flick-admin-language',

  // 캐시 활성화
  caches: ['localStorage'],

  // 지원하지 않는 언어인 경우 기본 언어로 폴백
  excludeCacheFor: ['cimode'],

  // HTML lang 속성 확인
  htmlTag: document.documentElement,

  // 브라우저 언어에서 지역 코드 제거 (ko-KR -> ko)
  convertDetectedLanguage: (lng) => lng.split('-')[0],
}

// i18n 초기화
i18n
  // 언어 감지 플러그인 사용
  .use(LanguageDetector)
  // React i18next 초기화
  .use(initReactI18next)
  // 설정 초기화
  .init({
    // 언어 리소스
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },

    // 기본 언어
    fallbackLng: DEFAULT_LANGUAGE,

    // 언어 감지 설정
    detection: languageDetectorOptions,

    // 개발 모드에서 디버그 로그 활성화
    debug: import.meta.env.MODE === 'development',

    // 중첩된 키 구분자
    keySeparator: '.',

    // 네임스페이스 구분자 비활성화 (단순화)
    nsSeparator: false,

    // 기본 네임스페이스
    defaultNS: 'translation',

    // 네임스페이스 사용 안함
    ns: ['translation'],

    // 보간(interpolation) 설정
    interpolation: {
      // React에서 XSS 방지를 위해 이스케이프 비활성화
      escapeValue: false,

      // 형식화 함수
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase()
        if (format === 'lowercase') return value.toLowerCase()
        if (format === 'date') return new Date(value).toLocaleDateString(lng)
        if (format === 'datetime') return new Date(value).toLocaleString(lng)
        if (format === 'number') return new Intl.NumberFormat(lng).format(value)
        return value
      },
    },

    // React 옵션
    react: {
      // Suspense 사용 안함 (로딩 상태 수동 관리)
      useSuspense: false,

      // 트랜잭션 컴포넌트 바인딩
      bindI18n: 'languageChanged',
      bindI18nStore: '',

      // 트랜스 컴포넌트 기본 태그
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    },

    // 타입스크립트 지원을 위한 반응형 설정
    lng: undefined, // 자동 감지 사용

    // 로딩 완료 콜백
    initImmediate: false,
  })

// 언어 변경 시 HTML lang 속성도 업데이트
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n

// 유틸리티 함수들
export const getCurrentLanguage = () => i18n.language || DEFAULT_LANGUAGE

export const changeLanguage = (lng) => {
  return i18n.changeLanguage(lng)
}

export const getSupportedLanguages = () => Object.values(SUPPORTED_LANGUAGES)

export const isLanguageSupported = (lng) => {
  return Object.keys(SUPPORTED_LANGUAGES).includes(lng)
}

export const getLanguageDirection = (_lng) => {
  // 현재는 모든 언어가 LTR이지만 향후 RTL 언어 지원 시 확장 가능
  return 'ltr'
}

// 번역 키 존재 여부 확인
export const hasTranslation = (key, lng = null) => {
  return i18n.exists(key, { lng: lng || i18n.language })
}

// 복수형 처리를 위한 헬퍼
export const getPluralKey = (count, baseKey) => {
  if (count === 0) return `${baseKey}_zero`
  if (count === 1) return `${baseKey}_one`
  return `${baseKey}_other`
}
