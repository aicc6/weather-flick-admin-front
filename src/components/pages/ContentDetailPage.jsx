import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '../ui/card'
import { Button } from '../ui/button'
import { REGION_MAP } from '../../constants/region'
import { useGetTravelCourseByIdQuery } from '../../store/api/contentApi'

export default function ContentDetailPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()

  // RTK Query를 사용한 데이터 페칭
  const {
    data,
    isLoading: loading,
    error,
  } = useGetTravelCourseByIdQuery(contentId)

  if (loading) return <div className="p-8 text-center">불러오는 중...</div>
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        {error.data?.message || '데이터를 불러올 수 없습니다.'}
      </div>
    )
  if (!data) return null

  function formatRawDate(raw) {
    if (!raw || raw.length !== 14) return raw
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}:${raw.slice(12, 14)}`
  }

  function isEmptyDetailInfo(obj) {
    if (!obj || typeof obj !== 'object') return true
    return Object.values(obj).every(
      (v) =>
        v == null ||
        (typeof v === 'object' && isEmptyDetailInfo(v)) ||
        (typeof v === 'string' && v.trim() === '') ||
        (Array.isArray(v) && v.length === 0),
    )
  }

  function formatDetailInfo(obj) {
    if (!obj || isEmptyDetailInfo(obj)) return '정보 없음'
    return JSON.stringify(obj)
  }

  function Section({ title, children }) {
    return (
      <div className="mb-6">
        <div className="mb-2 text-base font-semibold text-gray-800">
          {title}
        </div>
        <div className="space-y-1 pl-2">{children}</div>
      </div>
    )
  }

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
          <CardTitle>{data.course_name}</CardTitle>
          <CardDescription>{data.overview}</CardDescription>
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
              alt={data.course_name}
              className="mb-6 max-h-64 w-full rounded object-cover"
            />
          )}
          <Section title="기본 정보">
            <Info label="지역" value={REGION_MAP[data.region_code]} />
            <Info label="주소" value={data.address} />
            <Info label="상세 주소" value={data.detail_address} />
            <Info label="우편번호" value={data.zipcode} />
            <Info label="전화번호" value={data.tel} />
            <Info label="홈페이지" value={data.homepage} isLink />
          </Section>
          <Section title="부가 정보">
            <Info label="코스 테마" value={data.course_theme} />
            <Info label="코스 거리" value={data.course_distance} />
            <Info label="소요 시간" value={data.required_time} />
            <Info label="난이도" value={data.difficulty_level} />
            <Info label="일정" value={data.schedule} />
          </Section>
          <Section title="생성/수정 정보">
            <Info label="생성일" value={data.created_at?.slice(0, 10)} />
            <Info
              label="생성 시간(원본)"
              value={formatRawDate(data.createdtime)}
            />
            <Info
              label="수정 시간(원본)"
              value={formatRawDate(data.modifiedtime)}
            />
          </Section>
          <Section title="상세 정보">
            <Info
              label="상세 소개 정보"
              value={formatDetailInfo(data.detail_intro_info)}
            />
            <Info
              label="상세 추가 정보"
              value={formatDetailInfo(data.detail_additional_info)}
            />
          </Section>
        </CardContent>
      </Card>
    </div>
  )
}
