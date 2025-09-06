import React from 'react';
import { Button, ButtonText } from '@gluestack-ui/themed';

export function CustomButton({ children, style, backgroundColor, textColor, ...props }) {
  return (
    <Button
      variant="solid"
      size="md"
      action="primary"
      style={[backgroundColor ? { backgroundColor } : {}, style]}
      {...props}
    >
      <ButtonText style={textColor ? { color: textColor } : {}}>{children}</ButtonText>
    </Button>
  );
}
