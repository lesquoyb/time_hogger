# TimeHogger ⏰

A modern React application for person directory with individual timers and graphical time visualization per person.

## 🚀 Features

- **Interactive Directory** : Person cards with individual timers
- **Timer Management** : Start/Pause/Reset for each person
- **Dynamic Charts** : Bar, pie and line visualization with Chart.js
- **Local Storage** : Automatic data saving
- **CSV Export** : Time data export
- **Responsive Interface** : Adaptive design for all screens
- **Search** : Filter people by name
- **Batch Actions** : Stop/reset all timers

## 🛠️ Technologies

- **React 19** with modern hooks
- **Vite** for fast bundling
- **Tailwind CSS v4** for styling
- **Chart.js + react-chartjs-2** for charts
- **LocalStorage** for data persistence

## 📦 Installation

1. Clone the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🎯 Usage

### Person Management
- **Add** : Click "➕ Add" to create a new person
- **Delete** : Hover over a card and click "×" in the top right
- **Search** : Use the search bar to filter people

### Timers
- **Start/Pause** : Click the main button on each card
- **Individual Reset** : Use the 🔄 button on each card
- **Stop All** : Use "⏸️ Stop All" to stop all running timers
- **Reset All** : Use "🔄 Reset All" to reset all timers

### Data Export
- **Summary CSV** : Export total times per person
- **Detailed CSV** : Export all individual sessions

### Statistics
- **Bar Chart** : Compare total times between people
- **Donut Chart** : View time distribution
- **Detailed Table** : Complete statistics with sessions and status

## 📊 Data Structure

### Person
```javascript
{
  id: Number,
  name: String,
  avatar: String, // Emoji or photo data URL
  avatarType: 'emoji' | 'photo',
  color: String, // Hex color
  sessions: Array,
  currentSessionStart: Number, // Timestamp
  isRunning: Boolean
}
```

### Session
```javascript
{
  id: Number,
  start: Number, // Timestamp
  end: Number,   // Timestamp
  duration: Number // Seconds
}
```

## 🎨 Customization

### Colors
- Predefined palette of 10 colors
- Custom color picker available
- Each person can have a unique color

### Avatars
- **Emoji** : Choose from 4 categories (People, Faces, Animals, Objects)
- **Photo** : Upload custom images (max 5MB)

### Time Display
- Automatic unit selection (hours/days)
- Multiple formats: HH:MM:SS, decimal hours, days
- Smart formatting based on data range

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── PersonDirectory.jsx    # Main component
│   ├── TimerCard.jsx         # Individual timer card
│   ├── Statistics.jsx        # Charts and statistics
│   ├── UserEditModal.jsx     # User creation/editing
│   ├── SessionEditModal.jsx  # Session management
│   ├── Help.jsx             # Help documentation
│   └── NotificationContainer.jsx # Notifications
├── hooks/
│   ├── useLocalStorage.js    # Local storage hook
│   └── useTimerManager.js    # Timer synchronization
├── utils/
│   └── dataUtils.js         # Data utilities and calculations
└── App.jsx                  # Main application
```

### Key Hooks
- **useLocalStorage** : Automatic localStorage synchronization
- **useTimerManager** : Real-time timer management
- **useNotifications** : Toast notification system

### Utilities
- **formatTime** : Time formatting in dd HH:MM:SS
- **calculateTotalTime** : Total time calculation per person
- **exportToCSV** : CSV export with multiple formats
- **generateColors** : Dynamic color generation for charts

## 📱 Responsive Design

- **Mobile** : Optimized touch interface
- **Tablet** : Adaptive grid layout
- **Desktop** : Full feature set with hover effects

## 🔒 Privacy

- **No tracking** : No analytics or external services
- **Local only** : Data never leaves your device


## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**TimeHogger** - Making time tracking simple and visual. ⏰✨
