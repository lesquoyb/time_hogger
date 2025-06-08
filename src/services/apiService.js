// API service for server communication
class ApiService {
  constructor() {
    // Dynamic API URL based on environment
    this.baseURL = this.getApiBaseUrl();
  }

  getApiBaseUrl() {
    // In development
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    }
    
    // In production, use relative URL or environment variable
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Default: assume API is served from the same domain
    const { protocol, hostname, port } = window.location;
    const apiPort = import.meta.env.VITE_API_PORT || '3001';
    
    // If we're on localhost, use the API port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:${apiPort}/api`;
    }
    
    // For production domains, assume API is on same domain or subdomain
    return `${protocol}//${hostname}/api`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Persons endpoints
  async getPersons() {
    return this.request('/persons');
  }

  async savePersons(persons) {
    return this.request('/persons', {
      method: 'POST',
      body: JSON.stringify(persons),
    });
  }

  async getPerson(id) {
    return this.request(`/persons/${id}`);
  }

  async updatePerson(id, person) {
    return this.request(`/persons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(person),
    });
  }

  async deletePerson(id) {
    return this.request(`/persons/${id}`, {
      method: 'DELETE',
    });
  }

  // Utility endpoints
  async createBackup() {
    return this.request('/backup', {
      method: 'POST',
    });
  }

  async checkHealth() {
    return this.request('/health');
  }

  // Check if server is available
  async isServerAvailable() {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      console.warn('Server not available:', error.message);
      return false;
    }
  }

  // Get current API configuration info
  getConfig() {
    return {
      baseURL: this.baseURL,
      isDev: import.meta.env.DEV,
      apiUrl: import.meta.env.VITE_API_URL,
      apiPort: import.meta.env.VITE_API_PORT
    };
  }

  // Test connection and log configuration
  async testConnection() {
    const config = this.getConfig();
    console.log('🔧 API Configuration:', config);
    
    try {
      const health = await this.checkHealth();
      console.log('✅ Server connection successful:', health);
      return { success: true, config, health };
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      return { success: false, config, error: error.message };
    }
  }
}

export default new ApiService();
