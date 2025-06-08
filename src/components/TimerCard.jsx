import { formatTime, calculateTotalTime, calculateCurrentSessionTime } from '../utils/dataUtils';

export default function TimerCard({ person, onToggleTimer, onEditUser, onEditSessions, onDeleteUser, isDragging = false, onDragStart, onDragEnd, dragDisabled = false }) {
  const handleToggle = () => {
    onToggleTimer(person.id);
  };

  const handleEdit = () => {
    onEditUser(person.id);
  };

  const handleEditSessions = () => {
    onEditSessions(person.id);
  };

  const handleDelete = () => {
    onDeleteUser(person.id);
  };

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group ${isDragging ? 'opacity-50' : ''}`}
      draggable={!dragDisabled}
      onDragStart={!dragDisabled ? handleDragStart : undefined}
      onDragEnd={!dragDisabled ? handleDragEnd : undefined}
    >
      {/* Action buttons - always visible on mobile, hover on desktop */}
      <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-sm"
          title="Edit user"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-sm"
          title="Delete user"
        >
          ×
        </button>
      </div>

      {/* Drag handle - visible on mobile and tablets */}
      {!dragDisabled && (
        <div className="absolute top-2 left-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm" title="Drag to reorder">
            ⠿
          </div>
        </div>
      )}

      {/* Avatar and name */}
      <div className="flex items-center mb-4">
        <div className="text-3xl mr-3 relative">
          {person.avatarType === 'photo' ? (
            <img 
              src={person.avatar} 
              alt={`${person.name} avatar`} 
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: person.color || '#9CA3AF' }}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: person.color || '#9CA3AF' }}
            >
              {person.avatar}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{person.name}</h3>
          <div className="text-sm text-gray-500">
            <div>{person.isRunning ? 'Running...' : 'Stopped'}</div>
            {person.color && (
              <div 
                className="inline-block w-3 h-3 rounded-full mt-1"
                style={{ backgroundColor: person.color }}
                title="User color"
              ></div>
            )}
          </div>
        </div>
      </div>

      {/* Time display */}
      <div className="text-center mb-4">
        {/* Total time */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Total time</div>
          <div className={`text-xl font-mono font-bold ${
            person.isRunning ? 'text-blue-600' : 'text-gray-700'
          }`}>
            {formatTime(calculateTotalTime(person))}
          </div>
        </div>
        
        {/* Current session time */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Current session</div>
          <div className={`text-lg font-mono font-semibold ${
            person.isRunning ? 'text-green-600' : 'text-gray-400'
          }`}>
            {formatTime(calculateCurrentSessionTime(person))}
          </div>
        </div>
      </div>

      {/* Indicateur visuel */}
      <div className={`h-1 rounded-full mb-4 ${
        person.isRunning ? 'bg-blue-500' : 'bg-gray-200'
      }`}>
        {person.isRunning && (
          <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            person.isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {person.isRunning ? (
            <>
              <span className="text-white text-lg">⏸</span>
              <span>Pause</span>
            </>
          ) : (
            <>
              <span className="text-white text-lg">▶</span>
              <span>Start</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleEditSessions}
          className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          title="Edit sessions"
        >
          📊
        </button>
      </div>
    </div>
  );
}
