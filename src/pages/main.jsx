import { useAuth } from '@/contexts/AuthContext'
import { Users, Shield, BookOpen, Calendar, Dumbbell } from 'lucide-react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { UserInfoCard } from '@/components/common/UserInfoCard'
import { StatsCard } from '@/components/common/StatsCard'
import { WeatherStatsCard } from '@/components/common/WeatherStatsCard'
import { SystemStatusCard } from '@/components/common/SystemStatusCard'
import { StatsGrid } from '@/layouts/StatsGrid'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'
import { useGetTravelCoursesQuery } from '@/store/api/contentApi'
import { useGetFestivalEventsQuery } from '@/store/api/contentApi'
import { useGetLeisureSportsQuery } from '@/store/api/contentApi'
import { Link } from 'react-router-dom'

export const MainPage = () => {
  const { user } = useAuth()
  const { userSummary, adminSummary, weatherData } = useDashboardData()

  // 컨텐츠 관리 요약 데이터
  const { data: travelCourseData } = useGetTravelCoursesQuery({
    limit: 1,
    offset: 0,
  })
  const { data: festivalData } = useGetFestivalEventsQuery({
    limit: 1,
    skip: 0,
  })
  const { data: leisureData } = useGetLeisureSportsQuery({ limit: 1, skip: 0 })

  return (
    <PageContainer>
      <PageHeader
        title="대시보드"
        description="Weather Flick 관리 시스템의 현황을 한눈에 확인하세요."
      />

      {/* 시스템 상태 섹션 - 최상단 */}
      <SystemStatusCard />

      {/* 사용자 및 관리자 통계 */}
      <ContentSection transparent>
        <h2 className="mb-4 text-lg font-semibold">사용자 및 관리자 현황</h2>
        <StatsGrid>
          <UserInfoCard user={user} />
          <StatsCard
            title="사용자 관리"
            description="총/활성/비활성 사용자"
            icon={Users}
            iconColor="text-primary"
            total={userSummary.total}
            active={userSummary.active}
            inactive={userSummary.inactive}
            totalColor="text-primary"
          />
          <StatsCard
            title="관리자 요약"
            description="총/활성/비활성 관리자"
            icon={Shield}
            iconColor="text-purple-500"
            total={adminSummary.total}
            active={adminSummary.active}
            inactive={adminSummary.inactive}
            totalColor="text-purple-600"
          />
        </StatsGrid>
      </ContentSection>

      {/* 컨텐츠 관리 요약 섹션 */}
      <ContentSection transparent>
        <h2 className="mb-4 text-lg font-semibold">콘텐츠 현황</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            title="여행 코스"
            description="전체 등록된 여행 코스 수"
            icon={BookOpen}
            iconColor="text-blue-500"
            total={travelCourseData?.total ?? 0}
            totalColor="text-blue-600"
            className="h-full"
          >
            <Link to="/content">
              <button className="btn btn-primary mt-2 w-full">
                관리 바로가기
              </button>
            </Link>
          </StatsCard>
          <StatsCard
            title="축제 이벤트"
            description="전체 등록된 축제/이벤트 수"
            icon={Calendar}
            iconColor="text-pink-500"
            total={festivalData?.total ?? 0}
            totalColor="text-pink-600"
            className="h-full"
          >
            <Link to="/content">
              <button className="btn btn-primary mt-2 w-full">
                관리 바로가기
              </button>
            </Link>
          </StatsCard>
          <StatsCard
            title="레저 스포츠"
            description="전체 등록된 레저 스포츠 수"
            icon={Dumbbell}
            iconColor="text-green-500"
            total={leisureData?.total ?? 0}
            totalColor="text-green-600"
            className="h-full"
          >
            <Link to="/content">
              <button className="btn btn-primary mt-2 w-full">
                관리 바로가기
              </button>
            </Link>
          </StatsCard>
        </div>
      </ContentSection>

      {/* 날씨 통계 섹션 */}
      <ContentSection transparent>
        <h2 className="mb-4 text-lg font-semibold">날씨 통계</h2>
        <WeatherStatsCard weatherData={weatherData} />
      </ContentSection>
    </PageContainer>
  )
}
