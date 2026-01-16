import axios from 'axios'

export async function searchCities(query, limit = 3) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return []
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', trimmedQuery)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', limit.toString())
  url.searchParams.set('accept-language', 'zh-CN')
  url.searchParams.set('addressdetails', '1')

  try {
    const { data } = await axios.get(url.toString(), {
      headers: {
        'User-Agent': 'ClockDashboard/1.0',
      },
    })
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    return []
  }
  catch (error) {
    const statusText = error?.response?.statusText || error?.message || 'Unknown error'
    throw new Error(`Geocoding API error: ${statusText}`)
  }
}
