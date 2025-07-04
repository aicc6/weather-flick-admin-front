import { Users, Settings, Database } from 'lucide-react'
import { PageLayout } from '../layouts/PageLayout'
import { StatsGrid } from '../layouts/StatsGrid'
import { FormLayout } from '../layouts/FormLayout'
import { StandardCard } from '../common/StandardCard'
import { StatusBadge } from '../common/StatusBadge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export function StyleguideDemo() {
  return (
    <PageLayout
      title="스타일 가이드 데모"
      description="새로운 유틸리티 클래스와 컴포넌트들의 사용 예시"
      icon={Settings}
      action={<Button>액션 버튼</Button>}
    >
      {/* 통계 그리드 */}
      <StatsGrid columns={3}>
        <StandardCard
          title="사용자"
          description="총 사용자 수"
          icon={Users}
          iconColor="text-blue-500"
        >
          <div className="flex-col-center">
            <span className="text-primary text-2xl font-bold">1,234</span>
            <StatusBadge status={true} type="active" />
          </div>
        </StandardCard>

        <StandardCard
          title="서버 상태"
          description="시스템 모니터링"
          icon={Database}
          iconColor="text-green-500"
        >
          <div className="form-layout">
            <div className="flex-between">
              <span>CPU</span>
              <StatusBadge status="정상" type="api" />
            </div>
            <div className="flex-between">
              <span>메모리</span>
              <StatusBadge status="정상" type="api" />
            </div>
          </div>
        </StandardCard>

        <StandardCard
          title="활동"
          description="최근 활동 내역"
          icon={Settings}
          iconColor="text-purple-500"
        >
          <div className="section-layout text-sm">
            <div className="text-muted-foreground">최근 로그인: 5분 전</div>
            <div className="text-muted-foreground">업데이트: 1시간 전</div>
          </div>
        </StandardCard>
      </StatsGrid>

      {/* 폼 레이아웃 데모 */}
      <StandardCard
        title="폼 레이아웃 예시"
        description="새로운 FormLayout 컴포넌트 사용"
      >
        <FormLayout
          onSubmit={(e) => {
            e.preventDefault()
            alert('폼 제출!')
          }}
          onCancel={() => alert('취소됨')}
        >
          <div className="form-field">
            <Label htmlFor="name">이름</Label>
            <Input id="name" placeholder="이름을 입력하세요" />
          </div>

          <div className="form-field">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="이메일을 입력하세요" />
          </div>

          <div className="form-row">
            <div className="form-field flex-1">
              <Label htmlFor="role">역할</Label>
              <Input id="role" placeholder="역할" />
            </div>
            <div className="form-field">
              <Label htmlFor="status">상태</Label>
              <StatusBadge status={true} type="active" />
            </div>
          </div>
        </FormLayout>
      </StandardCard>

      {/* 유틸리티 클래스 데모 */}
      <StandardCard
        title="유틸리티 클래스 예시"
        description="새로운 CSS 유틸리티 클래스들"
      >
        <div className="section-layout">
          <div className="flex-between">
            <span className="page-title">페이지 제목 스타일</span>
            <Button variant="outline">버튼</Button>
          </div>

          <div className="button-group">
            <Button size="sm">버튼 1</Button>
            <Button size="sm" variant="outline">
              버튼 2
            </Button>
            <Button size="sm" variant="ghost">
              버튼 3
            </Button>
          </div>

          <div className="stats-grid-4">
            <div className="card-wrapper card-content-padded">
              <div className="flex-center text-primary">
                <Users className="h-8 w-8" />
              </div>
            </div>
            <div className="card-wrapper card-content-padded">
              <div className="flex-center text-success">
                <Database className="h-8 w-8" />
              </div>
            </div>
            <div className="card-wrapper card-content-padded">
              <div className="flex-center text-warning">
                <Settings className="h-8 w-8" />
              </div>
            </div>
            <div className="card-wrapper card-content-padded">
              <div className="flex-center text-danger">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </StandardCard>
    </PageLayout>
  )
}
