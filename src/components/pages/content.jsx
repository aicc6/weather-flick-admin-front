import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  MapPin,
  Plus,
  Search,
  Settings,
  TrendingUp,
  CheckCircle,
  BarChart2,
} from 'lucide-react'
import { Badge } from '../ui/badge'

export const ContentPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">컨텐츠 관리</h2>
        <p className="text-muted-foreground">
          여행지 정보와 추천 알고리즘을 관리할 수 있습니다.
        </p>
      </div>

      <Tabs defaultValue="destinations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="destinations">여행지 관리</TabsTrigger>
          <TabsTrigger value="recommendations">추천 알고리즘</TabsTrigger>
          <TabsTrigger value="analytics">성과 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="space-y-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="여행지 검색..."
                className="w-[300px] rounded-lg pl-8 shadow-sm"
              />
            </div>
            <Button className="rounded-lg">
              <Plus className="mr-2 h-4 w-4" />새 여행지 추가
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col items-center justify-center p-4">
              <MapPin className="mb-1 h-7 w-7 text-blue-500" />
              <span className="font-semibold">전체 여행지</span>
              <span className="text-lg font-bold text-blue-700">2,845</span>
              <Badge variant="outline" className="mt-1">
                활성
              </Badge>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4">
              <TrendingUp className="mb-1 h-7 w-7 text-green-500" />
              <span className="font-semibold">인기 여행지</span>
              <span className="text-lg font-bold text-green-700">156</span>
              <Badge variant="success" className="mt-1">
                추천 1.5+
              </Badge>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4">
              <Plus className="mb-1 h-7 w-7 text-purple-500" />
              <span className="font-semibold">신규 등록</span>
              <span className="text-lg font-bold text-purple-700">12</span>
              <Badge variant="outline" className="mt-1">
                이번 주
              </Badge>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4">
              <Settings className="mb-1 h-7 w-7 text-yellow-500" />
              <span className="font-semibold">승인 대기</span>
              <span className="text-lg font-bold text-yellow-700">5</span>
              <Badge variant="destructive" className="mt-1">
                검토 필요
              </Badge>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>여행지 목록</CardTitle>
                <CardDescription>
                  등록된 모든 여행지를 확인하고 관리할 수 있습니다.
                </CardDescription>
              </div>
              <BarChart2 className="h-6 w-6 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  여행지 목록 테이블이 여기에 표시됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>추천 알고리즘 설정</CardTitle>
                <CardDescription>
                  날씨 기반 추천 시스템의 가중치를 조정할 수 있습니다.
                </CardDescription>
              </div>
              <Settings className="h-6 w-6 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  추천 알고리즘 설정 패널이 여기에 표시됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>성과 분석</CardTitle>
                <CardDescription>
                  추천 시스템의 성능과 사용자 만족도를 분석합니다.
                </CardDescription>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  성과 분석 차트가 여기에 표시됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
