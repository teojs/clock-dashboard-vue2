import {
  createConnection,
  createLongLivedTokenAuth,
  callService as haCallService,
  subscribeEntities,
} from 'home-assistant-js-websocket'

export class HASocketService {
  constructor() {
    this.connection = null
    this.entitiesCallback = null
    this.unsubEntities = null
  }

  async connect(url, token) {
    if (this.connection) {
      this.disconnect()
    }

    // Ensure URL doesn't end with slash and has protocol
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url

    try {
      const auth = createLongLivedTokenAuth(formattedUrl, token)
      this.connection = await createConnection({ auth })

      // eslint-disable-next-line no-console
      console.info('HA WebSocket connection ready')

      this.connection.addEventListener('disconnected', () => {
        console.warn('HA WebSocket disconnected')
      })

      if (this.entitiesCallback) {
        this.subscribeToEntities(this.entitiesCallback)
      }
    }
    catch (err) {
      console.error('Failed to connect to HA WebSocket:', err)
      throw err
    }
  }

  disconnect() {
    if (this.unsubEntities) {
      this.unsubEntities()
      this.unsubEntities = null
    }
    if (this.connection) {
      this.connection.close()
      this.connection = null
    }
  }

  subscribeToEntities(callback) {
    this.entitiesCallback = callback
    if (this.connection) {
      if (this.unsubEntities) this.unsubEntities()
      this.unsubEntities = subscribeEntities(this.connection, (entities) => {
        callback(entities)
      })
    }
  }

  async callService(domain, service, serviceData) {
    if (!this.connection) {
      throw new Error('HA WebSocket not connected')
    }
    return haCallService(this.connection, domain, service, serviceData)
  }

  isConnected() {
    return !!this.connection
  }
}

export const haSocket = new HASocketService()
