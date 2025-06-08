import { useEffect, useRef } from 'react';

// Simple hook to refresh display every second
export function useTimerManager(persons, onRefresh) {
  const intervalRef = useRef(null);

  useEffect(() => {
    const hasRunningTimers = persons.some(person => person.isRunning);
    
    if (hasRunningTimers && !intervalRef.current) {
      // Start global refresh
      intervalRef.current = setInterval(() => {
        onRefresh();
      }, 1000);
    } else if (!hasRunningTimers && intervalRef.current) {
      // Stop refresh if no active timers
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [persons, onRefresh]);

  // Function to get the number of active timers
  const getActiveTimersCount = () => {
    return persons.filter(person => person.isRunning).length;
  };

  return { 
    getActiveTimersCount
  };
}
