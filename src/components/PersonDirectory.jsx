import { useState, useCallback, useEffect } from 'react';
import TimerCard from './TimerCard';
import Statistics from './Statistics';
import Help from './Help';
import NotificationContainer, { useNotifications } from './NotificationContainer';
import UserEditModal from './UserEditModal';
import SessionEditModal from './SessionEditModal';
import { 
  exportToCSV, 
  defaultPersons, 
  calculateTotalTime, 
  startSession, 
  stopSession, 
  resetPersonSessions 
} from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTimerManager } from '../hooks/useTimerManager';

export default function PersonDirectory() {
  const [persons, setPersons, {
    isLoading,
    error,
    lastSyncTime,
    isServerAvailable,
    manualSync,
    createBackup,
    loadFromServer,
    checkServerAvailability
  }] = useLocalStorage('timehogger_persons', defaultPersons, { 
    syncWithServer: true,
    autoSave: true,
    debounceMs: 2000
  });
  
  const [view, setView] = useState('grid'); // 'grid' or 'stats'
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userForSessionEdit, setUserForSessionEdit] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Function to force display refresh
  const handleRefresh = useCallback(() => {
    setPersons(prev => [...prev]); // Force a re-render to update displayed times
  }, [setPersons]);

  // Display refresh manager
  const { getActiveTimersCount } = useTimerManager(persons, handleRefresh);

  // Sync functions
  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      const success = await manualSync();
      if (success) {
        setSyncStatus('success');
        addNotification('Data synced to server successfully', 'success');
      } else {
        setSyncStatus('error');
        addNotification('Failed to sync data to server', 'error');
      }
    } catch (error) {
      setSyncStatus('error');
      addNotification(`Sync failed: ${error.message}`, 'error');
    }
    
    // Reset status after delay
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleCreateBackup = async () => {
    try {
      const result = await createBackup();
      if (result) {
        addNotification(`Backup created: ${result.filename}`, 'success');
      } else {
        addNotification('Failed to create backup', 'error');
      }
    } catch (error) {
      addNotification(`Backup failed: ${error.message}`, 'error');
    }
  };

  const handleLoadFromServer = async () => {
    setSyncStatus('syncing');
    try {
      await loadFromServer();
      setSyncStatus('success');
      addNotification('Data loaded from server', 'success');
    } catch (error) {
      setSyncStatus('error');
      addNotification(`Load failed: ${error.message}`, 'error');
    }
    
    // Reset status after delay
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  // Toggle a person's timer
  const handleToggleTimer = useCallback((personId) => {
    setPersons(prev => prev.map(person => {
      if (person.id === personId) {
        let updatedPerson;
        if (person.isRunning) {
          // Stop the session
          updatedPerson = stopSession(person);
          addNotification(`Timer stopped for ${person.name}`, 'warning');
        } else {
          // Start a new session
          updatedPerson = startSession(person);
          addNotification(`Timer started for ${person.name}`, 'success');
        }
        return updatedPerson;
      }
      return person;
    }));
  }, [setPersons, addNotification]);

  // Stop all timers
  const handleStopAllTimers = useCallback(() => {
    const runningCount = persons.filter(p => p.isRunning).length;
    if (runningCount === 0) return;
    
    setPersons(prev => prev.map(person => {
      if (person.isRunning) {
        return stopSession(person);
      }
      return person;
    }));
    
    addNotification(`${runningCount} timer${runningCount > 1 ? 's' : ''} stopped`, 'info');
  }, [persons, setPersons, addNotification]);

  // Reset all timers
  const handleResetAllTimers = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all timers?')) {
      setPersons(prev => prev.map(person => resetPersonSessions(person)));
      addNotification('All timers have been reset', 'success');
    }
  }, [setPersons, addNotification]);

  // Add a new person
  const handleAddPerson = () => {
    setUserToEdit(null);
    setEditModalOpen(true);
  };

  // Edit a user
  const handleEditUser = (userId) => {
    const user = persons.find(p => p.id === userId);
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  // Edit a user's sessions
  const handleEditSessions = (userId) => {
    const user = persons.find(p => p.id === userId);
    setUserForSessionEdit(user);
    setSessionModalOpen(true);
  };

  // Save user modifications
  const handleSaveUser = (userData) => {
    if (userToEdit) {
      // Edit existing user
      setPersons(prev => prev.map(person => 
        person.id === userToEdit.id 
          ? { ...person, ...userData }
          : person
      ));
      addNotification(`${userData.name} updated successfully`, 'success');
    } else {
      // Create new user
      const newPerson = {
        id: Date.now(),
        sessions: [],
        currentSessionStart: null,
        isRunning: false,
        avatarType: 'emoji',
        ...userData
      };
      setPersons(prev => [...prev, newPerson]);
      addNotification(`${userData.name} added to directory`, 'success');
    }
  };

  // Save modified user sessions
  const handleSaveSessions = (updatedUser) => {
    setPersons(prev => prev.map(person => 
      person.id === updatedUser.id ? updatedUser : person
    ));
    addNotification(`Sessions for ${updatedUser.name} updated`, 'success');
  };

  // Delete a person
  const handleDeletePerson = (personId) => {
    const person = persons.find(p => p.id === personId);
    if (person && window.confirm('Are you sure you want to delete this person?')) {
      setPersons(prev => prev.filter(person => person.id !== personId));
      addNotification(`${person.name} deleted`, 'info');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear dragOverIndex if we're leaving the card entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    // Work with the current filtered array
    const newPersons = [...filteredPersons];
    const draggedPerson = newPersons[draggedItem];
    
    // Remove the dragged item
    newPersons.splice(draggedItem, 1);
    
    // Insert at new position
    const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newPersons.splice(insertIndex, 0, draggedPerson);
    
    // Update the main persons array
    if (searchTerm) {
      // If we're in a filtered view, we need to reconstruct the full array
      // This is complex, so for now let's disable drag during search
      addNotification('Cannot reorder while searching', 'warning');
    } else {
      setPersons(newPersons);
      addNotification('Order updated', 'success');
    }
    
    setDragOverIndex(null);
  };

  // Touch event handlers for mobile drag and drop
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  const handleTouchStart = (e, index) => {
    if (searchTerm) return; // Disable during search
    
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchStartX(touch.clientX);
    setDraggedItem(index);
    setIsTouchDragging(false);
  };

  const handleTouchMove = (e, index) => {
    if (searchTerm || draggedItem === null) return;
    
    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - touchStartY);
    const deltaX = Math.abs(touch.clientX - touchStartX);
    
    // If moved more than 10px, consider it a drag
    if (deltaY > 10 || deltaX > 10) {
      setIsTouchDragging(true);
      e.preventDefault(); // Prevent scrolling
      
      // Find the element under the touch point
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const cardElement = elementBelow?.closest('[data-card-index]');
      
      if (cardElement) {
        const targetIndex = parseInt(cardElement.getAttribute('data-card-index'));
        if (!isNaN(targetIndex) && targetIndex !== draggedItem) {
          setDragOverIndex(targetIndex);
        }
      }
    }
  };

  const handleTouchEnd = (e, index) => {
    if (searchTerm) return;
    
    if (isTouchDragging && draggedItem !== null && dragOverIndex !== null && draggedItem !== dragOverIndex) {
      // Perform the drop
      const newPersons = [...filteredPersons];
      const draggedPerson = newPersons[draggedItem];
      
      // Remove the dragged item
      newPersons.splice(draggedItem, 1);
      
      // Insert at new position
      const insertIndex = draggedItem < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
      newPersons.splice(insertIndex, 0, draggedPerson);
      
      setPersons(newPersons);
      addNotification('Order updated', 'success');
    }
    
    // Reset state
    setDraggedItem(null);
    setDragOverIndex(null);
    setIsTouchDragging(false);
    setTouchStartY(null);
    setTouchStartX(null);
  };

  // Filter people according to search term
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const runningCount = persons.filter(p => p.isRunning).length;
  const totalTime = persons.reduce((sum, person) => sum + calculateTotalTime(person), 0);
  const activeTimersCount = getActiveTimersCount();

  // Debug: check consistency between state and active timers
  if (runningCount !== activeTimersCount) {
    console.warn(`Inconsistency detected: ${runningCount} people running, but ${activeTimersCount} active timers`);
    console.warn('Running people:', persons.filter(p => p.isRunning).map(p => ({ id: p.id, name: p.name })));
  }

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  // Display sync status
  useEffect(() => {
    if (error) {
      addNotification(`Server error: ${error}`, 'error');
    }
  }, [error, addNotification]);

  // Debug: Log API configuration on mount
  useEffect(() => {
    const debugApiConfig = async () => {
      const apiService = (await import('../services/apiService')).default;
      const result = await apiService.testConnection();
      
      if (result.success) {
        console.log('🌐 API connected successfully');
      } else {
        console.warn('⚠️ API connection failed, running in offline mode');
      }
    };
    
    if (import.meta.env.DEV) {
      debugApiConfig();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                TimeHogger ⏰
              </h1>
              <p className="text-sm text-gray-500">
                {runningCount} timer{runningCount !== 1 ? 's' : ''} running
                {activeTimersCount !== runningCount && (
                  <span className="text-red-500"> (⚠️ {activeTimersCount} active)</span>
                )} • 
                Total: {(totalTime / 3600).toFixed(2)}h
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {/* Sync Status Indicator */}
              {isServerAvailable && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {isLoading ? (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    ) : syncStatus === 'syncing' ? (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                    ) : syncStatus === 'success' ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : syncStatus === 'error' ? (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    ) : isServerAvailable ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-500">
                      {isLoading ? 'Loading...' 
                       : syncStatus === 'syncing' ? 'Syncing...'
                       : syncStatus === 'success' ? 'Synced'
                       : syncStatus === 'error' ? 'Error'
                       : isServerAvailable ? 'Server' 
                       : 'Offline'}
                    </span>
                  </div>
                  
                  {/* Sync Controls */}
                  <div className="flex space-x-1">
                    <button
                      onClick={handleManualSync}
                      disabled={syncStatus === 'syncing'}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Manual sync to server"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCreateBackup}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Create backup"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </button>
                  </div>
                  
                  {lastSyncTime && (
                    <span className="text-xs text-gray-400" title={`Last sync: ${new Date(lastSyncTime).toLocaleString()}`}>
                      {new Date(lastSyncTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Directory
                </button>
                <button
                  onClick={() => setView('stats')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === 'stats'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Statistics
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'grid' ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddPerson}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  ➕ Add
                </button>
                
                <button
                  onClick={handleStopAllTimers}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  disabled={runningCount === 0}
                >
                  ⏸️ Stop All
                </button>
                
                <button
                  onClick={handleResetAllTimers}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  🔄 Reset All
                </button>
                
                {/* CSV Export Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    📊 Export CSV
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            exportToCSV(persons, 'summary');
                            addNotification('Summary exported successfully', 'success');
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          📋 Summary by person
                          <span className="text-xs text-gray-500 ml-auto">Total times</span>
                        </button>
                        <button
                          onClick={() => {
                            exportToCSV(persons, 'detailed');
                            addNotification('Detailed sessions exported', 'success');
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          📊 All sessions
                          <span className="text-xs text-gray-500 ml-auto">Detailed</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cards grid */}
            {filteredPersons.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No results' : 'No people'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try with a different search term'
                    : 'Start by adding people to the directory'
                  }
                </p>
              </div>
            ) : (
              <>
                {searchTerm && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Drag and drop is disabled while searching. Clear the search to reorder items.</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPersons.map((person, index) => (
                  <div 
                    key={person.id} 
                    className={`relative transition-all duration-200 ${
                      dragOverIndex === index ? 'scale-105 shadow-xl border-2 border-blue-400 border-dashed' : ''
                    } ${
                      draggedItem === index ? 'opacity-50' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    data-card-index={index} // Add data attribute for touch handling
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={(e) => handleTouchMove(e, index)}
                    onTouchEnd={(e) => handleTouchEnd(e, index)}
                  >
                    <TimerCard
                      person={person}
                      onToggleTimer={handleToggleTimer}
                      onEditUser={handleEditUser}
                      onEditSessions={handleEditSessions}
                      onDeleteUser={handleDeletePerson}
                      isDragging={draggedItem === index}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      dragDisabled={!!searchTerm}
                    />
                  </div>
                ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* Statistics view */
          <Statistics persons={persons} />
        )}
      </main>
      
      {/* Help component */}
      <Help />
      
      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* User edit modal */}
      <UserEditModal
        user={userToEdit}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveUser}
      />

      {/* Session edit modal */}
      <SessionEditModal
        person={userForSessionEdit}
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSave={handleSaveSessions}
      />
    </div>
  );
}
