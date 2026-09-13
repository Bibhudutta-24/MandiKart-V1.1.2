/**
 * Unified API Client Interface
 * Handles HTTP requests, JWT token injection, timeout handling,
 * and resilient backend sync with zero app crashes.
 */
import { Platform, NativeModules } from 'react-native';

/**
 * Automatically resolve dev server host:
 * - On a physical phone using Expo Go over Wi-Fi, extracts the host IP from scriptURL (e.g. 192.168.x.x or 10.x.x.x).
 * - On an Android emulator, defaults to 10.0.2.2.
 * - On iOS / Web, defaults to localhost.
 */
const getDevServerHost = () => {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
      if (address && address !== 'localhost' && address !== '127.0.0.1') {
        return address;
      }
    }
  } catch (e) {}
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

// Local backend API Base URL
export const LOCAL_BACKEND_URL = `http://${getDevServerHost()}:5000/api`;
export const BASE_API_URL = LOCAL_BACKEND_URL;

// Flag indicating whether to use mock data or real backend API
export const USE_MOCK_DATA = false;

class ApiClient {
  constructor(baseUrl = BASE_API_URL) {
    this.baseUrl = baseUrl;
    this.authToken = null;
    this.timeoutMs = 3000; // 3s timeout for quick, seamless fallback
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async _fetchWithTimeout(url, options = {}) {
    if (!url || url.includes('undefined')) {
      throw new Error('Invalid endpoint URL provided.');
    }

    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error('Network request timed out.'));
      }, this.timeoutMs);
    });

    try {
      const response = await Promise.race([
        fetch(url, options),
        timeoutPromise,
      ]);
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  async get(endpoint, params = {}) {
    if (!endpoint) throw new Error('Endpoint not specified.');
    const queryString = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    try {
      const response = await this._fetchWithTimeout(`${this.baseUrl}${endpoint}${queryString}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this._handleResponse(response);
    } catch (networkError) {
      // Clean informational log instead of LogBox warning
      console.log(`[API Sync Note] GET ${endpoint} offline: ${networkError.message}`);
      throw networkError;
    }
  }

  async post(endpoint, body = {}) {
    if (!endpoint) throw new Error('Endpoint not specified.');
    try {
      const response = await this._fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this._handleResponse(response);
    } catch (networkError) {
      console.log(`[API Sync Note] POST ${endpoint} offline: ${networkError.message}`);
      throw networkError;
    }
  }

  async put(endpoint, body = {}) {
    if (!endpoint) throw new Error('Endpoint not specified.');
    try {
      const response = await this._fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this._handleResponse(response);
    } catch (networkError) {
      console.log(`[API Sync Note] PUT ${endpoint} offline: ${networkError.message}`);
      throw networkError;
    }
  }

  async delete(endpoint) {
    if (!endpoint) throw new Error('Endpoint not specified.');
    try {
      const response = await this._fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this._handleResponse(response);
    } catch (networkError) {
      console.log(`[API Sync Note] DELETE ${endpoint} offline: ${networkError.message}`);
      throw networkError;
    }
  }

  async _handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
