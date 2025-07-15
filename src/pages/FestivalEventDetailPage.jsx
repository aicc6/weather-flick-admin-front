import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { REGION_MAP } from '@/constants/region'
import { useGetFestivalEventByIdQuery } from '@/store/api/contentApi'

export default function FestivalEventDetailPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()

  const {
    data,
    isLoading: loading,
    error,
  } = useGetFestivalEventByIdQuery(contentId)

  if (loading) return <div className="p-8 text-center">불러오는 중...</div>
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        {error.data?.message || '데이터를 불러올 수 없습니다.'}
      </div>
    )
  if (!data) return null

  function Info({ label, value, isLink }) {
    if (!value || value === '' || value === '정보 없음') {
      return null
    }
    if (isLink) {
      return (
        <div>
          <b>{label}:</b>{' '}
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {value}
          </a>
        </div>
      )
    }
    return (
      <div>
        <b>{label}:</b> {value}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{data.event_name}</CardTitle>
          <CardDescription>{data.event_place}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
              목록으로
            </Button>
          </div>
          {data.first_image && (
            <img
              src={data.first_image}
              alt={data.event_name}
              className="mb-6 max-h-64 w-full rounded object-cover"
            />
          )}
          <div className="mb-6">
            <div className="mb-2 text-base font-semibold text-gray-800">
              기본 정보
            </div>
            <div className="space-y-1 pl-2">
              <Info label="지역" value={REGION_MAP[data.region_code]} />
              <Info label="장소" value={data.event_place} />
              <Info
                label="기간"
                value={
                  data.event_start_date && data.event_end_date
                    ? `${data.event_start_date} ~ ${data.event_end_date}`
                    : '-'
                }
              />
              <Info label="전화번호" value={data.tel} />
              <Info label="홈페이지" value={data.homepage} isLink />
            </div>
          </div>
          <div className="mb-6">
            <div className="mb-2 text-base font-semibold text-gray-800">
              상세 정보
            </div>
            <div className="space-y-1 pl-2">
              <Info
                label="상세 설명"
                value={data.overview || data.description}
              />
            </div>
          </div>
          <div className="mb-6">
            <div className="mb-2 text-base font-semibold text-gray-800">
              생성/수정 정보
            </div>
            <div className="space-y-1 pl-2">
              <Info label="생성일" value={data.created_at?.slice(0, 10)} />
              <Info label="수정일" value={data.updated_at?.slice(0, 10)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
