import { useState, useEffect } from 'react';
import { formatTime } from '../utils/dataUtils';

export default function SessionEditModal({ person, isOpen, onClose, onSave }) {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    startTime: '',
    endTime: '',
    duration: 0
  });

  useEffect(() => {
    if (person && isOpen) {
      // Copy all finished sessions
      let allSessions = [...person.sessions];
      
      // Add current session if it exists
      if (person.isRunning && person.currentSessionStart) {
        const currentSession = {
          id: 'current-session',
          startTime: person.currentSessionStart,
          endTime: Date.now(),
          duration: Math.floor((Date.now() - person.currentSessionStart) / 1000),
          isCurrent: true
        };
        allSessions.push(currentSession);
      }
      
      setSessions(allSessions);
    }
  }, [person, isOpen]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseDateTime = (dateTimeString) => {
    return new Date(dateTimeString).getTime();
  };

  const calculateDuration = (start, end) => {
    return Math.max(0, Math.floor((end - start) / 1000));
  };

  const handleAddSession = () => {
    if (!newSession.startTime || !newSession.endTime) {
      alert('Please fill in start and end times');
      return;
    }

    const startTime = parseDateTime(newSession.startTime);
    const endTime = parseDateTime(newSession.endTime);

    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    const duration = calculateDuration(startTime, endTime);
    const session = {
      id: Date.now(),
      startTime,
      endTime,
      duration
    };

    setSessions(prev => [...prev, session].sort((a, b) => a.startTime - b.startTime));
    setNewSession({ startTime: '', endTime: '', duration: 0 });
  };

  const handleEditSession = (sessionId, field, value) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const updated = { ...session, [field]: value };
        
        if (field === 'startTime' || field === 'endTime') {
          const newValue = parseDateTime(value);
          updated[field] = newValue;
          
          // Recalculate duration if both fields are filled
          if (updated.startTime && updated.endTime && updated.endTime > updated.startTime) {
            updated.duration = calculateDuration(updated.startTime, updated.endTime);
          }
        }
        
        return updated;
      }
      return session;
    }));
  };

  const handleDeleteSession = (sessionId) => {
    if (sessionId === 'current-session') {
      alert('Cannot delete current session');
      return;
    }
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    }
  };

  const handleSave = () => {
    // Filter valid sessions (exclude current session)
    const validSessions = sessions.filter(session => 
      !session.isCurrent && // Exclude current session
      session.startTime && 
      session.endTime && 
      session.endTime > session.startTime &&
      session.duration > 0
    );

    if (validSessions.length !== sessions.filter(s => !s.isCurrent).length) {
      alert('Some sessions have invalid data and will be removed');
    }

    onSave({
      ...person,
      sessions: validSessions
    });
    onClose();
  };

  const getTotalTime = () => {
    return sessions.reduce((total, session) => total + (session.duration || 0), 0);
  };

  if (!isOpen || !person) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {person.name} Sessions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Total time: {formatTime(getTotalTime())} • {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Add new session */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add new session</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start
                </label>
                <input
                  type="datetime-local"
                  value={newSession.startTime}
                  onChange={(e) => setNewSession(prev => ({...prev, startTime: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End
                </label>
                <input
                  type="datetime-local"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession(prev => ({...prev, endTime: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddSession}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ➕ Add
                </button>
              </div>
            </div>
          </div>

          {/* Session list */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Existing sessions</h3>
            
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⏱️</div>
                <p>No recorded sessions</p>
                <p className="text-sm">Add a new session above</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div key={session.id} className={`flex items-center gap-4 p-4 rounded-lg ${
                    session.isCurrent ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                  }`}>
                    {session.isCurrent && (
                      <div className="flex-shrink-0 text-green-600 font-semibold text-sm">
                        ⏱️ RUNNING
                      </div>
                    )}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start</label>
                        <input
                          type="datetime-local"
                          value={formatDateTime(session.startTime)}
                          onChange={(e) => handleEditSession(session.id, 'startTime', e.target.value)}
                          disabled={session.isCurrent}
                          className={`w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            session.isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          {session.isCurrent ? 'Now' : 'End'}
                        </label>
                        <input
                          type="datetime-local"
                          value={formatDateTime(session.endTime)}
                          onChange={(e) => handleEditSession(session.id, 'endTime', e.target.value)}
                          disabled={session.isCurrent}
                          className={`w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            session.isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-gray-600">Duration</div>
                      <div className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                        {formatTime(session.duration || 0)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        session.isCurrent 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-500 hover:bg-red-100'
                      }`}
                      title={session.isCurrent ? 'Current session cannot be deleted' : 'Delete this session'}
                      disabled={session.isCurrent}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Calculated total: <span className="font-bold">{formatTime(getTotalTime())}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
