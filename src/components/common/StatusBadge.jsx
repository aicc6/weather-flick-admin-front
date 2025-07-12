import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status, type = 'active', className = '' }) {
  const getVariantAndText = () => {
    switch (type) {
      case 'active':
        return {
          variant: status ? 'success' : 'destructive',
          text: status ? '활성' : '비활성',
        }

      case 'role':
        return {
          variant: status ? 'success' : 'outline',
          text: status ? '슈퍼유저' : '일반 관리자',
        }

      case 'api':
        return {
          variant: status === '정상' ? 'success' : 'destructive',
          text: status,
        }

      case 'connection':
        return {
          variant: status === '연결됨' ? 'success' : 'destructive',
          text: status,
        }

      case 'custom':
        // 커스텀 상태값을 그대로 사용
        return {
          variant: getVariantFromStatus(status),
          text: status,
        }

      default:
        return {
          variant: 'outline',
          text: status?.toString() || '알 수 없음',
        }
    }
  }

  const getVariantFromStatus = (status) => {
    const successStatuses = [
      '정상',
      '활성',
      '연결됨',
      '성공',
      'active',
      'success',
      'online',
    ]
    const errorStatuses = [
      '오류',
      '비활성',
      '연결 끊김',
      '실패',
      'inactive',
      'error',
      'offline',
    ]

    const statusStr = status?.toString().toLowerCase()

    if (successStatuses.some((s) => statusStr?.includes(s))) {
      return 'success'
    }
    if (errorStatuses.some((s) => statusStr?.includes(s))) {
      return 'destructive'
    }
    return 'outline'
  }

  const { variant, text } = getVariantAndText()

  return (
    <Badge variant={variant} className={className}>
      {text}
    </Badge>
  )
}
