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

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'ClockDashboard/1.0',
    },
  })

  if (!res.ok) {
    throw new Error(`Geocoding API error: ${res.statusText}`)
  }

  const data = await res.json()
  if (Array.isArray(data) && data.length > 0) {
    return data
  }

  return []
}
