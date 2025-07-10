/**
 * 언어 전환 컴포넌트
 * 드롭다운 형태로 언어 선택 제공
 */

import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Check, ChevronDown, Globe, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { SUPPORTED_LANGUAGES, getCurrentLanguage } from '../../i18n/config'
import { useLanguagePreference } from '../../hooks/useLanguagePreference'

export function LanguageSwitcher({
  variant = 'outline',
  size = 'sm',
  showFlag = true,
  showText = true,
  align = 'end',
  side = 'bottom',
}) {
  const { t: _t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { setLanguage, isLoading, error } = useLanguagePreference()
  const currentLang = getCurrentLanguage()
  const currentLanguage =
    SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.ko

  /**
   * 언어 변경 핸들러
   */
  const handleLanguageChange = async (langCode) => {
    try {
      const success = await setLanguage(langCode)
      if (success) {
        setIsOpen(false)
        console.log(
          `Language changed to: ${SUPPORTED_LANGUAGES[langCode].name}`,
        )
      }
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  /**
   * 버튼 텍스트 생성
   */
  const getButtonText = () => {
    const parts = []

    if (showFlag) {
      parts.push(currentLanguage.flag)
    }

    if (showText) {
      parts.push(currentLanguage.name)
    }

    return parts.length > 0
      ? parts.join(' ')
      : currentLanguage.code.toUpperCase()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className="language-switcher h-auto min-w-[120px] justify-between gap-2"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4 opacity-70" />
            )}
            <div className="flex items-center gap-1.5">
              {showFlag && (
                <span className="flag-emoji">{currentLanguage.flag}</span>
              )}
              {showText && (
                <span className="lang-text text-sm">
                  {currentLanguage.name}
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={`h-3 w-3 opacity-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        className="language-dropdown w-48 p-0"
      >
        {Object.values(SUPPORTED_LANGUAGES).map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`language-dropdown-item m-0 flex cursor-pointer items-center justify-between rounded-none focus:bg-transparent ${currentLang === language.code ? 'selected' : ''}`}
            disabled={isLoading}
          >
            <div className="flex items-center gap-3">
              <span className="flag-emoji text-lg">{language.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{language.name}</span>
                <span className="text-muted-foreground text-xs">
                  {language.code.toUpperCase()}
                </span>
              </div>
            </div>

            {currentLang === language.code && (
              <Check className="text-primary h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}

        {error && (
          <div className="border-border bg-destructive/5 border-t px-4 py-2 text-xs text-red-500">
            {error}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * 컴팩트 언어 전환 컴포넌트 (플래그만 표시)
 */
export function LanguageSwitcherCompact({ className = '' }) {
  return (
    <LanguageSwitcher
      variant="ghost"
      size="sm"
      showFlag={true}
      showText={false}
      className={className}
    />
  )
}

/**
 * 상태 표시가 포함된 언어 전환 컴포넌트
 */
export function LanguageSwitcherWithStatus() {
  const { i18n } = useTranslation()
  const [isChanging, setIsChanging] = useState(false)

  const handleLanguageChange = async (langCode) => {
    setIsChanging(true)
    try {
      await i18n.changeLanguage(langCode)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher onLanguageChange={handleLanguageChange} />
      {isChanging && (
        <Badge variant="secondary" className="text-xs">
          변경 중...
        </Badge>
      )}
    </div>
  )
}

/**
 * 인라인 언어 전환 (라디오 버튼 스타일)
 */
export function LanguageSwitcherInline({ className = '' }) {
  const { i18n } = useTranslation()
  const currentLang = getCurrentLanguage()

  return (
    <div
      className={`flex items-center gap-1 rounded-md border p-1 ${className}`}
    >
      {Object.values(SUPPORTED_LANGUAGES).map((language) => (
        <Button
          key={language.code}
          variant={currentLang === language.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => i18n.changeLanguage(language.code)}
          className="h-8 px-2 text-xs"
        >
          <span className="mr-1">{language.flag}</span>
          {language.code.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}

/**
 * 설정 페이지용 언어 전환 컴포넌트
 */
export function LanguageSwitcherSettings() {
  const { t, i18n } = useTranslation()
  const currentLang = getCurrentLanguage()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('settings.language')}</label>
      <div className="grid grid-cols-1 gap-2">
        {Object.values(SUPPORTED_LANGUAGES).map((language) => (
          <Button
            key={language.code}
            variant={currentLang === language.code ? 'default' : 'outline'}
            onClick={() => i18n.changeLanguage(language.code)}
            className="flex h-12 items-center justify-start gap-3"
          >
            <span className="text-lg">{language.flag}</span>
            <div className="flex flex-col items-start">
              <span className="font-medium">{language.name}</span>
              <span className="text-muted-foreground text-xs">
                {language.code.toUpperCase()}
              </span>
            </div>
            {currentLang === language.code && (
              <Check className="text-primary ml-auto h-4 w-4" />
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSwitcher
