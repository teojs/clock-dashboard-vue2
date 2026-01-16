import axios from 'axios'

export async function fetchWeatherData(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast'
  let data
  try {
    const response = await axios.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m',
        hourly: 'temperature_2m,precipitation_probability,weather_code,uv_index',
        timezone: 'auto',
        forecast_days: 1,
      },
    })
    data = response.data
  }
  catch (error) {
    const statusText = error?.response?.statusText || error?.message || 'Unknown error'
    throw new Error(`Weather API error: ${statusText}`)
  }

  // 辅助字段：当前小时在 hourly 数组中的索引
  const now = new Date()
  const currentHour = now.getHours()
  data.current_hour_index = currentHour

  return data
}

export async function fetchAirQualityData(lat, lon) {
  const url = 'https://air-quality-api.open-meteo.com/v1/air-quality'
  try {
    const response = await axios.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'us_aqi',
        timezone: 'auto',
        forecast_days: 1,
      },
    })
    return response.data
  }
  catch (error) {
    const statusText = error?.response?.statusText || error?.message || 'Unknown error'
    throw new Error(`Air Quality API error: ${statusText}`)
  }
}
