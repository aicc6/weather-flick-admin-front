import { Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react'

export function getWeatherIcon(skyCondition) {
  if (!skyCondition) return <Cloud className="h-4 w-4 text-gray-400" />
  if (skyCondition.includes('맑'))
    return <Sun className="h-4 w-4 text-yellow-500" />
  if (skyCondition.includes('구름'))
    return <Cloud className="h-4 w-4 text-gray-500" />
  if (skyCondition.includes('비'))
    return <CloudRain className="h-4 w-4 text-blue-500" />
  if (skyCondition.includes('눈'))
    return <CloudSnow className="h-4 w-4 text-blue-300" />
  return <Cloud className="h-4 w-4 text-gray-400" />
}

export function getWeatherDescription(skyCondition) {
  if (!skyCondition) return '알 수 없음'
  if (skyCondition.includes('맑')) return '맑음'
  if (skyCondition.includes('구름')) return '구름 많음'
  if (skyCondition.includes('비')) return '비'
  if (skyCondition.includes('눈')) return '눈'
  return skyCondition
}

export function calculateWeatherStats(weatherData) {
  const validData = Object.values(weatherData).filter(
    (data) => data.temperature !== undefined && data.temperature !== null
  )
  
  const temperatures = validData.map((data) => parseInt(data.temperature))
  
  if (temperatures.length === 0) {
    return null
  }

  const avgTemp = (
    temperatures.reduce((a, b) => a + b, 0) / temperatures.length
  ).toFixed(1)
  
  const maxTemp = Math.max(...temperatures)
  const minTemp = Math.min(...temperatures)
  
  const maxTempRegion = validData.find(
    (data) => parseInt(data.temperature) === maxTemp
  )
  
  const minTempRegion = validData.find(
    (data) => parseInt(data.temperature) === minTemp
  )

  return {
    avgTemp,
    maxTemp,
    minTemp,
    maxTempRegion,
    minTempRegion,
  }
}