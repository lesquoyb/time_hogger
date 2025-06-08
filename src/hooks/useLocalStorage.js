import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

// Function to read value from localStorage
function getStorageValue(key, defaultValue) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

// Function to write value to localStorage
function setStorageValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function useLocalStorage(key, initialValue, options = {}) {
  const { syncWithServer = false, autoSave = true, debounceMs = 1000 } = options;
  
  const [storedValue, setStoredValue] = useState(() => getStorageValue(key, initialValue));
  const [isLoading, setIsLoading] = useState(syncWithServer);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isServerAvailable, setIsServerAvailable] = useState(false);

  // Check server availability on mount
  useEffect(() => {
    if (syncWithServer) {
      checkServerAvailability();
    }
  }, [syncWithServer]);

  const checkServerAvailability = async () => {
    try {
      const available = await apiService.isServerAvailable();
      setIsServerAvailable(available);
      return available;
    } catch (error) {
      setIsServerAvailable(false);
      return false;
    }
  };

  // Load data from server on mount
  useEffect(() => {
    if (syncWithServer && key === 'timehogger_persons') {
      loadFromServer();
    }
  }, [syncWithServer, key]);

  const loadFromServer = async () => {
    if (!syncWithServer) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const serverAvailable = await checkServerAvailability();
      if (!serverAvailable) {
        console.warn('Server not available, using local data');
        setIsLoading(false);
        return;
      }

      const serverData = await apiService.getPersons();
      
      // Compare with local data and use most recent
      const localData = getStorageValue(key, initialValue);
      const useServerData = serverData.length > 0 || localData.length === 0;
      
      if (useServerData) {
        setStoredValue(serverData);
        setStorageValue(key, serverData);
        console.log('✅ Data loaded from server');
      } else {
        console.log('📱 Using local data (server data empty)');
      }
      
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('❌ Failed to load from server:', error);
      setError(error.message);
      // Fall back to local storage
      const localData = getStorageValue(key, initialValue);
      setStoredValue(localData);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToServer = async (dataToSave) => {
    if (!syncWithServer || !isServerAvailable) return false;
    
    try {
      if (key === 'timehogger_persons') {
        await apiService.savePersons(dataToSave);
        setLastSyncTime(new Date().toISOString());
        console.log('✅ Data saved to server');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to save to server:', error);
      setError(error.message);
      return false;
    }
    return false;
  };

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((data) => {
      if (autoSave) {
        saveToServer(data);
      }
    }, debounceMs),
    [autoSave, debounceMs, syncWithServer, isServerAvailable]
  );

  const setValue = useCallback((value) => {
    try {
      // Allow value functions to receive the previous value
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Always save to localStorage immediately
      if (typeof window !== 'undefined') {
        setStorageValue(key, valueToStore);
      }
      
      // Save to server (debounced or immediate)
      if (syncWithServer && isServerAvailable) {
        if (autoSave) {
          debouncedSave(valueToStore);
        }
      }
    } catch (error) {
      console.warn(`Error setting value for key "${key}":`, error);
    }
  }, [key, storedValue, syncWithServer, isServerAvailable, autoSave, debouncedSave]);

  const manualSync = async () => {
    if (!syncWithServer) return false;
    
    setError(null);
    try {
      const success = await saveToServer(storedValue);
      if (success) {
        console.log('✅ Manual sync completed');
      }
      return success;
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      setError(error.message);
      return false;
    }
  };

  const createBackup = async () => {
    if (!syncWithServer || !isServerAvailable) return false;
    
    try {
      const result = await apiService.createBackup();
      console.log('✅ Backup created:', result.filename);
      return result;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      setError(error.message);
      return false;
    }
  };

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Return enhanced interface
  return [
    storedValue,
    setValue,
    {
      isLoading,
      error,
      lastSyncTime,
      isServerAvailable,
      manualSync,
      createBackup,
      loadFromServer,
      checkServerAvailability
    }
  ];
}
