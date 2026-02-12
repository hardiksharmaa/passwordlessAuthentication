
let mmkvInstance: any = null;

try {
  const { MMKV } = require('react-native-mmkv');
  mmkvInstance = new MMKV({ id: 'passwordless-auth-storage' });
} catch {
  console.warn('[Storage] MMKV not available, using in-memory fallback');
}

const inMemoryStorage = new Map<string, string>();

export const StorageService = {
  get<T>(key: string): T | null {
    try {
      let value: string | undefined;

      if (mmkvInstance) {
        value = mmkvInstance.getString(key);
      } else {
        value = inMemoryStorage.get(key);
      }

      if (value === undefined) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      const stringValue = JSON.stringify(value);

      if (mmkvInstance) {
        mmkvInstance.set(key, stringValue);
      } else {
        inMemoryStorage.set(key, stringValue);
      }
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): void {
    try {
      if (mmkvInstance) {
        mmkvInstance.delete(key);
      } else {
        inMemoryStorage.delete(key);
      }
    } catch {
      // silent fail
    }
  },

  has(key: string): boolean {
    if (mmkvInstance) {
      return mmkvInstance.contains(key);
    }
    return inMemoryStorage.has(key);
  },

  clearAll(): void {
    try {
      if (mmkvInstance) {
        mmkvInstance.clearAll();
      } else {
        inMemoryStorage.clear();
      }
    } catch {
      // silent fail
    }
  },

  getAllKeys(): string[] {
    if (mmkvInstance) {
      return mmkvInstance.getAllKeys();
    }
    return Array.from(inMemoryStorage.keys());
  },
};

export default StorageService;
