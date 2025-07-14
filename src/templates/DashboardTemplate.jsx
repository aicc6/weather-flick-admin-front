import { ContentSection, PageContainer, PageHeader } from '@/layouts'
import { LoadingState, ErrorState, StatsGrid } from '@/components/common'

/**
 * 대시보드 페이지 공통 템플릿
 * 
 * @param {Object} props
 * @param {string} props.title - 페이지 제목
 * @param {string} props.description - 페이지 설명
 * @param {boolean} props.loading - 로딩 상태
 * @param {Error} props.error - 에러 객체
 * @param {Function} props.onRetry - 재시도 함수
 * @param {Array} props.statsCards - 통계 카드 배열
 * @param {ReactNode} props.children - 추가 컨텐츠
 */
export function DashboardTemplate({
  title,
  description,
  loading,
  error,
  onRetry,
  statsCards = [],
  children,
}) {
  if (loading) {
    return (
      <PageContainer>
        <PageHeader title={title} description={description} />
        <ContentSection>
          <LoadingState message="대시보드 데이터를 불러오는 중..." />
        </ContentSection>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={title} description={description} />
        <ContentSection>
          <ErrorState
            error={error}
            onRetry={onRetry}
            message="대시보드 데이터를 불러올 수 없습니다"
          />
        </ContentSection>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader title={title} description={description} />

      {/* 통계 카드 */}
      {statsCards.length > 0 && (
        <ContentSection>
          <StatsGrid cards={statsCards} />
        </ContentSection>
      )}

      {/* 추가 컨텐츠 */}
      {children}
    </PageContainer>
  )
}

/**
 * 대시보드 섹션 컴포넌트
 */
export function DashboardSection({ title, description, children, className }) {
  return (
    <ContentSection className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </ContentSection>
  )
}

/**
 * 대시보드 그리드 레이아웃
 */
export function DashboardGrid({ children, columns = 'auto' }) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={`grid gap-4 ${gridClasses[columns] || gridClasses.auto}`}>
      {children}
    </div>
  )
}