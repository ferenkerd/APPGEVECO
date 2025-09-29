import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getPalette } from '../styles/theme';
import { ColorModeContext } from '../context/ColorModeContext';
import { useContext } from 'react';

export default function BackButton({ to, color, ...props }) {
  const navigation = useNavigation();
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);

  const handlePress = () => {
    if (to) {
      navigation.navigate(to);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ marginLeft: 16 }} {...props}>
      <MaterialIcons name="arrow-back" size={28} color={color || palette.primary} />
    </TouchableOpacity>
  );
}
