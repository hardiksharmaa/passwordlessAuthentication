
let mmkvInstance: any = null;

try {

  const { MMKV } = require('react-native-mmkv');
  mmkvInstance = new MMKV({ id: 'passwordless-auth-storage' });
} catch (error) {
  console.warn('[Storage] MMKV not available, using in-memory fallback');
}


const inMemoryStorage = new Map<string, string>();

export const StorageService = {
  /**
   * Get a value from storage
   * @param key - Storage key
   * @returns Parsed value or null if not found
   */
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
    } catch (error) {
      console.error(`[Storage] Error reading key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set a value in storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   * @returns Success status
   */
  set<T>(key: string, value: T): boolean {
    try {
      const stringValue = JSON.stringify(value);
      
      if (mmkvInstance) {
        mmkvInstance.set(key, stringValue);
      } else {
        inMemoryStorage.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error(`[Storage] Error writing key "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove a value from storage
   * @param key - Storage key to remove
   */
  remove(key: string): void {
    try {
      if (mmkvInstance) {
        mmkvInstance.delete(key);
      } else {
        inMemoryStorage.delete(key);
      }
    } catch (error) {
      console.error(`[Storage] Error removing key "${key}":`, error);
    }
  },

  /**
   * Check if a key exists in storage
   * @param key - Storage key to check
   * @returns Whether the key exists
   */
  has(key: string): boolean {
    if (mmkvInstance) {
      return mmkvInstance.contains(key);
    }
    return inMemoryStorage.has(key);
  },

  /**
   * Clear all storage
   * Use with caution!
   */
  clearAll(): void {
    try {
      if (mmkvInstance) {
        mmkvInstance.clearAll();
      } else {
        inMemoryStorage.clear();
      }
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  },

  /**
   * Get all keys in storage
   * @returns Array of all storage keys
   */
  getAllKeys(): string[] {
    if (mmkvInstance) {
      return mmkvInstance.getAllKeys();
    }
    return Array.from(inMemoryStorage.keys());
  },
};

export default StorageService;
