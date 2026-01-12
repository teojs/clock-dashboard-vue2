export async function reverseGeocode(lat, lon) {
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`)

  if (!response.ok) {
    throw new Error(`Reverse geocoding API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export async function getLocationByIp() {
  const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh')

  if (!res.ok) {
    throw new Error(`IP location API error: ${res.statusText}`)
  }

  const data = await res.json()
  return data
}

export async function getCurrentPosition(timeout = 5000) {
  if (!navigator.geolocation) {
    const ipLocation = await getLocationByIp()
    if (ipLocation.latitude && ipLocation.longitude) {
      return {
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
      }
    }
    throw new Error('Geolocation is not supported and IP location failed')
  }

  try {
    return await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        { timeout },
      )
    })
  }
  catch (error) {
    const ipLocation = await getLocationByIp()
    if (ipLocation.latitude && ipLocation.longitude) {
      return {
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
      }
    }
    throw new Error('Geolocation failed and IP location failed')
  }
}
