import { useEffect, useState } from 'react'
import { Database, Server, Globe, MapPin, Clock, Activity } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'
import { authHttp } from '../../lib/http'
import {
  getStatusText,
  getStatusColor,
  getStatusIcon,
  getStatusBadgeProps,
  formatResponseTime,
  formatUptime,
  formatLastCheck,
  normalizeStatusData,
} from '../../utils/systemUtils'

export function SystemStatusCard() {
  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setLoading(true)
        const response = await authHttp.GET('/api/system/status')
        const data = await response.json()

        if (data.success) {
          // 새로운 표준 응답 형식: { success: true, data: {...}, message: "..." }
          const normalizedData = normalizeStatusData(data.data)
          setSystemStatus(normalizedData)
        } else {
          setError(
            data.error?.message ||
              data.message ||
              '시스템 상태를 불러오지 못했습니다.',
          )
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
          <div className="space-y-4">
            {/* 전체 시스템 상태 헤더 */}
            <div className="bg-muted/20 flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <span className="font-medium">전체 시스템</span>
                <Badge
                  variant={
                    getStatusBadgeProps(systemStatus.overall_status).variant
                  }
                  className={getStatusColor(systemStatus.overall_status, 'bg')}
                >
                  {getStatusIcon(systemStatus.overall_status)}{' '}
                  {getStatusText(systemStatus.overall_status)}
                </Badge>
              </div>
              <div className="text-muted-foreground text-sm">
                {systemStatus.message}
              </div>
            </div>

            {/* 가동 시간 및 마지막 체크 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>가동 시간:</span>
                <span className="font-medium">
                  {formatUptime(systemStatus.uptime_seconds)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>마지막 체크:</span>
                <span className="font-medium">
                  {formatLastCheck(systemStatus.last_check)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 서버/DB 상태 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">서비스 & 데이터베이스</h4>

                {/* 서비스 상태 */}
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">서비스</span>
                  <Badge
                    variant={
                      getStatusBadgeProps(systemStatus.service_status).variant
                    }
                  >
                    {getStatusIcon(systemStatus.service_status)}{' '}
                    {getStatusText(systemStatus.service_status)}
                  </Badge>
                </div>

                {/* 데이터베이스 상태 */}
                {systemStatus.database && (
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="text-sm">데이터베이스</span>
                    <Badge
                      variant={
                        getStatusBadgeProps(systemStatus.database.status)
                          .variant
                      }
                    >
                      {getStatusIcon(systemStatus.database.status)}{' '}
                      {getStatusText(systemStatus.database.status)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatResponseTime(systemStatus.database.response_time)}
                    </span>
                  </div>
                )}
              </div>

              {/* 외부 API */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">외부 API</h4>

                {systemStatus.external_apis?.weather_api && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">날씨 API</span>
                    <Badge
                      variant={
                        getStatusBadgeProps(
                          systemStatus.external_apis.weather_api.status,
                        ).variant
                      }
                      className="text-xs"
                    >
                      {getStatusIcon(
                        systemStatus.external_apis.weather_api.status,
                      )}{' '}
                      {getStatusText(
                        systemStatus.external_apis.weather_api.status,
                      )}
                    </Badge>
                  </div>
                )}

                {systemStatus.external_apis?.tourism_api && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-400" />
                    <span className="text-sm">관광 API</span>
                    <Badge
                      variant={
                        getStatusBadgeProps(
                          systemStatus.external_apis.tourism_api.status,
                        ).variant
                      }
                      className="text-xs"
                    >
                      {getStatusIcon(
                        systemStatus.external_apis.tourism_api.status,
                      )}{' '}
                      {getStatusText(
                        systemStatus.external_apis.tourism_api.status,
                      )}
                    </Badge>
                  </div>
                )}

                {systemStatus.external_apis?.google_places && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">지도 API</span>
                    <Badge
                      variant={
                        getStatusBadgeProps(
                          systemStatus.external_apis.google_places.status,
                        ).variant
                      }
                      className="text-xs"
                    >
                      {getStatusIcon(
                        systemStatus.external_apis.google_places.status,
                      )}{' '}
                      {getStatusText(
                        systemStatus.external_apis.google_places.status,
                      )}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* 시스템 리소스 정보 (있는 경우) */}
            {systemStatus.details &&
              Object.keys(systemStatus.details).length > 0 && (
                <div className="bg-muted/10 mt-4 rounded-lg border p-3">
                  <h4 className="mb-2 text-sm font-medium">시스템 리소스</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {systemStatus.details.cpu_percent !== undefined && (
                      <div>
                        <span className="text-muted-foreground">CPU:</span>
                        <span className="ml-1 font-medium">
                          {systemStatus.details.cpu_percent.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {systemStatus.details.memory_percent !== undefined && (
                      <div>
                        <span className="text-muted-foreground">메모리:</span>
                        <span className="ml-1 font-medium">
                          {systemStatus.details.memory_percent.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {systemStatus.details.disk_percent !== undefined && (
                      <div>
                        <span className="text-muted-foreground">디스크:</span>
                        <span className="ml-1 font-medium">
                          {systemStatus.details.disk_percent.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
