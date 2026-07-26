import { CommonActions, StackActions } from '@react-navigation/native';
import { navigationRef } from './navigationRef';

function resolve(path) {
  if (path.startsWith('/course/')) {
    return { name: 'CourseDetails', params: { id: path.slice('/course/'.length) } };
  }
  if (path.startsWith('/player/')) {
    return { name: 'Player', params: { id: path.slice('/player/'.length) } };
  }

  switch (path) {
    case '/':
    case '/index':
      return { name: 'Splash' };
    case '/onboarding':
      return { name: 'Onboarding' };
    case '/(auth)/login':
      return { name: 'Login' };
    case '/(auth)/register':
      return { name: 'Register' };
    case '/(tabs)':
      return { name: 'MainTabs' };
    case '/(tabs)/index':
      return { name: 'MainTabs', params: { screen: 'Home' } };
    case '/(tabs)/library':
      return { name: 'MainTabs', params: { screen: 'Library' } };
    case '/(tabs)/courses':
      return { name: 'MainTabs', params: { screen: 'Courses' } };
    case '/(tabs)/profile':
      return { name: 'MainTabs', params: { screen: 'Profile' } };
    case '/(tabs)/admin':
      return { name: 'MainTabs', params: { screen: 'Admin' } };
    case '/support':
      return { name: 'Support' };
    case '/about':
      return { name: 'About' };
    default:
      throw new Error(`router: unmapped path "${path}"`);
  }
}

export const router = {
  push(path, extraParams) {
    if (!navigationRef.isReady()) return;
    const { name, params } = resolve(path);
    navigationRef.dispatch(CommonActions.navigate({ name, params: { ...params, ...extraParams } }));
  },
  replace(path, extraParams) {
    if (!navigationRef.isReady()) return;
    const { name, params } = resolve(path);
    navigationRef.dispatch(StackActions.replace(name, { ...params, ...extraParams }));
  },
  back() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },
};
