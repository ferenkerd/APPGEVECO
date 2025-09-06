import React from 'react';
import { Input, InputField, InputIcon, InputSlot } from '@gluestack-ui/themed';
import { View, StyleSheet } from 'react-native';

export function FormInput({
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
    <View style={style}>
      <Input style={{ backgroundColor }}>
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          style={{ color: textColor }}
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
