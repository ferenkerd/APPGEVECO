import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const variantStyles = {
  success: {
    icon: 'check-circle',
    color: '#22c55e',
    borderColor: '#22c55e',
    backgroundColor: '#222',
  },
  error: {
    icon: 'error',
    color: '#ef4444',
    borderColor: '#ef4444',
    backgroundColor: '#222',
  },
  info: {
    icon: 'info',
    color: '#3b82f6',
    borderColor: '#3b82f6',
    backgroundColor: '#222',
  },
  warning: {
    icon: 'warning',
    color: '#f59e42',
    borderColor: '#f59e42',
    backgroundColor: '#222',
  },
};

export function CustomToast({ text1, text2, type }) {
  const variant = variantStyles[type] || variantStyles.info;
  return (
    <View style={[styles.toast, { borderColor: variant.borderColor, backgroundColor: variant.backgroundColor }]}> 
      <MaterialIcons name={variant.icon} size={28} color={variant.color} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: variant.color }]}>{text1}</Text>
        {!!text2 && <Text style={styles.description}>{text2}</Text>}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    width: width - 48,
    alignSelf: 'center',
    backgroundColor: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 100,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    color: '#fff',
    fontSize: 14,
  },
});