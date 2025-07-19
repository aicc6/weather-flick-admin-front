import { STORAGE_KEYS } from '@/constants/storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  
  console.log('Contact API - Token:', token ? 'exists' : 'missing', 'URL:', url)

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    console.error('Contact API Error:', response.status, response.statusText)
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

export const contactApi = {
  // 문의 목록 조회
  getContacts: async (params) => {
    const queryParams = new URLSearchParams()
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    return apiRequest(
      `/api/contacts/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    )
  },

  // 문의 통계 조회
  getContactStats: async () => {
    return apiRequest('/api/contacts/stats')
  },

  // 문의 카테고리 목록 조회
  getCategories: async () => {
    return apiRequest('/api/contacts/categories')
  },

  // 문의 상세 조회
  getContact: async (contactId) => {
    return apiRequest(`/api/contacts/${contactId}`)
  },

  // 문의 상태 변경
  updateContactStatus: async (contactId, data) => {
    return apiRequest(`/api/contacts/${contactId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // 문의 답변 작성
  createAnswer: async (contactId, data) => {
    return apiRequest(`/api/contacts/${contactId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 문의 답변 수정
  updateAnswer: async (contactId, data) => {
    return apiRequest(`/api/contacts/${contactId}/answer`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 문의 답변 삭제
  deleteAnswer: async (contactId) => {
    return apiRequest(`/api/contacts/${contactId}/answer`, {
      method: 'DELETE',
    })
  },
}
