// Paletas centralizadas para todos los temas
export const palettes = {
  light: {
    background: '#fff',
    surface: '#f5f5f5',
    text: '#111',
    textSecondary: '#666',
    border: '#e5e5e5',
    primary: '#111',
    secondary: '#666',
    card: '#fff',
  },
  dark: {
    background: '#111',
    surface: '#18181b',
    text: '#fff',
    textSecondary: '#aaa',
    border: '#333',
    primary: '#fff',
    secondary: '#aaa',
    card: '#18181b',
  },
  // Agrega más paletas aquí si lo necesitas
};

export const getPalette = (mode = 'light') => palettes[mode];
