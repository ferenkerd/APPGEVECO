import React from 'react';
import ToastMessage, { showMessage, hideMessage } from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';

// Toast visual compatible con variantes y children personalizados
export const Toast = ({ action = 'info', variant = 'outline', nativeID, className, children }) => {
  const backgroundColors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e42',
    info: '#3b82f6',
    muted: '#64748b',
  };
  return (
    <View
      nativeID={nativeID}
      style={[
        styles.toast,
        { backgroundColor: variant === 'solid' ? backgroundColors[action] : '#222' },
        variant === 'outline' && { borderWidth: 1, borderColor: backgroundColors[action] },
        className && className,
      ]}
    >
      {children}
    </View>
  );
};

export const ToastTitle = ({ children, className }) => (
  <Text style={[styles.title, className]}>{children}</Text>
);
export const ToastDescription = ({ children, className }) => (
  <Text style={[styles.description, className]}>{children}</Text>
);

// Hook para mostrar toasts con API similar a gluestack-ui
export function useToast() {
  return {
    show: ({ id, placement = 'top', duration = 3000, render }) => {
      showMessage({
        type: 'custom',
        position: placement,
        autoHide: true,
        visibilityTime: duration,
        renderCustomContent: () => render({ id }),
      });
    },
    close: () => hideMessage(),
    isActive: () => false, // No tracking, pero puedes implementar si lo necesitas
  };
}

const styles = StyleSheet.create({
  toast: {
    padding: 16,
    borderRadius: 8,
    margin: 8,
    minWidth: 220,
    maxWidth: 400,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ToastMessage;
