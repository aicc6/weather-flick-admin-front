import { authHttp, http } from '../../../lib/http'
import { handleApiResponse } from '../../../shared/utils/api'

export const authApi = {
  async login(credentials) {
    const response = await http.POST('/auth/login', {
      body: credentials,
    })
    return handleApiResponse(response)
  },

  async getCurrentUser() {
    const response = await authHttp.GET('/auth/me')
    return handleApiResponse(response)
  },

  async logout() {
    const response = await authHttp.POST('/auth/logout')
    return handleApiResponse(response)
  },

  async refreshToken() {
    const response = await authHttp.POST('/auth/refresh')
    return handleApiResponse(response)
  },
}
