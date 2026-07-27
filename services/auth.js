import { apiRequest, loginRequest } from './api';
import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  saveAuthData,
} from '../utils/storage';

// Backend user_id is numeric; UI still keys off `$id` (carried over from Appwrite) so we
// alias it here instead of touching every screen that reads course.$id / user.$id.
function normalizeUser(user) {
  return { ...user, $id: String(user.user_id) };
}

export const authService = {
  // POST /api/auth/register — returns the created user but no token.
  // We log in right after so the caller gets back a usable session, same as before.
  async register(email, password, name, phone) {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name,
        email,
        password,
        ...(phone ? { phone: Number(phone) } : {}),
      },
    });

    return authService.login(email, password);
  },

  // POST /api/auth/login (form-urlencoded, OAuth2) -> { access_token, refresh_token }
  async login(email, password) {
    const { access_token, refresh_token } = await loginRequest(email, password);
    const rawUser = await apiRequest('/api/auth/me', { token: access_token });
    const user = normalizeUser(rawUser);

    await saveAuthData(access_token, refresh_token, user);
    return { user, accessToken: access_token };
  },

  // POST /api/auth/logout revokes the refresh token server-side. Best-effort: the local
  // session is always cleared even if the network call fails (e.g. offline logout).
  async logout() {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          body: { refresh_token: refreshToken },
        });
      }
    } catch (error) {
      // Ignore — logging out locally still needs to succeed.
    } finally {
      await clearAuthData();
    }
  },

  // GET /api/auth/me
  async getCurrentUser() {
    try {
      const token = await getAccessToken();
      if (!token) return null;
      const user = await apiRequest('/api/auth/me', { token });
      return normalizeUser(user);
    } catch (error) {
      return null;
    }
  },

  // PUT /api/users/me — multipart/form-data so a profile photo can be uploaded directly.
  // Only the provided fields are sent; omitted fields are left untouched server-side.
  // `imageFile` is a react-native-image-picker asset ({ uri, type, fileName }).
  async updateProfile({ name, phone, email, password, imageFile } = {}) {
    const token = await getAccessToken();

    const form = new FormData();
    if (name !== undefined) form.append('name', name);
    if (email !== undefined) form.append('email', email);
    if (password) form.append('password', password);
    if (phone !== undefined && phone !== '') form.append('phone', String(Number(phone)));
    if (imageFile) {
      form.append('image_file', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'profile.jpg',
      });
    }

    await apiRequest('/api/users/me', { method: 'PUT', token, body: form });

    // Re-fetch the canonical user so the cached copy matches GET /api/auth/me exactly,
    // then persist it (refresh token is unchanged) so getAuthData() reflects the edit.
    const user = normalizeUser(await apiRequest('/api/auth/me', { token }));
    const refreshToken = await getRefreshToken();
    await saveAuthData(token, refreshToken, user);
    return user;
  },

  async checkAuth() {
    const user = await authService.getCurrentUser();
    return !!user;
  },
};
