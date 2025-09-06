import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Card({ children, style, fullWidth = false, backgroundColor = '#fff', ...props }) {
  return (
    <View
      style={[
        styles.card,
        fullWidth ? styles.fullWidth : styles.defaultWidth,
        { backgroundColor },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
    alignSelf: 'center',
  },
  defaultWidth: {
    minWidth: 280,
    maxWidth: 400,
    width: '90%',
  },
  fullWidth: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
  },
});
