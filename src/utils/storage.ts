// Web-compatible storage utilities
export const webStorage = {
  getItem: async (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  getItemAsync: async (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== "undefined") {
      return localStorage.setItem(key, value);
    }
  },
  setItemAsync: async (key: string, value: string) => {
    if (typeof window !== "undefined") {
      return localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.removeItem(key);
    }
  },
  removeItemAsync: async (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.removeItem(key);
    }
  },
  deleteItemAsync: async (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.removeItem(key);
    }
  },
};
