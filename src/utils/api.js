export function createApiException(error, status = 500) {
  const exception = new Error(error.error.message)
  exception.status = status
  exception.code = error.error.code
  exception.details = error.error.details
  exception.name = 'ApiException'
  return exception
}

export const handleApiResponse = async (response) => {
  const data = await response.json()

  if (!response.ok) {
    throw createApiException(data, response.status)
  }

  if (!data.success) {
    throw createApiException(data)
  }

  return data.data
}

export const createQueryString = (params) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}
