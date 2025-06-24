import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  MapPin,
  Calendar,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
} from 'lucide-react'

/**
 * URL: '/weather'
 */
export function WeatherPage() {
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [dataType, setDataType] = useState('all')

  // 임시 날씨 데이터
  const weatherData = [
    {
      id: 1,
      region: '서울',
      temperature: 22,
      humidity: 65,
      windSpeed: 3.2,
      windDirection: '동북동',
      pressure: 1013,
      visibility: 10,
      condition: '맑음',
      lastUpdate: '2024-03-20 16:30',
      status: 'normal',
    },
    {
      id: 2,
      region: '부산',
      temperature: 25,
      humidity: 70,
      windSpeed: 4.1,
      windDirection: '남동',
      pressure: 1012,
      visibility: 8,
      condition: '흐림',
      lastUpdate: '2024-03-20 16:25',
      status: 'normal',
    },
    {
      id: 3,
      region: '대구',
      temperature: 28,
      humidity: 55,
      windSpeed: 2.8,
      windDirection: '서',
      pressure: 1011,
      visibility: 12,
      condition: '맑음',
      lastUpdate: '2024-03-20 16:28',
      status: 'warning',
    },
    {
      id: 4,
      region: '인천',
      temperature: 20,
      humidity: 75,
      windSpeed: 5.5,
      windDirection: '북서',
      pressure: 1014,
      visibility: 6,
      condition: '비',
      lastUpdate: '2024-03-20 16:20',
      status: 'alert',
    },
    {
      id: 5,
      region: '광주',
      temperature: 24,
      humidity: 60,
      windSpeed: 3.8,
      windDirection: '남서',
      pressure: 1010,
      visibility: 9,
      condition: '구름많음',
      lastUpdate: '2024-03-20 16:32',
      status: 'normal',
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'alert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionIcon = (condition) => {
    switch (condition) {
      case '맑음':
        return <Sun className="h-5 w-5 text-yellow-500" />
      case '흐림':
        return <Cloud className="h-5 w-5 text-gray-500" />
      case '비':
        return <Droplets className="h-5 w-5 text-blue-500" />
      case '구름많음':
        return <Cloud className="h-5 w-5 text-gray-400" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Cloud className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                날씨 데이터 관리
              </h1>
              <p className="text-gray-600">
                실시간 날씨 데이터와 예보 정보를 관리합니다.
              </p>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">활성 센서</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-100">정상 지역</p>
                    <p className="text-2xl font-bold">142</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-100">경고 지역</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-100">알림 지역</p>
                    <p className="text-2xl font-bold">6</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 필터 및 액션 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 지역</SelectItem>
                  <SelectItem value="seoul">서울</SelectItem>
                  <SelectItem value="busan">부산</SelectItem>
                  <SelectItem value="daegu">대구</SelectItem>
                  <SelectItem value="incheon">인천</SelectItem>
                  <SelectItem value="gwangju">광주</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="데이터 타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 데이터</SelectItem>
                  <SelectItem value="temperature">온도</SelectItem>
                  <SelectItem value="humidity">습도</SelectItem>
                  <SelectItem value="wind">바람</SelectItem>
                  <SelectItem value="pressure">기압</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                데이터 새로고침
              </Button>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                데이터 내보내기
              </Button>

              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                데이터 가져오기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 날씨 데이터 테이블 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>실시간 날씨 데이터</CardTitle>
            <CardDescription>
              전국 주요 지역의 실시간 날씨 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지역</TableHead>
                  <TableHead>날씨</TableHead>
                  <TableHead>온도</TableHead>
                  <TableHead>습도</TableHead>
                  <TableHead>바람</TableHead>
                  <TableHead>기압</TableHead>
                  <TableHead>가시도</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>마지막 업데이트</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherData.map((data) => (
                  <TableRow key={data.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{data.region}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getConditionIcon(data.condition)}
                        <span>{data.condition}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="font-medium">
                          {data.temperature}°C
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>{data.humidity}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {data.windSpeed} m/s
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.windDirection}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>{data.pressure} hPa</span>
                    </TableCell>
                    <TableCell>
                      <span>{data.visibility} km</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(data.status)}`}
                      >
                        {data.status === 'normal'
                          ? '정상'
                          : data.status === 'warning'
                            ? '경고'
                            : '알림'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{data.lastUpdate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 추가 기능 카드 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 예보 관리 */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                예보 관리
              </CardTitle>
              <CardDescription>
                날씨 예보 데이터를 관리하고 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="h-12 w-full justify-start">
                <Calendar className="mr-3 h-5 w-5" />
                일일 예보 설정
              </Button>
              <Button variant="outline" className="h-12 w-full justify-start">
                <Calendar className="mr-3 h-5 w-5" />
                주간 예보 설정
              </Button>
              <Button variant="outline" className="h-12 w-full justify-start">
                <AlertTriangle className="mr-3 h-5 w-5" />
                특보 관리
              </Button>
              <Button variant="outline" className="h-12 w-full justify-start">
                <Settings className="mr-3 h-5 w-5" />
                예보 정확도 설정
              </Button>
            </CardContent>
          </Card>

          {/* 센서 관리 */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                센서 관리
              </CardTitle>
              <CardDescription>
                날씨 센서의 상태와 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">온도 센서</span>
                  <span className="text-sm font-semibold text-green-600">
                    정상
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '95%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">습도 센서</span>
                  <span className="text-sm font-semibold text-green-600">
                    정상
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '88%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">바람 센서</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    점검 필요
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{ width: '65%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">기압 센서</span>
                  <span className="text-sm font-semibold text-green-600">
                    정상
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '92%' }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 데이터 분석 */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                데이터 분석
              </CardTitle>
              <CardDescription>
                날씨 데이터 통계 및 분석 결과를 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-lg bg-purple-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">평균 온도</span>
                    <span className="text-lg font-bold text-purple-600">
                      23.8°C
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">평균 습도</span>
                    <span className="text-lg font-bold text-blue-600">65%</span>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">데이터 정확도</span>
                    <span className="text-lg font-bold text-green-600">
                      98.5%
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-orange-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">업데이트 빈도</span>
                    <span className="text-lg font-bold text-orange-600">
                      5분
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
