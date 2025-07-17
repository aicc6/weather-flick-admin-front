import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetFestivalEventByIdQuery } from '@/store/api/contentApi'
import { REGION_MAP } from '@/constants/region'

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div
        style={{ minWidth: 90, fontWeight: 600, color: '#333', fontSize: 16 }}
      >
        {label}
      </div>
      <div
        style={{ flex: 1, color: '#444', fontSize: 16, wordBreak: 'break-all' }}
      >
        {value}
      </div>
    </div>
  )
}

export default function FestivalEventDetailPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetFestivalEventByIdQuery(contentId)

  if (isLoading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>불러오는 중...</div>
    )
  if (error)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#d32f2f' }}>
        {error.data?.message || '데이터를 불러올 수 없습니다.'}
      </div>
    )
  if (!data) return null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* 이미지 + 제목 오버레이 */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
          {data.first_image ? (
            <img
              src={data.first_image}
              alt={data.event_name}
              style={{
                width: '100%',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                objectFit: 'cover',
                minHeight: 240,
                maxHeight: 400,
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                minHeight: 240,
                maxHeight: 400,
                borderRadius: 16,
                background: '#f3f4f6',
                color: '#aaa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 500,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
            >
              이미지 없음
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.55) 100%)',
              color: '#fff',
              borderRadius: '0 0 16px 16px',
              padding: '32px 24px 20px 24px',
              textAlign: 'left',
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-1px',
              textShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            {data.event_name}
          </div>
        </div>
        {/* 정보 카드 */}
        <div
          style={{
            width: '100%',
            maxWidth: 700,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* 설명(overview) 섹션 - 맨 위 */}
          {data.overview && (
            <div
              style={{
                marginBottom: 24,
                padding: '0 0 18px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  marginBottom: 8,
                  color: '#333',
                }}
              >
                축제/이벤트 소개
              </div>
              <div style={{ color: '#555', fontSize: 16, lineHeight: 1.7 }}>
                {data.overview}
              </div>
            </div>
          )}
          <InfoRow
            label="지역"
            value={REGION_MAP[data.region_code] || data.region_code}
          />
          <InfoRow label="장소" value={data.event_place} />
          <InfoRow
            label="기간"
            value={
              data.event_start_date && data.event_end_date
                ? `${data.event_start_date} ~ ${data.event_end_date}`
                : '-'
            }
          />
          <InfoRow label="전화번호" value={data.tel} />
          <InfoRow label="홈페이지" value={data.homepage} />
          <InfoRow label="생성일" value={data.created_at?.slice(0, 10)} />
          <InfoRow label="수정일" value={data.updated_at?.slice(0, 10)} />
          {/* 목록으로 돌아가기 버튼 */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = '#1565c0')
              }
              onMouseOut={(e) => (e.currentTarget.style.background = '#1976d2')}
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
