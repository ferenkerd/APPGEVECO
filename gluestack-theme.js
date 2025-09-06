// gluestack-ui theme básico recomendado

import { createConfig } from '@gluestack-ui/themed';
import { config as defaultConfig } from '@gluestack-ui/config';
import { palettes } from './styles/theme';

// Generar tokens de color para cada clave de la paleta
const colors = Object.keys(palettes.light).reduce((acc, key) => ({
  ...acc,
  [`${key}Light`]: palettes.light[key],
  [`${key}Dark`]: palettes.dark[key],
}), {});

export const gluestackTheme = createConfig({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      ...colors,
    },
  },
});
