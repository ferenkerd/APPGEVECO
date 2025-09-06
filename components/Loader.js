import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export function Loader({ size = 'large', color = '#111', style, backgroundColor }) {
  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor } : {}, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
