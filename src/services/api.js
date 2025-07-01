import { authHttp, http } from '../lib/http'

class ApiService {
  // Auth endpoints
  async login(email, password) {
    try {
      const response = await http.POST('/auth/login', {
        body: { email, password },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Login failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Login API error:', error)
      throw error
    }
  }

  async getCurrentUser() {
    const response = await authHttp.GET('/auth/me')
    return await response.json()
  }

  // Admin management endpoints
  async getAdmins(page = 1, size = 10, search = '', status = '') {
    const params = { page, size }
    if (search) params.search = search
    if (status) params.status = status

    const response = await authHttp.GET('/auth/admins', {
      params: { query: params },
    })
    return await response.json()
  }

  async createAdmin(adminData) {
    const response = await authHttp.POST('/auth/register', {
      body: adminData,
    })
    return await response.json()
  }

  async updateAdmin(adminId, adminData) {
    const response = await authHttp.PUT(`/auth/admins/${adminId}`, {
      body: adminData,
    })
    return await response.json()
  }

  async deleteAdmin(adminId) {
    const response = await authHttp.DELETE(`/auth/admins/${adminId}`)
    return await response.json()
  }

  async activateAdmin(adminId) {
    const response = await authHttp.PUT(`/auth/admins/${adminId}/status`, {
      body: { status: 'ACTIVE' },
    })
    return await response.json()
  }

  async deactivateAdmin(adminId) {
    const response = await authHttp.PUT(`/auth/admins/${adminId}/status`, {
      body: { status: 'INACTIVE' },
    })
    return await response.json()
  }

  async deleteAdminPermanently(adminId) {
    const response = await authHttp.DELETE(`/auth/admins/${adminId}/permanent`)
    return await response.json()
  }

  async resetAdminPassword(adminId) {
    const response = await authHttp.POST(
      `/auth/admins/${adminId}/reset-password`,
    )
    return await response.json()
  }

  // User management endpoints
  async getUsers(page = 1, size = 10, search = '', role = '', isActive = null) {
    const params = { page, size }
    if (search) {
      params.email = search
      params.nickname = search
    }
    if (role) params.role = role
    if (isActive !== null) params.is_active = isActive

    const response = await authHttp.GET('/users/', {
      params: { query: params },
    })
    return await response.json()
  }

  async getUserStats() {
    const response = await authHttp.GET('/users/stats')
    return await response.json()
  }

  async getUserById(userId) {
    const response = await authHttp.GET(`/users/${userId}`)
    return await response.json()
  }

  async createUser(userData) {
    const response = await authHttp.POST('/users/', {
      body: userData,
    })
    return await response.json()
  }

  async updateUser(userId, userData) {
    const response = await authHttp.PUT(`/users/${userId}`, {
      body: userData,
    })
    return await response.json()
  }

  async deleteUser(userId) {
    const response = await authHttp.DELETE(`/users/${userId}`)
    return await response.json()
  }

  async activateUser(userId) {
    const response = await authHttp.POST(`/users/${userId}/activate`)
    return await response.json()
  }

  async deactivateUser(userId) {
    const response = await authHttp.POST(`/users/${userId}/deactivate`)
    return await response.json()
  }

  async resetUserPassword(userId) {
    const response = await authHttp.POST(`/users/${userId}/reset-password`)
    return await response.json()
  }

  async searchUsers(keyword, limit = 20) {
    const response = await authHttp.GET('/users/search', {
      params: { query: { keyword, limit } },
    })
    return await response.json()
  }

  async getUsersByRegion(region) {
    const response = await authHttp.GET(`/users/region/${region}`)
    return await response.json()
  }

  // Weather endpoints
  async getCurrentWeather() {
    const response = await authHttp.GET('/weather/current')
    return await response.json()
  }

  async getWeatherForecast(regionCode) {
    const response = await authHttp.GET(`/weather/forecast/${regionCode}`)
    return await response.json()
  }

  async getAvailableRegions() {
    const response = await authHttp.GET('/weather/regions')
    return await response.json()
  }
}

export const apiService = new ApiService()
