import { useAuth } from '../../contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  // 날씨 요약 데이터
  const [weatherSummary, setWeatherSummary] = useState({
    regionCount: 0,
    avgTemp: null,
    maxTemp: null,
    minTemp: null,
    lastUpdated: null,
    maxRegion: '',
    minRegion: '',
  })
  useEffect(() => {
    // 기존 관광지 fetch
    fetch('/tourist-attractions/?limit=3&offset=0')
      .then((res) => res.json())
      .then((data) => setTourSummary(data))

    // 사용자 요약 fetch
    fetch('/users/stats')
      .then((res) => res.json())
      .then((data) =>
        setUserSummary({
          total: data.total ?? 0,
          active: data.active ?? 0,
          inactive: data.inactive ?? 0,
        }),
      )
      .catch(() => setUserSummary({ total: 0, active: 0, inactive: 0 }))
    // 관리자 요약 fetch
    fetch('/admins/stats')
      .then((res) => res.json())
      .then((data) =>
        setAdminSummary({
          total: data.total ?? 0,
          active: data.active ?? 0,
          inactive: data.inactive ?? 0,
        }),
      )
      .catch(() => setAdminSummary({ total: 0, active: 0, inactive: 0 }))
    // 날씨 요약 fetch (동일 로직, /weather/summary가 없으면 /weather/current 등으로 대체)
    fetch('/weather/current')
      .then((res) => res.json())
      .then((data) => {
        const regionData = Object.values(data).filter(
          (d) => d && d.temperature && d.temperature !== 'N/A',
        )
        const regionCount = regionData.length
        const temperatures = regionData
          .map((d) => parseFloat(d.temperature))
          .filter((t) => !isNaN(t))
        if (temperatures.length === 0) {
          setWeatherSummary({
            regionCount: 0,
            avgTemp: null,
            maxTemp: null,
            minTemp: null,
            lastUpdated: null,
            maxRegion: '',
            minRegion: '',
          })
          return
        }
        const avgTemp = (
          temperatures.reduce((a, b) => a + b, 0) / temperatures.length
        ).toFixed(1)
        const maxTemp = Math.max(...temperatures)
        const minTemp = Math.min(...temperatures)
        const maxRegion =
          regionData.find((d) => parseFloat(d.temperature) === maxTemp)
            ?.region_name || ''
        const minRegion =
          regionData.find((d) => parseFloat(d.temperature) === minTemp)
            ?.region_name || ''
        setWeatherSummary({
          regionCount,
          avgTemp,
          maxTemp,
          minTemp,
          lastUpdated: new Date().toLocaleString(),
          maxRegion,
          minRegion,
        })
      })
      .catch(() =>
        setWeatherSummary({
          regionCount: 0,
          avgTemp: null,
          maxTemp: null,
          minTemp: null,
          lastUpdated: null,
          maxRegion: '',
          minRegion: '',
        }),
      )
  }, [])

  // 최근 관광지 3개에서 유니크 카테고리/지역 개수 계산
  const uniqueCategories = new Set(
    tourSummary.items.map((a) => a.category_name || a.category_code),
  ).size
  const uniqueRegions = new Set(tourSummary.items.map((a) => a.region_code))
    .size

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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">사용자 정보</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">이름:</span>
                <span>{user?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">권한:</span>
                <span>{user?.is_superuser ? '슈퍼유저' : '일반 관리자'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">계정 상태:</span>
                <span>{user?.is_active ? '활성' : '비활성'}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                {user?.is_active
                  ? '계정이 정상적으로 있습니다'
                  : '계정이 비활성화되어 있습니다'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>사용자 관리</CardTitle>
            <CardDescription>전체 사용자 및 상태 요약</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">총 사용자 수</span>
              <span className="text-lg font-bold text-blue-600">
                {userSummary.total}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">활성 사용자</span>
              <span className="text-lg font-bold text-green-600">
                {userSummary.active}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">비활성 사용자</span>
              <span className="text-lg font-bold text-gray-500">
                {userSummary.inactive}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>관리자 관리</CardTitle>
            <CardDescription>전체 관리자 및 상태 요약</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">총 관리자 수</span>
              <span className="text-lg font-bold text-blue-600">
                {adminSummary.total}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">활성 관리자</span>
              <span className="text-lg font-bold text-green-600">
                {adminSummary.active}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">비활성 관리자</span>
              <span className="text-lg font-bold text-gray-500">
                {adminSummary.inactive}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>날씨 정보 요약</CardTitle>
            <CardDescription>
              주요 도시의 실시간 날씨 데이터 요약
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">도시 수</span>
              <span className="text-lg font-bold text-blue-600">
                {weatherSummary.regionCount}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">평균 기온</span>
              <span className="text-lg font-bold text-orange-600">
                {weatherSummary.avgTemp !== null
                  ? `${weatherSummary.avgTemp}°C`
                  : '-'}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">최고 기온</span>
              <span className="text-lg font-bold text-red-600">
                {weatherSummary.maxTemp !== null
                  ? `${weatherSummary.maxTemp}°C (${weatherSummary.maxRegion})`
                  : '-'}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">최저 기온</span>
              <span className="text-lg font-bold text-blue-400">
                {weatherSummary.minTemp !== null
                  ? `${weatherSummary.minTemp}°C (${weatherSummary.minRegion})`
                  : '-'}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">업데이트</span>
              <span className="text-xs text-gray-500">
                {weatherSummary.lastUpdated || '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>시스템 정보</CardTitle>
            <CardDescription>
              Weather Flick 관리자 시스템의 현재 상태입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">데이터베이스 연결</span>
                <span className="text-sm text-green-600">정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API 서버</span>
                <span className="text-sm text-green-600">정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">인증 시스템</span>
                <span className="text-sm text-green-600">정상</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>관광지 관리</CardTitle>
            <CardDescription>관광지 데이터 요약</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">총 관광지 수</span>
              <span className="text-lg font-bold text-blue-600">
                {tourSummary.total}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                최근 관광지 내 카테고리 수
              </span>
              <span className="text-lg font-bold text-green-600">
                {uniqueCategories}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                최근 관광지 내 지역 수
              </span>
              <span className="text-lg font-bold text-purple-600">
                {uniqueRegions}
              </span>
            </div>
            <div className="mt-2">
              <div className="mb-1 text-xs text-gray-500">최근 등록 관광지</div>
              <ul className="list-disc space-y-1 pl-5">
                {tourSummary.items.length === 0 && (
                  <li className="text-gray-400">데이터 없음</li>
                )}
                {tourSummary.items.map((a) => (
                  <li key={a.content_id} className="text-sm">
                    {a.attraction_name}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
