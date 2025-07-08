import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '../ui/card'
import { Button } from '../ui/button'

export default function ContentDetailPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/travel-courses/${contentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.')
        return res.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [contentId])

  if (loading) return <div className="p-8 text-center">불러오는 중...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!data) return null

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>코스 상세</CardTitle>
          <CardDescription>{data.course_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
              목록으로
            </Button>
          </div>
          <div className="space-y-4">
            {data.first_image && (
              <img
                src={data.first_image}
                alt={data.course_name}
                className="max-h-64 w-full rounded object-cover"
              />
            )}
            <div>
              <b>지역코드:</b> {data.region_code}
            </div>
            <div>
              <b>시군구 코드:</b> {data.sigungu_code}
            </div>
            {data.address && (
              <div>
                <b>주소:</b> {data.address}
              </div>
            )}
            {data.detail_address && (
              <div>
                <b>상세 주소:</b> {data.detail_address}
              </div>
            )}
            {data.zipcode && (
              <div>
                <b>우편번호:</b> {data.zipcode}
              </div>
            )}
            {data.tel && (
              <div>
                <b>전화번호:</b> {data.tel}
              </div>
            )}
            {data.homepage && (
              <div>
                <b>홈페이지:</b>{' '}
                <a
                  href={data.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {data.homepage}
                </a>
              </div>
            )}
            {data.overview && (
              <div>
                <b>개요:</b> {data.overview}
              </div>
            )}
            {data.course_theme && (
              <div>
                <b>코스 테마:</b> {data.course_theme}
              </div>
            )}
            {data.course_distance && (
              <div>
                <b>코스 거리:</b> {data.course_distance}
              </div>
            )}
            {data.required_time && (
              <div>
                <b>소요 시간:</b> {data.required_time}
              </div>
            )}
            {data.difficulty_level && (
              <div>
                <b>난이도:</b> {data.difficulty_level}
              </div>
            )}
            {data.schedule && (
              <div>
                <b>일정:</b> {data.schedule}
              </div>
            )}
            <div>
              <b>생성일:</b> {data.created_at?.slice(0, 10) || '-'}
            </div>
            {data.raw_data_id && (
              <div>
                <b>원본 데이터 ID:</b> {data.raw_data_id}
              </div>
            )}
            {data.data_quality_score && (
              <div>
                <b>데이터 품질 점수:</b> {data.data_quality_score}
              </div>
            )}
            {data.booktour && (
              <div>
                <b>북투어:</b> {data.booktour}
              </div>
            )}
            {data.createdtime && (
              <div>
                <b>생성 시간(원본):</b> {data.createdtime}
              </div>
            )}
            {data.modifiedtime && (
              <div>
                <b>수정 시간(원본):</b> {data.modifiedtime}
              </div>
            )}
            {data.telname && (
              <div>
                <b>전화명:</b> {data.telname}
              </div>
            )}
            {data.faxno && (
              <div>
                <b>팩스번호:</b> {data.faxno}
              </div>
            )}
            {data.mlevel && (
              <div>
                <b>레벨:</b> {data.mlevel}
              </div>
            )}
            {data.detail_intro_info && (
              <div>
                <b>상세 소개 정보:</b>{' '}
                {typeof data.detail_intro_info === 'object'
                  ? JSON.stringify(data.detail_intro_info)
                  : data.detail_intro_info}
              </div>
            )}
            {data.detail_additional_info && (
              <div>
                <b>상세 추가 정보:</b>{' '}
                {typeof data.detail_additional_info === 'object'
                  ? JSON.stringify(data.detail_additional_info)
                  : data.detail_additional_info}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
