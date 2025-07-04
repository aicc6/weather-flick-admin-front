import { MapPin, Globe, CheckCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

export function TourismStatsCard({ tourSummary }) {
  // 최근 관광지 3개에서 유니크 카테고리/지역 개수 계산
  const uniqueCategories = new Set(
    tourSummary.items.map((a) => a.category_name || a.category_code),
  ).size

  const uniqueRegions = new Set(tourSummary.items.map((a) => a.region_code))
    .size

  return (
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
  )
}
