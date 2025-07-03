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
import { MapPin, Plus, Search, Settings, TrendingUp } from 'lucide-react'

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
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input placeholder="여행지 검색..." className="w-[300px] pl-8" />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />새 여행지 추가
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  전체 여행지
                </CardTitle>
                <MapPin className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,845</div>
                <p className="text-muted-foreground text-xs">
                  활성 여행지 개수
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  인기 여행지
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-muted-foreground text-xs">
                  추천 가중치 1.5 이상
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">신규 등록</CardTitle>
                <Plus className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-muted-foreground text-xs">
                  이번 주 신규 등록
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <Settings className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-muted-foreground text-xs">
                  검토 필요한 여행지
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>여행지 목록</CardTitle>
              <CardDescription>
                등록된 모든 여행지를 확인하고 관리할 수 있습니다.
              </CardDescription>
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
            <CardHeader>
              <CardTitle>추천 알고리즘 설정</CardTitle>
              <CardDescription>
                날씨 기반 추천 시스템의 가중치를 조정할 수 있습니다.
              </CardDescription>
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
            <CardHeader>
              <CardTitle>성과 분석</CardTitle>
              <CardDescription>
                추천 시스템의 성능과 사용자 만족도를 분석합니다.
              </CardDescription>
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
