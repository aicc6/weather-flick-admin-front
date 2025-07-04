import { useState, useEffect } from 'react'
import { authHttp } from '../lib/http'

export function useDashboardData() {
  // 관광지 대시보드 요약 데이터
  const [tourSummary, setTourSummary] = useState({ items: [], total: 0 })

  // 사용자/관리자 요약 데이터
  const [userSummary, setUserSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  const [adminSummary, setAdminSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  // DB 기반 날씨 요약 데이터
  const [weatherData, setWeatherData] = useState({})
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')
  const [weatherLastUpdated, setWeatherLastUpdated] = useState(null)

  // 시스템 상태 요약 데이터
  const [systemStatus, setSystemStatus] = useState(null)

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true)
      setWeatherError('')
      const res = await authHttp.GET('/weather/summary-db')
      const data = await res.json()

      // Convert to { code: data } map for compatibility
      const regionMap = {}
      data.regions?.forEach((region) => {
        regionMap[region.city_code || region.city_name] = {
          ...region,
          region_name: region.city_name,
          temperature: region.temperature,
          humidity: region.humidity,
          wind_speed: region.wind_speed,
          sky_condition: region.sky_condition,
        }
      })

      setWeatherData(regionMap)
      setWeatherLastUpdated(
        data.summary?.last_updated
          ? new Date(data.summary.last_updated)
          : new Date(),
      )
    } catch (err) {
      setWeatherError('날씨 데이터를 불러오는데 실패했습니다.')
      setWeatherData({})
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 관광지 데이터 fetch
        const tourRes = await authHttp.GET('/tourist-attractions/', {
          params: { query: { limit: 3, offset: 0 } },
        })
        const tourData = await tourRes.json()
        setTourSummary(tourData)
      } catch (error) {
        console.error('관광지 데이터 로딩 실패:', error)
        setTourSummary({ items: [], total: 0 })
      }

      try {
        // 사용자 요약 fetch
        const userRes = await authHttp.GET('/users/stats')
        const userData = await userRes.json()
        setUserSummary({
          total: userData.total ?? 0,
          active: userData.active ?? 0,
          inactive: userData.inactive ?? 0,
        })
      } catch (error) {
        console.error('사용자 통계 로딩 실패:', error)
        setUserSummary({ total: 0, active: 0, inactive: 0 })
      }

      try {
        // 관리자 요약 fetch
        const adminRes = await authHttp.GET('/auth/admins/stats')
        const adminData = await adminRes.json()
        setAdminSummary({
          total: adminData.total ?? 0,
          active: adminData.active ?? 0,
          inactive: adminData.inactive ?? 0,
        })
      } catch (error) {
        console.error('관리자 통계 로딩 실패:', error)
        setAdminSummary({ total: 0, active: 0, inactive: 0 })
      }

      try {
        // 시스템 상태 fetch
        const systemRes = await authHttp.GET('/api/v1/admin/system/status')
        const systemData = await systemRes.json()
        setSystemStatus(systemData)
      } catch (error) {
        console.error('시스템 상태 로딩 실패:', error)
        setSystemStatus(null)
      }
    }

    fetchData()
    fetchWeatherData()
  }, [])

  return {
    tourSummary,
    userSummary,
    adminSummary,
    weatherData,
    weatherLoading,
    weatherError,
    weatherLastUpdated,
    systemStatus,
    refetchWeatherData: fetchWeatherData,
  }
}
