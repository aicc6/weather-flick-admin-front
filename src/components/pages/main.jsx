import { useAuth } from '../../contexts/AuthContext'
import {
  Users,
  Shield,
  BookOpen,
  Calendar,
  Dumbbell,
  Cloud,
  MapPin,
} from 'lucide-react'
import { useDashboardData } from '../../hooks/useDashboardData'
import { DashboardHeader } from '../common/DashboardHeader'
import { WeatherStatsCard } from '../common/WeatherStatsCard'
import { SystemStatusCard } from '../common/SystemStatusCard'
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
    <div className="from-background via-background/95 to-background/90 min-h-screen bg-gradient-to-br">
      <DashboardHeader />

      {/* 요약 통계 섹션 */}
      <div className="space-y-8">
        {/* 시스템 상태 - 최상단 전체폭 */}
        <SystemStatusCard />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 오늘의 날씨 요약 */}
          <div className="lg:col-span-1">
            <div className="admin-card group h-full">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  오늘의 날씨
                </h3>
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div className="space-y-1">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
                      서울
                    </span>
                    <div className="text-muted-foreground text-sm">Seoul</div>
                  </div>
                  <div className="text-right">
                    <span className="text-foreground text-3xl font-bold">
                      23°
                    </span>
                    <span className="text-muted-foreground text-lg">C</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">날씨 상태</span>
                    <span className="font-medium">맑음</span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 ease-out"
                      style={{ width: '70%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사용자 통계 */}
          <div className="lg:col-span-1">
            <div className="admin-card group h-full">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  사용자 현황
                </h3>
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-2 dark:from-green-900/20 dark:to-emerald-900/20">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-3xl font-bold text-transparent">
                    {userSummary.total}
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    총 사용자
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/10">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {userSummary.active}
                    </div>
                    <div className="text-muted-foreground text-xs">활성</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-900/10">
                    <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {userSummary.inactive}
                    </div>
                    <div className="text-muted-foreground text-xs">비활성</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 관리자 통계 */}
          <div className="lg:col-span-1">
            <div className="admin-card group h-full">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  관리자 현황
                </h3>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-2 dark:from-purple-900/20 dark:to-violet-900/20">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-3xl font-bold text-transparent">
                    {adminSummary.total}
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    총 관리자
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-purple-50 p-3 text-center dark:bg-purple-900/10">
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {adminSummary.active}
                    </div>
                    <div className="text-muted-foreground text-xs">활성</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-900/10">
                    <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {adminSummary.inactive}
                    </div>
                    <div className="text-muted-foreground text-xs">비활성</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 여행지 통계 */}
          <div className="lg:col-span-1">
            <div className="admin-card group h-full">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  여행지 현황
                </h3>
                <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 p-2 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <MapPin className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-3xl font-bold text-transparent">
                    {tourSummary.total || 0}
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    총 여행지
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-yellow-50 p-3 text-center dark:bg-yellow-900/10">
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {regionCount || 0}
                    </div>
                    <div className="text-muted-foreground text-xs">지역</div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-3 text-center dark:bg-orange-900/10">
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      4.5
                    </div>
                    <div className="text-muted-foreground text-xs">
                      평균 평점
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 컨텐츠 관리 요약 섹션 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="admin-card group">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    여행 코스
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    전체 등록된 여행 코스 수
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-6 text-center">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent">
                {travelCourseData?.total ?? 0}
              </span>
              <span className="text-muted-foreground ml-1 text-sm">개</span>
            </div>
            <Link to="/content">
              <button className="primary-button w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg">
                관리 바로가기
              </button>
            </Link>
          </div>

          <div className="admin-card group">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    축제 이벤트
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    전체 등록된 축제/이벤트 수
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-6 text-center">
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
                {festivalData?.total ?? 0}
              </span>
              <span className="text-muted-foreground ml-1 text-sm">개</span>
            </div>
            <Link to="/content">
              <button className="accent-button w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg">
                관리 바로가기
              </button>
            </Link>
          </div>

          <div className="admin-card group">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20">
                  <Dumbbell className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    레저 스포츠
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    전체 등록된 레저 스포츠 수
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-6 text-center">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent">
                {leisureData?.total ?? 0}
              </span>
              <span className="text-muted-foreground ml-1 text-sm">개</span>
            </div>
            <Link to="/content">
              <button className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-medium text-white transition-all hover:from-emerald-600 hover:to-cyan-600 hover:shadow-lg">
                관리 바로가기
              </button>
            </Link>
          </div>
        </div>

        {/* 날씨 통계 - 최하단 전체폭 */}
        <WeatherStatsCard weatherData={weatherData} />
      </div>
    </div>
  )
}
