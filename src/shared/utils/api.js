export class ApiException extends Error {
  constructor(error, status = 500) {
    super(error.error.message)
    this.status = status
    this.code = error.error.code
    this.details = error.error.details
    this.name = 'ApiException'
  }
}

export const handleApiResponse = async (response) => {
  const data = await response.json()

  if (!response.ok) {
    throw new ApiException(data, response.status)
  }

  if (!data.success) {
    throw new ApiException(data)
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
