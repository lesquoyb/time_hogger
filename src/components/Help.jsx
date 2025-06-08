import { useState } from 'react';

export default function Help() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors z-50"
        title="Help"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            User Guide ⏰
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Start section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              🚀 Quick Start
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-blue-800">
                <strong>1.</strong> Click on <span className="bg-blue-100 px-2 py-1 rounded">➕ Add</span> to create people
              </p>
              <p className="text-sm text-blue-800">
                <strong>2.</strong> Use <span className="bg-blue-100 px-2 py-1 rounded">Start</span> to start a timer
              </p>
              <p className="text-sm text-blue-800">
                <strong>3.</strong> Click <span className="bg-blue-100 px-2 py-1 rounded">Stop</span> to stop tracking
              </p>
              <p className="text-sm text-blue-800">
                <strong>4.</strong> View <span className="bg-blue-100 px-2 py-1 rounded">Statistics</span> for visual reports
              </p>
            </div>
          </section>

          {/* Main Features section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              ⭐ Main Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <span className="text-green-600">👤</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Person Management</h4>
                  <p className="text-sm text-gray-600">Add, edit, and delete people. Customize their avatar and color.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <span className="text-blue-600">⏱️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Time Tracking</h4>
                  <p className="text-sm text-gray-600">Start and stop timers individually. Multiple timers can run simultaneously.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <span className="text-purple-600">📊</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Statistics and Charts</h4>
                  <p className="text-sm text-gray-600">View time distribution in bar chart or donut chart format.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <span className="text-orange-600">📝</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Session Management</h4>
                  <p className="text-sm text-gray-600">Edit, add, or delete individual sessions for each person.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <span className="text-teal-600">💾</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">CSV Export</h4>
                  <p className="text-sm text-gray-600">Export data as summary or detailed report for external analysis.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              ⌨️ Keyboard Shortcuts
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Add person</span>
                  <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl + N</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stop all timers</span>
                  <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl + S</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Export CSV</span>
                  <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl + E</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toggle view</span>
                  <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl + T</kbd>
                </div>
              </div>
            </div>
          </section>

          {/* Tips section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              💡 Tips and Tricks
            </h3>
            <div className="space-y-2">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Data is automatically saved in your browser. No account required!
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-3">
                <p className="text-sm text-green-800">
                  <strong>Performance:</strong> You can run multiple timers simultaneously without affecting precision.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Export:</strong> Use "Summary" for totals, "Detailed" for all individual sessions.
                </p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-3">
                <p className="text-sm text-purple-800">
                  <strong>Customization:</strong> Each person can have a unique color and avatar (emoji or photo).
                </p>
              </div>
            </div>
          </section>

          {/* Troubleshooting section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              🔧 Troubleshooting
            </h3>
            <div className="space-y-3">
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700">
                  My timer doesn't seem to be working
                </summary>
                <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
                  <p>Check that you've clicked "Start" and that the status shows "Running...". If the issue persists, try stopping and restarting the timer.</p>
                </div>
              </details>
              
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700">
                  I lost my data after closing the browser
                </summary>
                <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
                  <p>Data is stored locally in your browser. Make sure you're using the same browser and haven't cleared your browsing data. For safety, regularly export your data to CSV.</p>
                </div>
              </details>
              
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700">
                  CSV export doesn't work
                </summary>
                <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
                  <p>Make sure your browser allows file downloads. Check your download folder - the file is automatically named with the current date.</p>
                </div>
              </details>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-center text-sm text-gray-600">
            TimeHogger v1.0 - Open source time tracking made simple
          </p>
        </div>
      </div>
    </div>
  );
}
