import React from 'react';
import { Input, InputField, InputIcon, InputSlot, Text } from '@gluestack-ui/themed';
import { View, StyleSheet } from 'react-native';

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
          <InputSlot>
            <InputIcon as={icon} />
          </InputSlot>
        )}
      </Input>
    </View>
  );
}
