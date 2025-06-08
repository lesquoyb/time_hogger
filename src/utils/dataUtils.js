// Time formatting in dd hh:mm:ss
export function formatTime(seconds) {
  const days = Math.floor(seconds / 86400); // 86400 seconds = 24h
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Convert seconds to days with precision
export function secondsToDays(seconds) {
  return (seconds / 86400).toFixed(3);
}

// Convert seconds to hours with 2 decimals
export function secondsToHours(seconds) {
  return (seconds / 3600).toFixed(2);
}

// Smart formatting for charts (chooses the best unit)
export function formatTimeForChart(seconds) {
  const days = seconds / 86400;
  const hours = seconds / 3600;
  
  if (days >= 1) {
    return {
      value: parseFloat(secondsToDays(seconds)),
      unit: 'days',
      label: `${secondsToDays(seconds)}d`
    };
  } else {
    return {
      value: parseFloat(secondsToHours(seconds)),
      unit: 'hours', 
      label: `${secondsToHours(seconds)}h`
    };
  }
}

// Determine the best unit for a dataset
export function getBestUnitForDataset(personsData) {
  const maxSeconds = Math.max(...personsData.map(p => calculateTotalTime ? calculateTotalTime(p) : p.totalTime || 0));
  const maxDays = maxSeconds / 86400;
  
  // If at least one person has more than 1 day, use days
  if (maxDays >= 1) {
    return {
      unit: 'days',
      convert: secondsToDays,
      suffix: 'd'
    };
  } else {
    return {
      unit: 'hours',
      convert: secondsToHours,
      suffix: 'h'
    };
  }
}

// Generate colors for charts
export function generateColors(count) {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  
  if (count <= colors.length) {
    return colors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const extraColors = [];
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden ratio for uniform distribution
    extraColors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return [...colors, ...extraColors];
}

// Export CSV summary (by person)
export function exportToCSV(persons, type = 'summary') {
  if (type === 'detailed') {
    return exportDetailedCSV(persons);
  }
  
  const headers = ['Name', 'Total Time (dd hh:mm:ss)', 'Total Time (hours)', 'Total Time (days)', 'Status'];
  const rows = persons.map(person => {
    const totalSeconds = calculateTotalTime(person);
    return [
      person.name,
      formatTime(totalSeconds),
      secondsToHours(totalSeconds),
      secondsToDays(totalSeconds),
      person.isRunning ? 'Running' : 'Stopped'
    ];
  });
  
  downloadCSV(headers, rows, 'timehogger-summary');
}

// Export detailed CSV (all sessions)
export function exportDetailedCSV(persons) {
  const headers = [
    'Name', 
    'Session ID', 
    'Start Date', 
    'Start Time', 
    'End Date', 
    'End Time', 
    'Duration (dd hh:mm:ss)', 
    'Duration (hours)', 
    'Duration (days)',
    'Status'
  ];
  
  const rows = [];
  
  persons.forEach(person => {
    if (person.sessions && person.sessions.length > 0) {
      person.sessions.forEach(session => {
        const startDate = new Date(session.start);
        const endDate = session.end ? new Date(session.end) : null;
        const duration = session.duration || 0;
        
        rows.push([
          person.name,
          session.id,
          startDate.toLocaleDateString('en-US'),
          startDate.toLocaleTimeString('en-US'),
          endDate ? endDate.toLocaleDateString('en-US') : '',
          endDate ? endDate.toLocaleTimeString('en-US') : '',
          formatTime(duration),
          secondsToHours(duration),
          secondsToDays(duration),
          endDate ? 'Completed' : 'Running'
        ]);
      });
    }
    
    // Current session
    if (person.isRunning && person.currentSessionStart) {
      const startDate = new Date(person.currentSessionStart);
      const currentDuration = calculateCurrentSessionTime(person);
      
      rows.push([
        person.name,
        'Current',
        startDate.toLocaleDateString('en-US'),
        startDate.toLocaleTimeString('en-US'),
        '',
        '',
        formatTime(currentDuration),
        secondsToHours(currentDuration),
        secondsToDays(currentDuration),
        'Running'
      ]);
    }
  });
  
  downloadCSV(headers, rows, 'timehogger-detailed-sessions');
}

// Utility function to download a CSV
function downloadCSV(headers, rows, filename) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Add BOM for UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Calculate total time for a person
export function calculateTotalTime(person) {
  let total = 0;
  
  // Add time from completed sessions
  if (person.sessions) {
    person.sessions.forEach(session => {
      total += session.duration;
    });
  }
  
  // Add time from current session if it exists
  if (person.currentSessionStart) {
    const now = Date.now();
    total += Math.floor((now - person.currentSessionStart) / 1000);
  }
  
  // Fallback for old format
  if (person.totalTime && !person.sessions) {
    total = person.totalTime;
  }
  
  return total;
}

// Calculate current session time (0 if no active session)
export function calculateCurrentSessionTime(person) {
  if (!person.isRunning || !person.currentSessionStart) {
    return 0;
  }
  
  const now = Date.now();
  return Math.floor((now - person.currentSessionStart) / 1000);
}

// Start a session
export function startSession(person) {
  if (person.isRunning) return person; // Already running
  
  return {
    ...person,
    isRunning: true,
    currentSessionStart: Date.now()
  };
}

// Stop a session
export function stopSession(person) {
  if (!person.isRunning || !person.currentSessionStart) return person; // Not running
  
  const now = Date.now();
  const duration = Math.floor((now - person.currentSessionStart) / 1000);
  
  const newSession = {
    id: Date.now(),
    start: person.currentSessionStart,
    end: now,
    duration: duration
  };
  
  return {
    ...person,
    isRunning: false,
    currentSessionStart: null,
    sessions: [...(person.sessions || []), newSession]
  };
}

// Reset all sessions for a person
export function resetPersonSessions(person) {
  return {
    ...person,
    sessions: [],
    currentSessionStart: null,
    isRunning: false
  };
}

// Default data with new structure
export const defaultPersons = [
  { 
    id: 1, 
    name: 'Alice Martin', 
    avatar: '👩‍💼',
    avatarType: 'emoji',
    color: '#3B82F6', // Blue
    sessions: [],
    currentSessionStart: null,
    isRunning: false
  },
  { 
    id: 2, 
    name: 'Bob Smith', 
    avatar: '👨‍💻',
    avatarType: 'emoji',
    color: '#10B981', // Green
    sessions: [],
    currentSessionStart: null,
    isRunning: false
  },
  { 
    id: 3, 
    name: 'Claire Johnson', 
    avatar: '👩‍🎨',
    avatarType: 'emoji',
    color: '#8B5CF6', // Purple
    sessions: [],
    currentSessionStart: null,
    isRunning: false
  }
];
