import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useMemo } from 'react'
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts'

// 색상 팔레트
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

function WeatherTrendChart({ weatherData = [] }) {
  const [chartType, setChartType] = useState('temperature-comparison')

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!weatherData || weatherData.length === 0) return []

    // 온도 비교 데이터
    if (chartType === 'temperature-comparison') {
      let data = [...weatherData] // 배열 복사
      // 전체 지역을 온도순으로 정렬하여 상위 20개만 표시
      data = data
        .sort((a, b) => b.temperature - a.temperature)
        .slice(0, 20)
      
      return data.map(item => ({
        지역: item.city_name,
        평균온도: item.temperature,
        최저온도: item.min_temp,
        최고온도: item.max_temp
      }))
    }

    // 날씨 상태별 통계
    if (chartType === 'weather-condition') {
      const conditionCounts = {}
      weatherData.forEach(item => {
        const condition = item.weather_condition || '정보없음'
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1
      })
      
      return Object.entries(conditionCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([condition, count]) => ({
          날씨: condition,
          지역수: count
        }))
    }

    return []
  }, [weatherData, chartType])

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          차트 데이터가 없습니다
        </div>
      )
    }

    switch (chartType) {
      case 'temperature-comparison':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="지역" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="최저온도" fill="#3b82f6" />
              <Bar dataKey="평균온도" fill="#10b981" />
              <Bar dataKey="최고온도" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        )


      case 'weather-condition':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="날씨" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="지역수" fill="#8b5cf6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  // 통계 정보 계산
  const statistics = useMemo(() => {
    if (!weatherData || weatherData.length === 0) return {}
    
    const temps = weatherData.map(item => item.temperature)
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length
    const maxTemp = Math.max(...temps)
    const minTemp = Math.min(...temps)
    const maxTempRegion = weatherData.find(item => item.temperature === maxTemp)?.city_name
    const minTempRegion = weatherData.find(item => item.temperature === minTemp)?.city_name
    
    const precipRegions = weatherData.filter(item => item.precipitation_prob > 0).length
    const avgPrecip = weatherData.reduce((sum, item) => sum + (item.precipitation_prob || 0), 0) / weatherData.length
    
    return {
      avgTemp: avgTemp.toFixed(1),
      maxTemp,
      minTemp,
      maxTempRegion,
      minTempRegion,
      precipRegions,
      avgPrecip: avgPrecip.toFixed(1)
    }
  }, [weatherData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>날씨 현황 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={chartType} onValueChange={setChartType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="temperature-comparison">온도 비교</TabsTrigger>
            <TabsTrigger value="weather-condition">날씨 상태</TabsTrigger>
          </TabsList>
          
          <TabsContent value={chartType} className="mt-4">
            {renderChart()}
          </TabsContent>
        </Tabs>

        {/* 통계 정보 표시 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {chartType === 'temperature-comparison' && (
            <>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">평균 온도</div>
                <div className="text-xl font-bold text-green-600">
                  {statistics.avgTemp}°C
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">최고 온도</div>
                <div className="text-xl font-bold text-red-600">
                  {statistics.maxTemp}°C
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {statistics.maxTempRegion}
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">최저 온도</div>
                <div className="text-xl font-bold text-blue-600">
                  {statistics.minTemp}°C
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {statistics.minTempRegion}
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">온도 편차</div>
                <div className="text-xl font-bold text-orange-600">
                  {(statistics.maxTemp - statistics.minTemp).toFixed(1)}°C
                </div>
              </div>
            </>
          )}
          
          
          {chartType === 'weather-condition' && (
            <>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">전체 지역 수</div>
                <div className="text-xl font-bold text-purple-600">
                  {weatherData.length}개
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">날씨 유형</div>
                <div className="text-xl font-bold text-purple-600">
                  {chartData.length}가지
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default WeatherTrendChart