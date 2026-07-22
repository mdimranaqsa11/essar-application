import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SESSION_ID: '@session_id',
  USER_DATA: '@user_data',
  ONBOARDING_DONE: '@onboarding_done',
};

export const saveAuthData = async (sessionId, user) => {
  try {
    await AsyncStorage.setItem(KEYS.SESSION_ID, sessionId);
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
  } catch (error) {
    console.error('Save auth data error:', error);
  }
};

export const getAuthData = async () => {
  try {
    const sessionId = await AsyncStorage.getItem(KEYS.SESSION_ID);
    const userData = await AsyncStorage.getItem(KEYS.USER_DATA);

    if (sessionId && userData) {
      return {
        sessionId,
        user: JSON.parse(userData),
      };
    }
    return null;
  } catch (error) {
    console.error('Get auth data error:', error);
    return null;
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([KEYS.SESSION_ID, KEYS.USER_DATA]);
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
