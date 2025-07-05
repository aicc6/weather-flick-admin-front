import { useAuth } from '../../contexts/AuthContext'
import { Users, Shield } from 'lucide-react'
import { useDashboardData } from '../../hooks/useDashboardData'
import { DashboardHeader } from '../common/DashboardHeader'
import { UserInfoCard } from '../common/UserInfoCard'
import { StatsCard } from '../common/StatsCard'
import { WeatherStatsCard } from '../common/WeatherStatsCard'
import { SystemStatusCard } from '../common/SystemStatusCard'
import { TourismStatsCard } from '../common/TourismStatsCard'
import { StatsGrid } from '../layouts/StatsGrid'

export const MainPage = () => {
  const { user } = useAuth()
  const { tourSummary, userSummary, adminSummary, weatherData } =
    useDashboardData()

  return (
    <div className="page-layout">
      <DashboardHeader />

      <StatsGrid>
        <UserInfoCard user={user} />
        <StatsCard
          title="사용자 관리"
          description="총/활성/비활성 사용자"
          icon={Users}
          iconColor="text-blue-500"
          total={userSummary.total}
          active={userSummary.active}
          inactive={userSummary.inactive}
          totalColor="text-blue-600"
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

      <div className="section-layout">
        <WeatherStatsCard weatherData={weatherData} />
        <SystemStatusCard />
        <TourismStatsCard tourSummary={tourSummary} />
      </div>
    </div>
  )
}
