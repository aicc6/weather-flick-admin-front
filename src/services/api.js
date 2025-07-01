const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
    })

    try {
      const response = await fetch(url, config)
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage =
          errorData.detail || `HTTP error! status: ${response.status}`
        const error = new Error(errorMessage)
        error.status = response.status
        throw error
      }

      const data = await response.json()
      console.log('API Success:', data)
      return data
    } catch (error) {
      console.error('API request failed:', error)
      // 네트워크 에러인 경우 원본 에러를 유지
      if (
        error.name === 'TypeError' &&
        error.message.includes('Failed to fetch')
      ) {
        throw new Error('Failed to fetch: 서버에 연결할 수 없습니다.')
      }
      throw error
    }
  }

  // Auth endpoints
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
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
    return this.request('/api/v1/auth/me')
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

  // User management endpoints
  async getUsers(skip = 0, limit = 100) {
    return this.request(`/users/?skip=${skip}&limit=${limit}`)
  }

  async createUser(userData) {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
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
