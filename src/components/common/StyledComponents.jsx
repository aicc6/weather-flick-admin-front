import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 표준화된 버튼 컴포넌트
export function StandardButton({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(variants[variant] || '', className)}
      {...props}
    >
      {children}
    </Button>
  )
}

// 표준화된 카드 컴포넌트
export function StyledCard({ className, hover = true, ...props }) {
  return (
    <Card
      className={cn(
        'border-border shadow-sm',
        hover && 'transition-shadow duration-200 hover:shadow-md',
        className,
      )}
      {...props}
    />
  )
}

// 표준화된 카드 헤더
export function StyledCardHeader({ className, ...props }) {
  return <CardHeader className={cn('pb-4', className)} {...props} />
}

// 표준화된 카드 콘텐츠
export function StyledCardContent({ className, ...props }) {
  return <CardContent className={cn('pt-0', className)} {...props} />
}

// 표준화된 입력 필드 그룹
export function FormField({ label, error, required, children, className }) {
  return (
    <div className={cn('form-field', className)}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
    </div>
  )
}

// 표준화된 입력 필드
export function StandardInput({ className, ...props }) {
  return <Input className={cn('input-base', className)} {...props} />
}

// 표준화된 선택 필드
export function StandardSelect({
  options = [],
  placeholder = '선택하세요',
  className,
  ...props
}) {
  return (
    <Select {...props}>
      <SelectTrigger className={cn('select-base', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// 표준화된 검색 폼
export function SearchForm({
  onSubmit,
  searchFields = [],
  actionButtons = [],
  className,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'grid grid-cols-1 items-end gap-4 md:grid-cols-5',
        className,
      )}
    >
      {searchFields.map((field, index) => (
        <div key={index} className={`md:col-span-${field.colSpan || 2}`}>
          {field.component}
        </div>
      ))}
      <div className="flex gap-2 md:col-span-1 md:justify-end">
        {actionButtons.map((button, index) => (
          <StandardButton key={index} {...button} />
        ))}
      </div>
    </form>
  )
}

// 표준화된 데이터 카드 (관광지, 콘텐츠 등)
export function DataCard({
  image,
  title,
  subtitle,
  badges = [],
  actions = [],
  children,
  className,
}) {
  return (
    <StyledCard className={cn('flex h-full flex-col p-4', className)}>
      <div className="flex flex-1 flex-col gap-2">
        {/* 이미지 영역 */}
        <div className="bg-muted mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg">
          {image ? (
            <img
              src={image.src}
              alt={image.alt || title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground">이미지 없음</span>
          )}
        </div>

        {/* 제목 */}
        <h3 className="truncate text-lg font-bold" title={title}>
          {title}
        </h3>

        {/* 부제목 */}
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}

        {/* 배지 */}
        {badges.length > 0 && (
          <div className="flex items-center gap-2">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={cn(
                  'badge-base',
                  badge.variant === 'primary' && 'bg-primary/10 text-primary',
                  badge.variant === 'secondary' &&
                    'bg-secondary text-secondary-foreground',
                  badge.className,
                )}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* 추가 콘텐츠 */}
        {children}
      </div>

      {/* 액션 버튼 */}
      {actions.length > 0 && (
        <div className="mt-4 flex gap-2">
          {actions.map((action, index) => (
            <StandardButton key={index} size="sm" {...action} />
          ))}
        </div>
      )}
    </StyledCard>
  )
}

// 표준화된 테이블 래퍼
export function StandardTable({ children, className }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  )
}

// 표준화된 페이지 섹션
export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}) {
  return (
    <div className={cn('section-base', className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="button-group">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
