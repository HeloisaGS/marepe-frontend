import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  type?: 'error' | 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  onHide,
  duration = 3000,
  type = 'error',
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor =
    type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6';

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
