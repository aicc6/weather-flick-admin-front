import { useAuth } from '../../contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { useEffect, useState } from 'react'
import { authHttp } from '../../lib/http'
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CheckCircle,
  Database,
  Server,
  Activity,
  AlertTriangle,
  Globe,
  MapPin,
  CreditCard,
  Users,
  Shield,
} from 'lucide-react'
import { Badge } from '../ui/badge'

export const MainPage = () => {
  const { user } = useAuth()
  // 관광지 대시보드 요약 데이터
  const [tourSummary, setTourSummary] = useState({ items: [], total: 0 })
  // 사용자/관리자 요약 데이터
  const [userSummary, setUserSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })
  const [adminSummary, setAdminSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })
  // DB 기반 날씨 요약 데이터
  const [weatherData, setWeatherData] = useState({})
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')
  const [weatherLastUpdated, setWeatherLastUpdated] = useState(null)
  // 시스템 상태 요약 데이터
  const [systemStatus, setSystemStatus] = useState(null)

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true)
      setWeatherError('')
      const res = await authHttp.GET('/weather/summary-db')
      const data = await res.json()
      // Assume data.regions is an array of city weather, summary is stats
      // Convert to { code: data } map for compatibility
      const regionMap = {}
      data.regions?.forEach((region) => {
        regionMap[region.city_code || region.city_name] = {
          ...region,
          region_name: region.city_name,
          temperature: region.temperature,
          humidity: region.humidity,
          wind_speed: region.wind_speed,
          sky_condition: region.sky_condition,
        }
      })
      setWeatherData(regionMap)
      setWeatherLastUpdated(
        data.summary?.last_updated
          ? new Date(data.summary.last_updated)
          : new Date(),
      )
    } catch (err) {
      setWeatherError('날씨 데이터를 불러오는데 실패했습니다.')
      setWeatherData({})
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 관광지 데이터 fetch
        const tourRes = await authHttp.GET('/tourist-attractions/', {
          params: { query: { limit: 3, offset: 0 } },
        })
        const tourData = await tourRes.json()
        setTourSummary(tourData)
      } catch (error) {
        console.error('관광지 데이터 로딩 실패:', error)
        setTourSummary({ items: [], total: 0 })
      }

      try {
        // 사용자 요약 fetch
        const userRes = await authHttp.GET('/users/stats')
        const userData = await userRes.json()
        setUserSummary({
          total: userData.total ?? 0,
          active: userData.active ?? 0,
          inactive: userData.inactive ?? 0,
        })
      } catch (error) {
        console.error('사용자 통계 로딩 실패:', error)
        setUserSummary({ total: 0, active: 0, inactive: 0 })
      }

      try {
        // 관리자 요약 fetch
        const adminRes = await authHttp.GET('/auth/admins/stats')
        const adminData = await adminRes.json()
        setAdminSummary({
          total: adminData.total ?? 0,
          active: adminData.active ?? 0,
          inactive: adminData.inactive ?? 0,
        })
      } catch (error) {
        console.error('관리자 통계 로딩 실패:', error)
        setAdminSummary({ total: 0, active: 0, inactive: 0 })
      }

      try {
        // 시스템 상태 fetch
        const systemRes = await authHttp.GET('/api/v1/admin/system/status')
        const systemData = await systemRes.json()
        setSystemStatus(systemData)
      } catch (error) {
        console.error('시스템 상태 로딩 실패:', error)
        setSystemStatus(null)
      }
    }

    fetchData()
    fetchWeatherData()
  }, [])

  // 최근 관광지 3개에서 유니크 카테고리/지역 개수 계산
  const uniqueCategories = new Set(
    tourSummary.items.map((a) => a.category_name || a.category_code),
  ).size
  const uniqueRegions = new Set(tourSummary.items.map((a) => a.region_code))
    .size

  const getWeatherIcon = (skyCondition) => {
    if (!skyCondition) return <Cloud className="h-4 w-4 text-gray-400" />
    if (skyCondition.includes('맑'))
      return <Sun className="h-4 w-4 text-yellow-500" />
    if (skyCondition.includes('구름'))
      return <Cloud className="h-4 w-4 text-gray-500" />
    if (skyCondition.includes('비'))
      return <CloudRain className="h-4 w-4 text-blue-500" />
    if (skyCondition.includes('눈'))
      return <CloudSnow className="h-4 w-4 text-blue-300" />
    return <Cloud className="h-4 w-4 text-gray-400" />
  }

  const getWeatherDescription = (skyCondition) => {
    if (!skyCondition) return '알 수 없음'
    if (skyCondition.includes('맑')) return '맑음'
    if (skyCondition.includes('구름')) return '구름 많음'
    if (skyCondition.includes('비')) return '비'
    if (skyCondition.includes('눈')) return '눈'
    return skyCondition
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">대시보드</h2>
        <p className="text-muted-foreground">
          Weather Flick 관리자 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>사용자 정보</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
            <CheckCircle className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">이름:</span>
                <span>{user?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">권한:</span>
                <Badge variant={user?.is_superuser ? 'success' : 'outline'}>
                  {user?.is_superuser ? '슈퍼유저' : '일반 관리자'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">계정 상태:</span>
                <Badge variant={user?.is_active ? 'success' : 'destructive'}>
                  {user?.is_active ? '활성' : '비활성'}
                </Badge>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                {user?.is_active
                  ? '계정이 정상적으로 있습니다'
                  : '계정이 비활성화되어 있습니다'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>사용자 관리 </CardTitle>
              <CardDescription>총/활성/비활성 사용자</CardDescription>
            </div>
            <Users className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-xs">총</span>
                <span className="text-lg font-bold text-blue-600">
                  {userSummary.total}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="success" className="mb-1">
                  활성
                </Badge>
                <span className="font-bold text-green-600">
                  {userSummary.active}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="destructive" className="mb-1">
                  비활성
                </Badge>
                <span className="font-bold text-gray-500">
                  {userSummary.inactive}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>관리자 요약</CardTitle>
              <CardDescription>총/활성/비활성 관리자</CardDescription>
            </div>
            <Shield className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-xs">총</span>
                <span className="text-lg font-bold text-purple-600">
                  {adminSummary.total}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="success" className="mb-1">
                  활성
                </Badge>
                <span className="font-bold text-green-600">
                  {adminSummary.active}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="destructive" className="mb-1">
                  비활성
                </Badge>
                <span className="font-bold text-gray-500">
                  {adminSummary.inactive}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>날씨 통계</CardTitle>
              <CardDescription>
                주요 도시들의 날씨 통계 정보입니다.
              </CardDescription>
            </div>
            <Cloud className="h-6 w-6 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {(() => {
                const validData = Object.values(weatherData).filter(
                  (data) =>
                    data.temperature !== undefined && data.temperature !== null,
                )
                const temperatures = validData.map((data) =>
                  parseInt(data.temperature),
                )
                if (temperatures.length === 0) {
                  return (
                    <div className="text-muted-foreground text-sm">
                      데이터가 없습니다.
                    </div>
                  )
                }
                const avgTemp = (
                  temperatures.reduce((a, b) => a + b, 0) / temperatures.length
                ).toFixed(1)
                const maxTemp = Math.max(...temperatures)
                const minTemp = Math.min(...temperatures)
                const maxTempRegion = validData.find(
                  (data) => parseInt(data.temperature) === maxTemp,
                )
                const minTempRegion = validData.find(
                  (data) => parseInt(data.temperature) === minTemp,
                )
                return (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex flex-col items-center justify-center p-2">
                      <Sun className="mb-1 h-6 w-6 text-yellow-500" />
                      <span className="font-semibold">평균 기온</span>
                      <span className="text-lg font-bold text-blue-700">
                        {avgTemp}°C
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2">
                      <Sun className="mb-1 h-6 w-6 text-yellow-400" />
                      <span className="font-semibold">최고 기온</span>
                      <span className="text-lg font-bold text-red-600">
                        {maxTemp}°C
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {maxTempRegion?.region_name}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2">
                      <Cloud className="mb-1 h-6 w-6 text-blue-300" />
                      <span className="font-semibold">최저 기온</span>
                      <span className="text-lg font-bold text-blue-400">
                        {minTemp}°C
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {minTempRegion?.region_name}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2">
                      <CheckCircle className="mb-1 h-6 w-6 text-green-500" />
                      <span className="font-semibold">데이터 업데이트</span>
                      <span className="text-xs text-green-600">정상</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>시스템 관리 요약</CardTitle>
            <CardDescription>
              서버/DB/API/에러/리소스/외부API 상태
            </CardDescription>
          </CardHeader>
          <CardContent>
            {systemStatus ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* 서버/DB/API/에러 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">서버</span>
                    <Badge
                      variant={
                        systemStatus.server.status === '정상'
                          ? 'success'
                          : 'destructive'
                      }
                    >
                      {systemStatus.server.status}
                    </Badge>
                    <span className="text-muted-foreground ml-2 text-xs">
                      업타임: {systemStatus.server.uptime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    <span className="font-medium">DB</span>
                    <Badge
                      variant={
                        systemStatus.db.status === '연결됨'
                          ? 'success'
                          : 'destructive'
                      }
                    >
                      {systemStatus.db.status}
                    </Badge>
                    <span className="text-muted-foreground ml-2 text-xs">
                      응답: {systemStatus.db.response}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">API</span>
                    <span className="ml-2 text-xs">
                      평균 {systemStatus.api.avgResponse}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="font-medium">에러율</span>
                    <span className="ml-2 text-xs">
                      {systemStatus.error.rate}
                    </span>
                  </div>
                </div>
                {/* 리소스/외부 API */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">CPU</span>
                    <Badge variant="outline">
                      {systemStatus.resource.cpu}%
                    </Badge>
                    <span className="ml-4 font-medium">메모리</span>
                    <Badge variant="outline">
                      {systemStatus.resource.memory}%
                    </Badge>
                    <span className="ml-4 font-medium">디스크</span>
                    <Badge variant="outline">
                      {systemStatus.resource.disk}%
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">외부 API 상태</span>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <span className="text-xs">날씨</span>
                        <Badge
                          variant={
                            systemStatus.external.weather === '정상'
                              ? 'success'
                              : 'destructive'
                          }
                        >
                          {systemStatus.external.weather}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-400" />
                        <span className="text-xs">관광</span>
                        <Badge
                          variant={
                            systemStatus.external.tour === '정상'
                              ? 'success'
                              : 'destructive'
                          }
                        >
                          {systemStatus.external.tour}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-yellow-400" />
                        <span className="text-xs">지도</span>
                        <Badge
                          variant={
                            systemStatus.external.map === '정상'
                              ? 'success'
                              : 'destructive'
                          }
                        >
                          {systemStatus.external.map}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-pink-400" />
                        <span className="text-xs">결제</span>
                        <Badge
                          variant={
                            systemStatus.external.payment === '정상'
                              ? 'success'
                              : 'destructive'
                          }
                        >
                          {systemStatus.external.payment}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                시스템 상태 정보를 불러오는 중...
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>관광지 관리 요약</CardTitle>
            <CardDescription>관광지, 카테고리, 지역별 요약</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center p-2">
                <MapPin className="mb-1 h-6 w-6 text-blue-500" />
                <span className="font-semibold">총 관광지</span>
                <span className="text-lg font-bold text-blue-700">
                  {tourSummary.total}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <Globe className="mb-1 h-6 w-6 text-green-500" />
                <span className="font-semibold">카테고리</span>
                <span className="text-lg font-bold text-green-700">
                  {uniqueCategories}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <MapPin className="mb-1 h-6 w-6 text-yellow-500" />
                <span className="font-semibold">지역</span>
                <span className="text-lg font-bold text-yellow-700">
                  {uniqueRegions}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <CheckCircle className="mb-1 h-6 w-6 text-purple-500" />
                <span className="font-semibold">최근 등록</span>
                <span className="text-muted-foreground text-sm">
                  {tourSummary.items[0]?.name || '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
