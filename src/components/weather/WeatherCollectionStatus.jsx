import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  useGetCollectionStatsQuery, 
  useCollectAllCitiesMutation,
  useUpdateEmptyWeatherDataMutation 
} from '@/store/api/weatherApi'
import { 
  Database, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  TrendingUp,
  Droplets
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

function WeatherCollectionStatus() {
  const { data: stats, isLoading, refetch } = useGetCollectionStatsQuery()
  const [collectAllCities, { isLoading: isCollecting }] = useCollectAllCitiesMutation()
  const [updateEmptyData, { isLoading: isUpdating }] = useUpdateEmptyWeatherDataMutation()
  const [lastCollectionTime, setLastCollectionTime] = useState(null)

  const handleCollectData = async () => {
    try {
      const result = await collectAllCities().unwrap()
      toast.success(`${result.successful_count}개 도시의 날씨 데이터를 수집했습니다`)
      setLastCollectionTime(new Date())
      refetch()
    } catch (error) {
      toast.error('날씨 데이터 수집 중 오류가 발생했습니다')
    }
  }

  const handleUpdateEmptyData = async () => {
    try {
      const result = await updateEmptyData().unwrap()
      toast.success(
        `빈 데이터 업데이트 완료: ${result.updated_count}개 레코드가 업데이트되었습니다`
      )
      refetch()
    } catch (error) {
      toast.error('빈 데이터 업데이트 중 오류가 발생했습니다')
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return '정보 없음'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`
    return `${Math.floor(minutes / 1440)}일 전`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">데이터 로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const collectionRate = stats?.total_regions > 0 
    ? (stats.collected_regions / stats.total_regions) * 100 
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            날씨 데이터 수집 현황
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleUpdateEmptyData}
              disabled={isUpdating}
              size="sm"
              variant="outline"
            >
              {isUpdating ? (
                <>
                  <Droplets className="mr-2 h-4 w-4 animate-pulse" />
                  업데이트 중...
                </>
              ) : (
                <>
                  <Droplets className="mr-2 h-4 w-4" />
                  빈 데이터 채우기
                </>
              )}
            </Button>
            <Button
              onClick={handleCollectData}
              disabled={isCollecting}
              size="sm"
              variant="outline"
            >
              {isCollecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  수집 중...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  데이터 수집
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              수집 지역
            </div>
            <div className="text-2xl font-bold">
              {stats?.collected_regions || 0} / {stats?.total_regions || 0}
            </div>
            <Progress value={collectionRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              마지막 수집
            </div>
            <div className="text-lg font-semibold">
              {formatTime(stats?.last_collection_time || lastCollectionTime)}
            </div>
            {stats?.last_collection_time && (
              <Badge variant="outline" className="text-xs">
                {new Date(stats.last_collection_time).toLocaleTimeString('ko-KR')}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              오늘 수집
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats?.today_collection_count || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              성공: {stats?.successful_collections || 0}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              수집 실패
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats?.failed_collections || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              오류율: {stats?.error_rate || 0}%
            </div>
          </div>
        </div>

        {stats?.collection_history && stats.collection_history.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">최근 수집 이력</h4>
            <div className="space-y-2">
              {stats.collection_history.slice(0, 5).map((history, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={history.status === 'success' ? 'default' : 'destructive'}>
                      {history.status === 'success' ? '성공' : '실패'}
                    </Badge>
                    <span>{history.region_name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatTime(history.collected_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.next_collection_time && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm">다음 자동 수집 예정</span>
              </div>
              <span className="text-sm font-medium">
                {new Date(stats.next_collection_time).toLocaleTimeString('ko-KR')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WeatherCollectionStatus