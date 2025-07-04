import { useEffect, useState } from 'react'
import { authHttp } from '../../../lib/http'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '../../ui/card'

const emptyForm = {
  attraction_name: '',
  description: '',
  address: '',
  image_url: '',
  latitude: '',
  longitude: '',
  category_code: '',
  category_name: '',
  region_code: '',
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
}

export default function TouristAttractionForm({ contentId, onDone }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    const loadData = async () => {
      if (contentId) {
        try {
          const res = await authHttp.GET(`/tourist-attractions/${contentId}`)
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
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const endpoint = contentId
        ? `/tourist-attractions/${contentId}`
        : '/tourist-attractions/'

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
      <Card className="w-full max-w-3xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{contentId ? '관광지 수정' : '관광지 등록'}</CardTitle>
            <CardDescription>
              {contentId
                ? '관광지 정보를 수정합니다.'
                : '새로운 관광지 정보를 등록합니다.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.keys(emptyForm).map((key) => (
                <div key={key} className="flex flex-col gap-2">
                  <label
                    htmlFor={key}
                    className="text-sm font-medium text-gray-600"
                  >
                    {fieldLabels[key]}
                  </label>
                  <input
                    id={key}
                    name={key}
                    value={form[key] || ''}
                    onChange={handleChange}
                    className="rounded border px-3 py-2 text-base focus:outline-blue-500"
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="mt-4 justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary rounded border border-blue-600 px-5 py-2 text-base text-blue-600"
              onClick={onDone}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded bg-blue-600 px-5 py-2 text-base text-white"
            >
              저장
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
