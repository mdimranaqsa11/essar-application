import { API_BASE_URL } from '@env';
import { showGlobalToast } from '../components/ui/Toast';
import { clearAuthData, getRefreshToken, saveTokens } from '../utils/storage';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildUrl(path, query) {
  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

// Dedupe concurrent refresh attempts — if five requests 401 at once, only refresh once.
let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new ApiError('No refresh token available', 401);
      }

      let res;
      try {
        res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        throw new ApiError(`Network error: could not reach ${API_BASE_URL}`, 0);
      }

      const json = await res.json().catch(() => null);
      if (!json || json.status === false) {
        throw new ApiError(json?.message || 'Session expired', res.status);
      }

      const { access_token, refresh_token } = json.response;
      await saveTokens(access_token, refresh_token);
      return access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Calls a JSON endpoint that uses the backend's `{ status, message, response }` envelope.
// Throws ApiError with the backend's message when status is false or the HTTP call fails.
// A 401 on an authenticated call triggers one silent refresh-and-retry before giving up.
export async function apiRequest(path, { method = 'GET', body, token, query, _retried } = {}) {
  const url = buildUrl(path, query);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(`Network error: could not reach ${API_BASE_URL}`, 0);
  }

  if (res.status === 401 && token && !_retried) {
    try {
      const newAccessToken = await refreshAccessToken();
      return await apiRequest(path, { method, body, token: newAccessToken, query, _retried: true });
    } catch (refreshError) {
      // Only wipe the session when the server actually confirmed the refresh token is
      // invalid/expired/revoked (a real 401 from /api/auth/refresh). A network blip or a
      // backend that's temporarily unreachable (status 0, or a 5xx) shouldn't log the user
      // out — just fail this one request and let them keep their session for next time.
      if (refreshError.status === 401) {
        await clearAuthData();
        showGlobalToast('Your session expired — please log in again.', 'error');
        throw new ApiError('Session expired. Please login again.', 401);
      }
      throw refreshError;
    }
  }

  const json = await res.json().catch(() => null);

  if (!json || json.status === false) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status);
  }

  return json.response;
}

// POST /api/auth/login is the one non-enveloped, form-urlencoded (OAuth2) endpoint.
export async function loginRequest(email, password) {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  } catch (error) {
    throw new ApiError(`Network error: could not reach ${API_BASE_URL}`, 0);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMessage = json?.message || json?.detail || 'Incorrect email or password';
    throw new ApiError(errorMessage, res.status);
  }

  if (!json || !json.access_token) {
    throw new ApiError('Invalid login response from server', res.status);
  }

  return json; // { access_token, refresh_token, token_type }
}
