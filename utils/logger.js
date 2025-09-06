// utils/logger.js

// Cambia este valor a false para producción
export const IS_DEV = true;

export function devLog(...args) {
  if (IS_DEV) {
    // Puedes personalizar el formato del log aquí
    console.log('[DEV]', ...args);
  }
}
