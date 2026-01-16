import axios from 'axios'

export async function reverseGeocode(lat, lon) {
  try {
    const { data } = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: {
        latitude: lat,
        longitude: lon,
        localityLanguage: 'zh',
      },
    })
    return data
  }
  catch (error) {
    const statusText = error?.response?.statusText || error?.message || 'Unknown error'
    throw new Error(`Reverse geocoding API error: ${statusText}`)
  }
}

export async function getLocationByIp() {
  try {
    const { data } = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: {
        localityLanguage: 'zh',
      },
    })
    return data
  }
  catch (error) {
    const statusText = error?.response?.statusText || error?.message || 'Unknown error'
    throw new Error(`IP location API error: ${statusText}`)
  }
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
