const API_BASE_URL = 'http://localhost:8000'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`,
        )
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email, password) {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        body: formData,
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

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  // Admin management endpoints
  async getAdmins(skip = 0, limit = 100) {
    return this.request(`/admins/?skip=${skip}&limit=${limit}`)
  }

  async createAdmin(adminData) {
    return this.request('/admins/', {
      method: 'POST',
      body: JSON.stringify(adminData),
    })
  }

  async updateAdmin(adminId, adminData) {
    return this.request(`/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    })
  }

  async deleteAdmin(adminId) {
    return this.request(`/admins/${adminId}`, {
      method: 'DELETE',
    })
  }

  async activateAdmin(adminId) {
    return this.request(`/admins/${adminId}/activate`, {
      method: 'PUT',
    })
  }

  async deactivateAdmin(adminId) {
    return this.request(`/admins/${adminId}/deactivate`, {
      method: 'PUT',
    })
  }

  // Weather endpoints
  async getCurrentWeather() {
    return this.request('/weather/current')
  }

  async getWeatherForecast(regionCode) {
    return this.request(`/weather/forecast/${regionCode}`)
  }

  async getAvailableRegions() {
    return this.request('/weather/regions')
  }
}

export const apiService = new ApiService()
