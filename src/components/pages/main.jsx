import { useAuth } from '../../contexts/AuthContext'
import { Users, Shield, BookOpen, Calendar, Dumbbell } from 'lucide-react'
import { useDashboardData } from '../../hooks/useDashboardData'
import { DashboardHeader } from '../common/DashboardHeader'
import { UserInfoCard } from '../common/UserInfoCard'
import { StatsCard } from '../common/StatsCard'
import { WeatherStatsCard } from '../common/WeatherStatsCard'
import { SystemStatusCard } from '../common/SystemStatusCard'
import { TourismStatsCard } from '../common/TourismStatsCard'
import { StatsGrid } from '../layouts/StatsGrid'
import { useGetTravelCoursesQuery } from '../../store/api/contentApi'
import { useGetFestivalEventsQuery } from '../../store/api/contentApi'
import { useGetLeisureSportsQuery } from '../../store/api/contentApi'
import { Link } from 'react-router-dom'

export const MainPage = () => {
  const { user } = useAuth()
  const { tourSummary, userSummary, adminSummary, weatherData, regionCount } =
    useDashboardData()

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
    <div className="space-y-6">
      <DashboardHeader />

      <StatsGrid>
        <UserInfoCard user={user} />
        <StatsCard
          title="사용자 관리"
          description="총/활성/비활성 사용자"
          icon={Users}
          iconColor="text-blue-600"
          total={userSummary.total}
          active={userSummary.active}
          inactive={userSummary.inactive}
          totalColor="text-blue-700"
        />
        <StatsCard
          title="관리자 요약"
          description="총/활성/비활성 관리자"
          icon={Shield}
          iconColor="text-purple-600"
          total={adminSummary.total}
          active={adminSummary.active}
          inactive={adminSummary.inactive}
          totalColor="text-purple-700"
        />
      </StatsGrid>

      {/* 컨텐츠 관리 요약 섹션 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  여행 코스
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  전체 등록된 여행 코스 수
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {travelCourseData?.total ?? 0}
            </span>
          </div>
          <Link to="/content">
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              관리 바로가기
            </button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/20">
                <Calendar className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  축제 이벤트
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  전체 등록된 축제/이벤트 수
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-pink-700 dark:text-pink-400">
              {festivalData?.total ?? 0}
            </span>
          </div>
          <Link to="/content">
            <button className="w-full rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700">
              관리 바로가기
            </button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Dumbbell className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  레저 스포츠
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  전체 등록된 레저 스포츠 수
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-green-700 dark:text-green-400">
              {leisureData?.total ?? 0}
            </span>
          </div>
          <Link to="/content">
            <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              관리 바로가기
            </button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <WeatherStatsCard weatherData={weatherData} />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <SystemStatusCard />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <TourismStatsCard tourSummary={tourSummary} regionCount={regionCount} />
      </div>
    </div>
  )
}
