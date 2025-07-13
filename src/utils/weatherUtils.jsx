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
  // weatherData가 배열인지 객체인지 확인
  let dataArray = []
  if (Array.isArray(weatherData)) {
    dataArray = weatherData
  } else if (weatherData && typeof weatherData === 'object') {
    dataArray = Object.values(weatherData)
  }

  const validData = dataArray.filter(
    (data) => data.temperature !== undefined && data.temperature !== null,
  )

  const temperatures = validData.map((data) => parseFloat(data.temperature))

  if (temperatures.length === 0) {
    return null
  }

  const avgTemp = (
    temperatures.reduce((a, b) => a + b, 0) / temperatures.length
  ).toFixed(1)

  const maxTemp = Math.max(...temperatures)
  const minTemp = Math.min(...temperatures)

  const maxTempRegion = validData.find(
    (data) => parseFloat(data.temperature) === maxTemp,
  )

  const minTempRegion = validData.find(
    (data) => parseFloat(data.temperature) === minTemp,
  )

  return {
    avgTemp,
    maxTemp,
    minTemp,
    maxTempRegion,
    minTempRegion,
  }
}
