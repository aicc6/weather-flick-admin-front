import { useEffect, useState } from 'react'
import { authHttp } from '@/lib/http'
import {
  StyledCard,
  StyledCardHeader,
  StyledCardContent,
  FormField,
  StandardInput,
  StandardSelect,
  StandardButton,
} from '@/components/common'
import { CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

const emptyForm = {
  content_id: '',
  attraction_name: '',
  description: '',
  address: '',
  image_url: '',
  latitude: '',
  longitude: '',
  category_code: '',
  category_name: '',
  region_code: '',
  homepage: '',
  booktour: '',
  createdtime: '',
  modifiedtime: '',
  telname: '',
  faxno: '',
  zipcode: '',
  mlevel: '',
  data_quality_score: '',
  processing_status: '',
  last_sync_at: '',
  detail_intro_info: '',
  detail_additional_info: '',
}

const fieldLabels = {
  attraction_name: '관광지명',
  description: '설명',
  address: '주소',
  image_url: '이미지 URL',
  latitude: '위도',
  longitude: '경도',
  category_code: '카테고리 코드',
  category_name: '카테고리명',
  region_code: '지역코드',
  homepage: '홈페이지',
  booktour: '북투어',
  createdtime: '생성시간',
  modifiedtime: '수정시간',
  telname: '전화명',
  faxno: '팩스번호',
  zipcode: '우편번호',
  mlevel: '레벨',
  data_quality_score: '데이터 품질 점수',
  processing_status: '처리상태',
  last_sync_at: '최종 동기화',
  detail_intro_info: '상세 소개 정보',
  detail_additional_info: '상세 추가 정보',
}

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

export default function TouristAttractionForm({ contentId, onDone }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    const loadData = async () => {
      if (contentId) {
        try {
          const res = await authHttp.GET(
            `/api/tourist-attractions/${contentId}`,
          )
          const data = await res.json()
          setForm(data)
        } catch (error) {
          console.error('관광지 데이터 로딩 실패:', error)
          alert('데이터를 불러오는데 실패했습니다.')
        }
      } else {
        setForm(emptyForm)
      }
    }
    loadData()
  }, [contentId])

  const handleChange = (e) => {
    if (!e || !e.target) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    try {
      const endpoint = contentId
        ? `/api/tourist-attractions/${contentId}`
        : '/api/tourist-attractions/'

      if (contentId) {
        await authHttp.PUT(endpoint, { body: form })
      } else {
        await authHttp.POST(endpoint, { body: form })
      }
      onDone()
    } catch (error) {
      console.error('관광지 저장 실패:', error)
      alert('저장에 실패했습니다.')
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-2">
      <StyledCard className="w-full max-w-3xl">
        <form onSubmit={handleSubmit}>
          <StyledCardHeader>
            <CardTitle>{contentId ? '관광지 수정' : '관광지 등록'}</CardTitle>
            <CardDescription>
              {contentId
                ? '관광지 정보를 수정합니다.'
                : '새로운 관광지 정보를 등록합니다.'}
            </CardDescription>
          </StyledCardHeader>
          <StyledCardContent>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.keys(emptyForm).map((key) =>
                key === 'region_code' ? (
                  <FormField key={key} label={fieldLabels[key]}>
                    <StandardSelect
                      value={form[key] || 'none'}
                      onValueChange={(value) =>
                        setForm({
                          ...form,
                          [key]: value === 'none' ? '' : value,
                        })
                      }
                      placeholder="지역 선택"
                      options={[
                        { value: 'none', label: '지역 선택' },
                        ...Object.entries(REGION_MAP).map(([code, name]) => ({
                          value: code,
                          label: name,
                        })),
                      ]}
                    />
                  </FormField>
                ) : (
                  <FormField key={key} label={fieldLabels[key]}>
                    <StandardInput
                      id={key}
                      name={key}
                      value={form[key] || ''}
                      onChange={handleChange}
                    />
                  </FormField>
                ),
              )}
            </div>
          </StyledCardContent>
          <CardFooter className="mt-4 justify-end gap-2">
            <StandardButton type="button" variant="outline" onClick={onDone}>
              취소
            </StandardButton>
            <StandardButton type="submit" variant="primary">
              저장
            </StandardButton>
          </CardFooter>
        </form>
      </StyledCard>
    </div>
  )
}
