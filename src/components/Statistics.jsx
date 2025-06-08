import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { generateColors, formatTimeForChart, getBestUnitForDataset, calculateTotalTime, formatTime } from '../utils/dataUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics({ persons }) {
  const [chartType, setChartType] = useState('bar');

  // Filter people who have either recorded time OR an active timer
  const personsWithTimeOrRunning = persons.filter(person => 
    calculateTotalTime(person) > 0 || person.isRunning
  );

  if (personsWithTimeOrRunning.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Statistics</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">No data to display at the moment</p>
          <p className="text-sm text-gray-400 mt-1">Start timers to see the charts</p>
        </div>
      </div>
    );
  }

  const colors = personsWithTimeOrRunning.map(person => person.color || '#9CA3AF');
  const names = personsWithTimeOrRunning.map(p => p.name);
  
  // Determine the best unit for this dataset
  const bestUnit = getBestUnitForDataset(personsWithTimeOrRunning);
  const unitLabel = bestUnit.unit;
  const totalData = personsWithTimeOrRunning.map(person => {
    const totalSeconds = calculateTotalTime(person);
    return parseFloat(bestUnit.convert(totalSeconds));
  });

  // Chart configuration
  const chartData = {
    labels: names,
    datasets: [
      {
        label: `Time (${unitLabel})`,
        data: totalData,
        backgroundColor: colors.map(color => color + '80'), // Add transparency
        borderColor: colors,
        borderWidth: 2,
        borderRadius: chartType === 'bar' ? 6 : 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType === 'doughnut',
        position: 'bottom',
      },
      title: {
        display: true,
        text: chartType === 'bar' 
          ? `Time Worked per Person (${unitLabel})`
          : `Time Distribution (${unitLabel})`,
        font: { size: 16, weight: 'bold' },
        color: '#374151',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const personIndex = context.dataIndex;
            const person = personsWithTimeOrRunning[personIndex];
            const totalSeconds = calculateTotalTime(person);
            return [
              `${context.label}: ${context.parsed.y || context.parsed} ${unitLabel}`,
              `Formatted: ${formatTime(totalSeconds)}`,
              `Status: ${person.isRunning ? 'Running' : 'Stopped'}`
            ];
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `Time (${unitLabel})`,
          color: '#6B7280',
          font: { size: 12 }
        },
        grid: {
          color: '#F3F4F6'
        }
      },
      x: {
        title: {
          display: true,
          text: 'People',
          color: '#6B7280',
          font: { size: 12 }
        },
        grid: {
          display: false
        }
      }
    } : undefined
  };

  return (
    <div className="space-y-6">
      {/* Header with chart type selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Statistics</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Bar Chart
            </button>
            <button
              onClick={() => setChartType('doughnut')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === 'doughnut'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🍩 Donut Chart
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-96">
          {chartType === 'bar' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Doughnut data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Statistics table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Person</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Formatted Time</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Hours</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Days</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Sessions</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {personsWithTimeOrRunning
                .sort((a, b) => calculateTotalTime(b) - calculateTotalTime(a))
                .map((person, index) => {
                  const totalSeconds = calculateTotalTime(person);
                  const totalHours = (totalSeconds / 3600).toFixed(2);
                  const totalDays = (totalSeconds / 86400).toFixed(3);
                  const sessionCount = (person.sessions || []).length + (person.isRunning ? 1 : 0);
                  
                  return (
                    <tr key={person.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm overflow-hidden border-2"
                            style={{ borderColor: person.color }}
                          >
                            {person.avatarType === 'photo' ? (
                              <img 
                                src={person.avatar} 
                                alt={`${person.name} avatar`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{person.avatar}</span>
                            )}
                          </div>
                          <span className="font-medium">{person.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">
                        {formatTime(totalSeconds)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {totalHours}h
                      </td>
                      <td className="py-3 px-4 text-right">
                        {totalDays}d
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {sessionCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          person.isRunning 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {person.isRunning ? 'Running' : 'Stopped'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Global summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {personsWithTimeOrRunning.length}
              </div>
              <div className="text-sm text-blue-600">
                Active People
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatTime(personsWithTimeOrRunning.reduce((sum, person) => sum + calculateTotalTime(person), 0))}
              </div>
              <div className="text-sm text-green-600">
                Total Time
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {personsWithTimeOrRunning.filter(p => p.isRunning).length}
              </div>
              <div className="text-sm text-orange-600">
                Currently Running
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
