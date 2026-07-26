import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@access_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  ONBOARDING_DONE: '@onboarding_done',
  BOOKMARKED_COURSES: '@bookmarked_courses',
};

export const saveAuthData = async (accessToken, refreshToken, user) => {
  try {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken || '');
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
  } catch (error) {
    console.error('Save auth data error:', error);
  }
};

export const getAuthData = async () => {
  try {
    const accessToken = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    const refreshToken = await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    const userData = await AsyncStorage.getItem(KEYS.USER_DATA);

    if (accessToken && userData) {
      return {
        accessToken,
        refreshToken,
        user: JSON.parse(userData),
      };
    }
    return null;
  } catch (error) {
    console.error('Get auth data error:', error);
    return null;
  }
};

// Quick token getter for attaching `Authorization: Bearer <token>` without parsing user data
export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  } catch (error) {
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  } catch (error) {
    return null;
  }
};

// Updates just the token pair (e.g. after a silent refresh) without touching the cached user.
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
    }
  } catch (error) {
    console.error('Save tokens error:', error);
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error('Clear auth data error:', error);
  }
};

export const setOnboardingDone = async () => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
  } catch (error) {
    console.error('Set onboarding error:', error);
  }
};

export const isOnboardingDone = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

// Device-local "saved for later" list — not synced to any backend.
export const getBookmarkedCourseIds = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.BOOKMARKED_COURSES);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    return [];
  }
};

export const toggleBookmarkedCourse = async (courseId) => {
  try {
    const ids = await getBookmarkedCourseIds();
    const next = ids.includes(courseId)
      ? ids.filter((id) => id !== courseId)
      : [...ids, courseId];
    await AsyncStorage.setItem(KEYS.BOOKMARKED_COURSES, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return await getBookmarkedCourseIds();
  }
};
