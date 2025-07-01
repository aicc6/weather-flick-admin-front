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
  async getAdmins(skip = 0, limit = 100) {
    const response = await authHttp.GET('/auth/admins', {
      params: { query: { skip, limit } },
    })
    return await response.json()
  }

  async createAdmin(adminData) {
    const response = await authHttp.POST('/auth/admins', {
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
    const response = await authHttp.PUT(`/auth/admins/${adminId}/activate`)
    return await response.json()
  }

  async deactivateAdmin(adminId) {
    const response = await authHttp.PUT(`/auth/admins/${adminId}/deactivate`)
    return await response.json()
  }

  // User management endpoints
  async getUsers(skip = 0, limit = 100) {
    const response = await authHttp.GET('/users/', {
      params: { query: { skip, limit } },
    })
    return await response.json()
  }

  async createUser(userData) {
    const response = await authHttp.POST('/users/', {
      body: userData,
    })
    return await response.json()
  }

  async deleteUser(userId) {
    const response = await authHttp.DELETE(`/users/${userId}`)
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
