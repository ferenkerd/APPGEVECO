import { devLog } from '../utils/logger';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const Storage = {
  async setItem(key, value) {
    devLog('Storage.setItem', { key, value });
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key) {
    devLog('Storage.getItem', { key });
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key) {
    devLog('Storage.deleteItem', { key });
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};
