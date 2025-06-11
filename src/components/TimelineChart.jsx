import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { calculateTotalTime, formatTime } from '../utils/dataUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom Gantt Chart Component
function CustomGanttChart({ timelineData, personsWithSessions, timeRange }) {
  if (!timelineData) return null;

  const { allSessions, startDate, endDate } = timelineData;
  
  // Get persons who have sessions in this time range
  const personsWithFilteredSessions = personsWithSessions.filter(person => 
    allSessions.some(session => session.personId === person.id)
  );

  if (personsWithFilteredSessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">No sessions in this time period</p>
          <p className="text-sm mt-1">Try selecting a different time range</p>
        </div>
      </div>
    );
  }

  const timeSpan = endDate - startDate;
  
  // Helper function to calculate position percentage
  const getPositionPercent = (timestamp) => {
    return ((timestamp - startDate) / timeSpan) * 100;
  };

  // Helper function to calculate width percentage
  const getWidthPercent = (start, end) => {
    return ((end - start) / timeSpan) * 100;
  };
  // Format time for display
  const formatTimeLabel = (timestamp) => {
    const date = new Date(timestamp);
    if (timeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '7d') {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === new Date(today.getTime() - 86400000).toDateString();
      
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (timeRange === '30d') {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
    }
  };

  // Generate time grid lines with better intervals
  const generateTimeGrid = () => {
    const gridLines = [];
    let intervals;
    
    // Adjust intervals based on time range for better readability
    if (timeRange === '24h') {
      intervals = 8; // Every 3 hours
    } else if (timeRange === '7d') {
      intervals = 7; // Each day
    } else if (timeRange === '30d') {
      intervals = 6; // Every 5 days
    } else {
      // For 'all' time range, use adaptive intervals based on duration
      const durationDays = (endDate - startDate) / (24 * 60 * 60 * 1000);
      if (durationDays <= 30) {
        intervals = 6;
      } else if (durationDays <= 90) {
        intervals = 9;
      } else {
        intervals = 12;
      }
    }
    
    for (let i = 0; i <= intervals; i++) {
      const timestamp = startDate + (timeSpan * i / intervals);
      const position = (i / intervals) * 100;
      
      gridLines.push({
        position,
        timestamp,
        label: formatTimeLabel(timestamp)
      });
    }
    
    return gridLines;
  };

  const timeGrid = generateTimeGrid();  return (
    <div className="h-full flex flex-col bg-white">
      {/* Main content with scrollable timeline */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Person rows container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Fixed left column for person names */}
          <div className="w-48 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            <div className="space-y-1 p-3">
              {personsWithFilteredSessions.map((person, index) => {
                // Calculate this person's rank based on total duration in current time range
                const personSessions = allSessions.filter(s => s.personId === person.id);
                const totalDuration = personSessions.reduce((sum, session) => sum + session.duration, 0);
                
                // Get all person totals to determine rank
                const allPersonTotals = personsWithFilteredSessions.map(p => {
                  const pSessions = allSessions.filter(s => s.personId === p.id);
                  return {
                    id: p.id,
                    totalDuration: pSessions.reduce((sum, session) => sum + session.duration, 0)
                  };
                }).sort((a, b) => b.totalDuration - a.totalDuration);
                
                const rank = allPersonTotals.findIndex(p => p.id === person.id);
                const isTopThree = rank < 3 && allPersonTotals.length > 1;
                const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;                return (
                  <div key={person.id} className="flex items-center h-20 px-3 relative">
                    {/* Medal for top 3 */}
                    {isTopThree && medal && (
                      <div className="absolute -top-1 -left-1 text-lg z-10">
                        {medal}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 overflow-hidden flex-shrink-0"
                           style={{ borderColor: person.color || '#9CA3AF' }}>
                        {person.avatarType === 'photo' ? (
                          <img 
                            src={person.avatar} 
                            alt={`${person.name} avatar`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base">{person.avatar}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-base font-medium text-gray-800 truncate block" title={person.name}>
                          {person.name}
                        </span>
                        {totalDuration > 0 && (
                          <span className="text-sm text-gray-500 block">
                            {formatTime(totalDuration)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable timeline area */}
          <div className="flex-1 overflow-x-auto">
            <div className="relative h-full" style={{ minWidth: '800px', width: '100%' }}>
              {/* Vertical grid lines background */}
              <div className="absolute inset-0">
                {timeGrid.map((grid, index) => (
                  <div
                    key={`bg-line-${index}`}
                    className="absolute top-0 bottom-0 w-px bg-gray-200"
                    style={{ left: `${grid.position}%` }}
                  />
                ))}
              </div>

              {/* Person timeline rows - no internal scrolling */}
              <div className="relative space-y-1 p-3 h-full">
                {personsWithFilteredSessions.map((person) => {
                  const personSessions = allSessions.filter(s => s.personId === person.id);
                    return (
                    <div key={person.id} className="relative h-20 flex items-center">
                      {/* Timeline track background */}
                      <div className="w-full h-10 bg-gray-100 rounded relative">
                        {/* Session bars */}
                        {personSessions.map((session, sessionIndex) => {
                          const left = getPositionPercent(session.startTime);
                          const width = getWidthPercent(session.startTime, session.endTime);
                          
                          return (
                            <div
                              key={`${person.id}-${sessionIndex}`}
                              className={`absolute top-1 bottom-1 rounded border shadow-sm cursor-pointer ${
                                session.isRunning ? 'animate-pulse shadow-md' : ''
                              }`}
                              style={{
                                left: `${left}%`,
                                width: `${Math.max(width, 0.3)}%`, // Minimum width for visibility
                                backgroundColor: session.isRunning 
                                  ? (person.color || '#9CA3AF') + 'CC'
                                  : (person.color || '#9CA3AF'),
                                borderColor: session.isRunning 
                                  ? person.color || '#9CA3AF'
                                  : 'transparent'
                              }}
                              title={`${person.name}: ${formatTime(session.duration)} ${session.isRunning ? '(Running)' : ''}\n${new Date(session.startTime).toLocaleString()} - ${new Date(session.endTime).toLocaleString()}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Time axis at bottom */}
        <div className="border-t border-gray-200 bg-white">
          <div className="flex">
            {/* Empty space for left column alignment */}
            <div className="w-48 flex-shrink-0"></div>
            
            {/* Time labels - same width as timeline area */}
            <div className="flex-1 relative h-8">
              <div className="relative h-full" style={{ minWidth: '800px', width: '100%' }}>
                {timeGrid.map((grid, index) => (
                  <div
                    key={`time-${index}`}
                    className="absolute top-1 text-xs text-gray-600 transform -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${grid.position}%` }}
                  >
                    {grid.label}
                  </div>
                ))}
                
                {/* Time axis line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-300"></div>
                
                {/* Time tick marks */}
                {timeGrid.map((grid, index) => (
                  <div
                    key={`tick-${index}`}
                    className="absolute top-0 w-px h-2 bg-gray-400"
                    style={{ left: `${grid.position}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TimelineChart({ persons }) {
  // Separate time ranges for each view type
  const [timeRanges, setTimeRanges] = useState({
    sessions: '7d',
    cumulative: '7d', 
    daily: '7d',
    leaderboard: '7d'
  });
  const [viewType, setViewType] = useState('sessions'); // 'sessions', 'cumulative', 'daily', 'leaderboard'

  // Get current time range for active view
  const timeRange = timeRanges[viewType];

  // Handle time range changes for current view type
  const setTimeRange = (newTimeRange) => {
    setTimeRanges(prev => ({
      ...prev,
      [viewType]: newTimeRange
    }));
  };

  // Handle view type changes with automatic time range adjustment
  const handleViewTypeChange = (newViewType) => {
    setViewType(newViewType);
    // If switching to daily view and its current time range is 24h, switch to 7d
    if (newViewType === 'daily' && timeRanges[newViewType] === '24h') {
      setTimeRanges(prev => ({
        ...prev,
        [newViewType]: '7d'
      }));
    }
  };

  // Filter people who have recorded time
  const personsWithSessions = persons.filter(person => 
    (person.sessions && person.sessions.length > 0) || person.isRunning
  );

  // Generate timeline data
  const timelineData = useMemo(() => {
    if (personsWithSessions.length === 0) return null;

    // Get all sessions from all persons
    const allSessions = [];
    personsWithSessions.forEach(person => {
      // Add completed sessions
      if (person.sessions) {
        person.sessions.forEach(session => {
          allSessions.push({
            person: person.name,
            personId: person.id,
            color: person.color || '#9CA3AF',
            startTime: session.start || session.startTime,
            endTime: session.end || session.endTime,
            duration: session.duration,
            isRunning: false
          });
        });
      }

      // Add current session if running
      if (person.isRunning && person.currentSessionStart) {
        allSessions.push({
          person: person.name,
          personId: person.id,
          color: person.color || '#9CA3AF',
          startTime: person.currentSessionStart,
          endTime: Date.now(),
          duration: Math.floor((Date.now() - person.currentSessionStart) / 1000),
          isRunning: true
        });
      }
    });

    // Sort sessions by start time
    allSessions.sort((a, b) => a.startTime - b.startTime);

    if (allSessions.length === 0) return null;    // Filter by time range
    const now = Date.now();
    let startDate, endDate;
    switch (timeRange) {
      case '24h':
        // From midnight to 23:59 of current day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate = today.getTime();
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        endDate = endOfDay.getTime();
        break;
      case '7d':
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '30d':
        startDate = now - (30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = allSessions[0].startTime;
        endDate = now;
    }

    const filteredSessions = allSessions.filter(session => 
      session.startTime >= startDate
    );

    if (filteredSessions.length === 0) return null;

    return { allSessions: filteredSessions, startDate, endDate };
  }, [personsWithSessions, timeRange]);  // Generate chart data based on view type (excluding sessions - handled by custom component)
  const chartData = useMemo(() => {
    if (!timelineData || viewType === 'sessions') return null;

    const { allSessions, startDate, endDate } = timelineData;    if (viewType === 'cumulative') {
      // Cumulative time chart
      const datasets = personsWithSessions.map(person => {
        const personSessions = allSessions.filter(s => s.personId === person.id);
        const dataPoints = [];
        
        let cumulativeTime = 0;
        dataPoints.push({ x: new Date(startDate), y: 0 });
        
        personSessions.forEach(session => {
          // Point before session starts
          dataPoints.push({ x: new Date(session.startTime), y: cumulativeTime / 3600 });
          
          // Point after session ends
          cumulativeTime += session.duration;
          dataPoints.push({ x: new Date(session.endTime), y: cumulativeTime / 3600 });
        });
        
        // Final point at current time
        dataPoints.push({ x: new Date(endDate), y: cumulativeTime / 3600 });

        return {
          label: person.name,
          data: dataPoints,
          borderColor: person.color || '#9CA3AF',
          backgroundColor: (person.color || '#9CA3AF') + '20',
          fill: false,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 6
        };
      });

      return { datasets };
    }
      else if (viewType === 'daily') {
      // Daily aggregated time
      const dailyData = new Map();
      
      allSessions.forEach(session => {
        const dayKey = new Date(session.startTime).toDateString();
        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, new Map());
        }
        
        const dayPersonData = dailyData.get(dayKey);
        const currentTime = dayPersonData.get(session.personId) || 0;
        dayPersonData.set(session.personId, currentTime + session.duration);
      });

      // Generate all days in the range for proper x-axis spacing
      const allDays = [];
      const startDay = new Date(startDate);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(endDate);
      endDay.setHours(23, 59, 59, 999);
      
      for (let day = new Date(startDay); day <= endDay; day.setDate(day.getDate() + 1)) {
        allDays.push(new Date(day).toDateString());
      }

      // Convert to chart format with complete day coverage
      const datasets = personsWithSessions.map(person => {
        const dataPoints = allDays.map(dayKey => ({
          x: new Date(dayKey),
          y: (dailyData.get(dayKey)?.get(person.id) || 0) / 3600
        }));

        return {
          label: person.name,
          data: dataPoints,
          borderColor: person.color || '#9CA3AF',
          backgroundColor: (person.color || '#9CA3AF') + '40',
          fill: false,
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 6
        };
      });

      return { datasets };
    }return null;
  }, [timelineData, viewType, personsWithSessions]);
  // Generate leaderboard data
  const leaderboardData = useMemo(() => {
    if (!timelineData) return null;

    const { allSessions } = timelineData;
    
    // Calculate total time per person
    const personTotals = new Map();
    
    allSessions.forEach(session => {
      const person = personsWithSessions.find(p => p.id === session.personId);
      const currentTotal = personTotals.get(session.personId) || {
        name: session.person,
        color: session.color,
        avatar: person?.avatar || '👤',
        avatarType: person?.avatarType || 'emoji',
        totalDuration: 0,
        sessionCount: 0,
        avgDuration: 0,
        isRunning: false
      };
      
      currentTotal.totalDuration += session.duration;
      currentTotal.sessionCount += 1;
      if (session.isRunning) currentTotal.isRunning = true;
      
      personTotals.set(session.personId, currentTotal);
    });
    
    // Convert to array and sort by total duration
    const sortedPersons = Array.from(personTotals.values())
      .map(person => ({
        ...person,
        avgDuration: person.totalDuration / person.sessionCount
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration);
      return sortedPersons;
  }, [timelineData, personsWithSessions]);const chartOptions = useMemo(() => {
    if (!timelineData) return {};
    
    const { startDate, endDate } = timelineData;
      return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: viewType === 'sessions' ? 'y' : 'x', // Horizontal bars for Gantt chart
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: viewType === 'sessions' ? {
        x: {
          type: 'time',
          min: new Date(startDate),
          max: new Date(endDate),
          time: {
            displayFormats: {
              hour: 'HH:mm',
              day: 'MMM dd',
              week: 'MMM dd',
              month: 'MMM yyyy'
            }
          },
          title: {
            display: true,
            text: 'Time',
            color: '#6B7280',
            font: { size: 12 }
          },
          grid: {
            color: '#F3F4F6'
          }
        },        y: {
          type: 'category',
          title: {
            display: true,
            text: 'People',
            color: '#6B7280',
            font: { size: 12 }
          },
          grid: {
            color: '#F3F4F6'
          }
        }      } : {
        x: {
          type: 'time',
          min: new Date(startDate),
          max: new Date(endDate),          time: {
            unit: viewType === 'daily' ? 'day' : (timeRange === '7d' && viewType === 'cumulative') ? 'day' : undefined,
            stepSize: viewType === 'daily' ? 1 : (timeRange === '7d' && viewType === 'cumulative') ? 1 : undefined,
            displayFormats: {
              hour: 'HH:mm',
              day: 'MMM dd',
              week: 'MMM dd',
              month: 'MMM yyyy'
            },
            tooltipFormat: viewType === 'daily' ? 'MMM dd, yyyy' : undefined
          },
          title: {
            display: true,
            text: 'Time',
            color: '#6B7280',
            font: { size: 12 }
          },
          grid: {
            color: '#F3F4F6'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
            color: '#6B7280',
            font: { size: 12 }
          },
          grid: {
            color: '#F3F4F6'
          },
          ticks: {
            callback: function(value) {
              return value.toFixed(1) + 'h';
            }
          }        }
      },
      plugins: {
        title: {
          display: true,
          text: getChartTitle(),
          font: { size: 16, weight: 'bold' },
          color: '#374151',
        },
        legend: {
          display: viewType !== 'sessions',
          position: 'top',
          filter: function(legendItem, chartData) {
            // For Gantt chart, only show items with labels
            return legendItem.text && legendItem.text.trim() !== '';
          }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              if (viewType === 'sessions') {
                const sessionInfo = context[0].raw.sessionInfo;
                return `${sessionInfo.person} - Session`;
              }
              return new Date(context[0].parsed.x).toLocaleString();
            },
            label: function(context) {
              if (viewType === 'sessions') {
                const sessionInfo = context.raw.sessionInfo;
                const startTime = new Date(sessionInfo.startTime).toLocaleTimeString();
                const endTime = new Date(sessionInfo.endTime).toLocaleTimeString();
                const startDate = new Date(sessionInfo.startTime).toLocaleDateString();
                return [
                  `Date: ${startDate}`,
                  `Start: ${startTime}`,
                  `End: ${endTime}`,
                  `Duration: ${formatTime(sessionInfo.duration)}`,
                  sessionInfo.isRunning ? '🟢 Currently running' : '⏹️ Completed'
                ];
              } else {
                const hours = context.parsed.y;
                const seconds = hours * 3600;
                return `${context.dataset.label}: ${formatTime(seconds)}`;
              }
            }
          }
        }
      }
    };
  }, [timelineData, viewType]);  function getChartTitle() {
    const titles = {
      sessions: 'Recording Sessions Timeline',
      cumulative: 'Cumulative Time per Person',
      daily: 'Daily Time per Person',
      leaderboard: 'Leaderboard - Total Recorded Time'
    };
    return titles[viewType] || 'Timeline Chart';
  }
  if (personsWithSessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Timeline Chart</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">⏱️</div>
          <p className="text-gray-500">No sessions recorded</p>
          <p className="text-sm text-gray-400 mt-1">Start sessions to see activity over time</p>
        </div>
      </div>
    );
  }
  if (!timelineData || (!chartData && viewType !== 'leaderboard' && viewType !== 'sessions')) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Timeline Chart</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">No data in this time range</p>
          <p className="text-sm text-gray-400 mt-1">Change the time period to see more data</p>
        </div>
      </div>
    );
  }

  return (    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">📈 Timeline Chart</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">            <button
              onClick={() => handleViewTypeChange('sessions')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewType === 'sessions'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ⏺️ Sessions
            </button>
            <button
              onClick={() => handleViewTypeChange('cumulative')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewType === 'cumulative'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📈 Cumulative
            </button>
            <button
              onClick={() => handleViewTypeChange('daily')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewType === 'daily'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >              📅 Daily
            </button>
            <button
              onClick={() => handleViewTypeChange('leaderboard')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewType === 'leaderboard'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {viewType !== 'daily' && (
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === '24h'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                24h
              </button>
            )}
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === '7d'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === '30d'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              30d
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {      /* Chart */}
      <div className="h-96">        {viewType === 'leaderboard' ? (
          <div className="h-full overflow-y-auto">
            {leaderboardData && leaderboardData.length > 0 ? (
              <div className="space-y-3">
                {leaderboardData.map((person, index) => (
                  <div
                    key={person.name}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold text-white"
                           style={{
                             backgroundColor: index === 0 ? '#FFD700' : 
                                            index === 1 ? '#C0C0C0' : 
                                            index === 2 ? '#CD7F32' : person.color || '#9CA3AF'
                           }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                        {/* Avatar */}
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border-2 overflow-hidden"
                           style={{ borderColor: person.color || '#9CA3AF' }}>
                        {person.avatarType === 'photo' ? (
                          <img 
                            src={person.avatar} 
                            alt={`${person.name} avatar`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">{person.avatar}</span>
                        )}
                      </div>
                      
                      {/* Person info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{person.name}</h3>
                          {person.isRunning && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              🟢 Recording
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Sessions: {person.sessionCount}</div>
                          <div>Average: {formatTime(person.avgDuration)}</div>
                        </div>
                      </div>
                    </div>
                      {/* Total time */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {formatTime(person.totalDuration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : timelineData ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-lg">No sessions in this time period</p>
                <p className="text-sm mt-1">Try selecting a different time range</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-lg">No data for leaderboard</p>
                <p className="text-sm mt-1">Start recording sessions to see rankings</p>
              </div>
            )}
          </div>        ) : viewType === 'sessions' ? (
          <CustomGanttChart 
            timelineData={timelineData} 
            personsWithSessions={personsWithSessions} 
            timeRange={timeRange} 
          />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Description */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          {viewType === 'sessions' && (
            <p>
              <strong>Sessions Timeline:</strong> Shows when each person was recording. Each horizontal bar represents a recording session with its duration.
            </p>
          )}
          {viewType === 'cumulative' && (
            <p>
              <strong>Cumulative Time:</strong> Shows the evolution of total recorded time for each person over time.
            </p>
          )}          {viewType === 'daily' && (
            <p>
              <strong>Daily Time:</strong> Aggregates the total time recorded per day for each person.
            </p>
          )}
          {viewType === 'leaderboard' && (
            <p>
              <strong>Leaderboard:</strong> Ranking of people by their total recorded time in the selected time period. Gold, silver, and bronze medals for the top 3 performers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
