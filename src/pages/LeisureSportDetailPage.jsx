import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

function LeisureSportDetailPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['leisure-sport', contentId],
    queryFn: () =>
      fetch(`/api/leisure-sports/${contentId}`).then((res) => res.json()),
    enabled: !!contentId,
  })

  if (isLoading)
    return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>
  if (error || data?.error)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#d32f2f' }}>
        데이터를 불러올 수 없습니다.
      </div>
    )

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
        {/* 이미지 및 제목 오버레이 부분 삭제 */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
          {data.first_image && (
            <img
              src={data.first_image}
              alt={data.facility_name}
              style={{
                width: '100%',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                objectFit: 'cover',
                minHeight: 240,
                maxHeight: 400,
              }}
            />
          )}
          {/* 제목 오버레이 */}
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
            {data.facility_name}
          </div>
        </div>
        {/* 대신 제목만 단독으로 표시 */}
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            margin: '0 auto',
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          {data.facility_name}
        </div>
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
          {/* 설명(overview) 섹션 - 맨 위로 이동 */}
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
                시설 소개
              </div>
              <div style={{ color: '#555', fontSize: 16, lineHeight: 1.7 }}>
                {data.overview}
              </div>
            </div>
          )}
          <InfoRow
            label="주소"
            value={`${data.address || ''} ${data.detail_address || ''}`}
          />
          <InfoRow label="입장료" value={data.admission_fee} />
          <InfoRow label="운영시간" value={data.operating_hours} />
          <InfoRow label="예약" value={data.reservation_info} />
          <InfoRow label="주차" value={data.parking_info} />
          <InfoRow label="장비대여" value={data.rental_info} />
          <InfoRow label="수용인원" value={data.capacity} />
          <InfoRow label="연락처" value={data.tel} />
          {/* 홈페이지 InfoRow 제거, 아래에 목록으로 돌아가기 버튼 추가 */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={() => navigate('/content')}
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

export default LeisureSportDetailPage
