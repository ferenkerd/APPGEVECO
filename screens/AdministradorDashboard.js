import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

const AdministradorDashboard = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 24 }}>Administrador Dashboard</Text>
    </View>
  );
};

export default AdministradorDashboard;
