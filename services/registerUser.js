// Registrar usuario usando apiFetch para asegurar la base URL
import { apiFetch } from './api';

export async function registerUser(userData) {
  return apiFetch('auth/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: { 'Content-Type': 'application/json' },
  });
}
