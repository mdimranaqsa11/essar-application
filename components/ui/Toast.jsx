import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: { icon: 'checkmark-circle', color: Colors.primary },
  error: { icon: 'close-circle', color: Colors.error },
  info: { icon: 'information-circle', color: Colors.info },
};

// Lets plain modules (e.g. services/api.js) that aren't React components surface a toast —
// set once by ToastProvider on mount, called imperatively from anywhere.
let globalToastHandler = null;

export function showGlobalToast(message, type = 'info') {
  globalToastHandler?.(message, type);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timeoutRef = useRef(null);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const showToast = useCallback(
    (message, type = 'success') => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast({ message, type });
      opacity.setValue(0);
      translateY.setValue(20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
      timeoutRef.current = setTimeout(hideToast, 2600);
    },
    [hideToast, opacity, translateY]
  );

  useEffect(() => {
    globalToastHandler = showToast;
    return () => {
      globalToastHandler = null;
    };
  }, [showToast]);

  const config = toast ? TOAST_STYLES[toast.type] || TOAST_STYLES.info : null;

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.container,
            { bottom: insets.bottom + 86, opacity, transform: [{ translateY }] },
          ]}
        >
          <View style={[styles.toast, { borderLeftColor: config.color }]}>
            <Ionicons name={config.icon} size={20} color={config.color} />
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
