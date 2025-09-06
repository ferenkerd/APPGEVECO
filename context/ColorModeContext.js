import React, { createContext } from 'react';

export const ColorModeContext = createContext({
  colorMode: 'light',
  toggleColorMode: () => {},
});
