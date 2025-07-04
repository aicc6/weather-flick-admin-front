import {
  Database,
  Server,
  Activity,
  AlertTriangle,
  Globe,
  MapPin,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

export function SystemStatusCard({ systemStatus }) {
  return (
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
  )
}