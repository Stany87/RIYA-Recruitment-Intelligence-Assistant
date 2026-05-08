const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = {
  /**
   * Make an authenticated API request.
   * @param {string} endpoint - API endpoint (e.g., '/auth/login')
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Parsed JSON response
   */
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('clockwork_token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    let response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, config);
    } catch (networkError) {
      // Network failure — server unreachable, DNS error, CORS, etc.
      throw new Error('Unable to reach the server. Check your connection and try again.');
    }

    // Try to parse JSON, but handle non-JSON responses (HTML error pages, etc.)
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned an unexpected response (${response.status}).`);
    }

    if (!response.ok) {
      // Auto-logout on 401 (expired/invalid token)
      if (response.status === 401 && endpoint !== '/auth/login') {
        localStorage.removeItem('clockwork_token');
        window.location.href = '/login';
      }
      throw new Error(data.message || `Request failed (${response.status}).`);
    }

    return data;
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export default api;
