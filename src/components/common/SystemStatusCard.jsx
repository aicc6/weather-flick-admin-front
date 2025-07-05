import { useEffect, useState } from 'react'
import { Database, Server, Globe, MapPin, CreditCard } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'
import { authHttp } from '../../lib/http'

export function SystemStatusCard() {
  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setLoading(true)
        const response = await authHttp.GET('/api/system/status')
        if (response.success) {
          setSystemStatus(response.data)
        } else {
          setError(response.error || '시스템 상태를 불러오지 못했습니다.')
        }
      } catch (err) {
        setError(err.message || '시스템 상태를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchSystemStatus()
  }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>시스템 상태</CardTitle>
        <CardDescription>서버 기본 상태 및 외부 API 연결 상태</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground text-sm">
            시스템 상태 정보를 불러오는 중...
          </div>
        ) : error ? (
          <div className="text-destructive text-sm">오류: {error}</div>
        ) : systemStatus ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 서버/DB 상태 */}
            <div className="space-y-2">
              {/* 전체 서비스 상태 */}
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                <span className="font-medium">서비스</span>
                <Badge
                  variant={
                    systemStatus.service_status === '정상' || systemStatus.service_status === '운영중'
                      ? 'success'
                      : 'destructive'
                  }
                >
                  {systemStatus.service_status}
                </Badge>
              </div>
              {/* 데이터베이스 상태 */}
              {systemStatus.database && (
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <span className="font-medium">DB</span>
                  <Badge
                    variant={
                      systemStatus.database.status === '연결됨'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {systemStatus.database.status}
                  </Badge>
                  {systemStatus.database.response_time && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      응답: {systemStatus.database.response_time}
                    </span>
                  )}
                </div>
              )}
            </div>
            {/* 외부 API */}
            <div className="space-y-2">
              <div className="mb-3">
                <span className="font-medium">외부 API 상태</span>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {systemStatus.external_apis?.weather_api && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-400" />
                      <span className="text-xs">날씨</span>
                      <Badge
                        variant={
                          systemStatus.external_apis.weather_api.status?.includes('정상') ||
                          systemStatus.external_apis.weather_api.status?.includes('200')
                            ? 'success'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {systemStatus.external_apis.weather_api.status}
                      </Badge>
                      {systemStatus.external_apis.weather_api.response_time && (
                        <span className="text-muted-foreground text-xs">
                          {systemStatus.external_apis.weather_api.response_time}
                        </span>
                      )}
                    </div>
                  )}
                  {systemStatus.external_apis?.tourism_api && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-400" />
                      <span className="text-xs">관광</span>
                      <Badge
                        variant={
                          systemStatus.external_apis.tourism_api.status?.includes('정상') ||
                          systemStatus.external_apis.tourism_api.status?.includes('200')
                            ? 'success'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {systemStatus.external_apis.tourism_api.status}
                      </Badge>
                      {systemStatus.external_apis.tourism_api.response_time && (
                        <span className="text-muted-foreground text-xs">
                          {systemStatus.external_apis.tourism_api.response_time}
                        </span>
                      )}
                    </div>
                  )}
                  {systemStatus.external_apis?.google_places && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs">지도</span>
                      <Badge
                        variant={
                          systemStatus.external_apis.google_places.status?.includes('정상') ||
                          systemStatus.external_apis.google_places.status?.includes('200')
                            ? 'success'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {systemStatus.external_apis.google_places.status}
                      </Badge>
                      {systemStatus.external_apis.google_places.response_time && (
                        <span className="text-muted-foreground text-xs">
                          {systemStatus.external_apis.google_places.response_time}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            시스템 상태 정보를 불러올 수 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
