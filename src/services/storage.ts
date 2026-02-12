import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'passwordless_auth_';

export const StorageService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const value = await AsyncStorage.getItem(prefixedKey);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const stringValue = JSON.stringify(value);
      await AsyncStorage.setItem(prefixedKey, stringValue);
      return true;
    } catch {
      return false;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      await AsyncStorage.removeItem(prefixedKey);
    } catch {
    }
  },

  async has(key: string): Promise<boolean> {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const value = await AsyncStorage.getItem(prefixedKey);
      return value !== null;
    } catch {
      return false;
    }
  },

  async clearAll(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(k => k.startsWith(STORAGE_PREFIX));
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
      }
    } catch {
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter(k => k.startsWith(STORAGE_PREFIX))
        .map(k => k.replace(STORAGE_PREFIX, ''));
    } catch {
      return [];
    }
  },
};

export default StorageService;
