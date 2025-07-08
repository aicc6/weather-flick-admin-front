import { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '../ui/card'
import { Accordion, AccordionItem } from '../ui/accordion'
// MapComponent는 실제 지도 컴포넌트로 교체 필요
// import MapComponent from '../common/MapComponent';
import { authHttp } from '../../lib/http'

export default function TouristAttractionDetail({
  contentId,
  onEdit,
  onDelete,
  onBack,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await authHttp.GET(`/api/tourist-attractions/${contentId}`)
        if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.')
        const result = await res.json()
        setData(result)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (contentId) fetchData()
  }, [contentId])

  if (loading)
    return <div className="py-16 text-center text-gray-500">불러오는 중...</div>
  if (error)
    return <div className="py-16 text-center text-red-500">{error}</div>
  if (!data) return null

  const REGION_MAP = {
    11: '서울',
    26: '부산',
    27: '대구',
    28: '인천',
    29: '광주',
    30: '대전',
    31: '울산',
    36: '세종',
    41: '경기',
    42: '강원',
    43: '충북',
    44: '충남',
    45: '전북',
    46: '전남',
    47: '경북',
    48: '경남',
    50: '제주',
  }

  return (
    <Card className="mx-auto mt-8 max-w-4xl p-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {data.attraction_name}
        </CardTitle>
        <CardDescription className="mt-1 flex gap-2 text-sm text-gray-500">
          <span>{data.category_name}</span>
          <span>|</span>
          <span>{REGION_MAP[data.region_code] || data.region_code}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* 이미지 */}
          <div className="flex-shrink-0 md:w-1/3">
            {data.image_url ? (
              <img
                src={data.image_url}
                alt={data.attraction_name}
                className="h-64 w-full rounded object-cover shadow"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded bg-gray-100 text-gray-400">
                이미지 없음
              </div>
            )}
          </div>
          {/* 주요 정보 */}
          <div className="flex flex-col gap-2 md:w-2/3">
            <div className="mt-2 whitespace-pre-line text-gray-700">
              {data.description}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <b>주소:</b> {data.address}
              </div>
              <div>
                <b>홈페이지:</b>{' '}
                {data.homepage ? (
                  <a
                    href={data.homepage}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {data.homepage}
                  </a>
                ) : (
                  '-'
                )}
              </div>
              <div>
                <b>전화:</b> {data.telname || '-'}
              </div>
              <div>
                <b>팩스:</b> {data.faxno || '-'}
              </div>
              <div>
                <b>우편번호:</b> {data.zipcode || '-'}
              </div>
              <div>
                <b>북투어:</b> {data.booktour || '-'}
              </div>
              <div>
                <b>레벨:</b> {data.mlevel || '-'}
              </div>
            </div>
          </div>
        </div>
        {/* 상세/추가 정보 */}
        <div className="mt-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="intro" title="상세 소개 정보">
              <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                {data.detail_intro_info
                  ? JSON.stringify(data.detail_intro_info, null, 2)
                  : '없음'}
              </pre>
            </AccordionItem>
            <AccordionItem value="add" title="상세 추가 정보">
              <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                {data.detail_additional_info
                  ? JSON.stringify(data.detail_additional_info, null, 2)
                  : '없음'}
              </pre>
            </AccordionItem>
          </Accordion>
        </div>
        {/* 지도 */}
        {data.latitude && data.longitude && (
          <div className="mt-6">
            {/* <MapComponent lat={data.latitude} lng={data.longitude} /> */}
            <div className="flex h-64 w-full items-center justify-center rounded bg-gray-100 text-gray-400">
              지도 컴포넌트 자리
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-6 flex flex-col items-center justify-between gap-2 md:flex-row">
        <div className="text-xs text-gray-400">
          등록일: {data.createdtime || '-'} | 수정일: {data.modifiedtime || '-'}{' '}
          | 품질: {data.data_quality_score || '-'} | 상태:{' '}
          {data.processing_status || '-'}
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => onEdit && onEdit(data.content_id)}
          >
            수정
          </button>
          <button
            className="btn btn-destructive"
            onClick={() => onDelete && onDelete(data.content_id)}
          >
            삭제
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            목록으로
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}
