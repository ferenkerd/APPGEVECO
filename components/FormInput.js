import React from 'react';
import { Input, InputField, InputIcon, InputSlot, Text } from '@gluestack-ui/themed';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

export function FormInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  style,
  backgroundColor = '#fff',
  textColor = '#111',
  onIconPress,
  ...props
}) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label && (
        <Text fontSize={14} fontWeight="500" mb={2} color="$textSecondary">
          {label}
        </Text>
      )}
      <Input style={{ backgroundColor, borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5' }}>
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          style={{ color: textColor, fontSize: 16, paddingVertical: 10 }}
          {...props}
        />
        {icon && (
          <InputSlot style={{ paddingRight: 10 }}>
            <TouchableOpacity onPress={onIconPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <InputIcon as={icon} />
            </TouchableOpacity>
          </InputSlot>
        )}
      </Input>
    </View>
  );
}
