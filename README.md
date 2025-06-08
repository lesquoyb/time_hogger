# TimeHogger ⏰

A modern React application for person directory with individual timers and graphical time visualization per person. Features both local storage and optional server persistence for data that survives between sessions.

## 🚀 Features

- **Interactive Directory** : Person cards with individual timers
- **Timer Management** : Start/Pause/Reset for each person
- **Dynamic Charts** : Bar, pie and line visualization with Chart.js
- **Server Persistence** : Optional Express.js backend for data persistence between server sessions
- **Local Storage** : Automatic browser data saving with server sync
- **CSV Export** : Time data export
- **Responsive Interface** : Adaptive design for all screens
- **Search** : Filter people by name
- **Batch Actions** : Stop/reset all timers
- **Real-time Sync** : Automatic data synchronization with server
- **Backup System** : Create data backups on demand

## 🛠️ Technologies

- **React 19** with modern hooks
- **Vite** for fast bundling
- **Tailwind CSS v4** for styling
- **Chart.js + react-chartjs-2** for charts
- **Express.js** for optional server persistence
- **LocalStorage** with server synchronization
- **CORS** for cross-origin requests
- **fs-extra** for file system operations

## 📦 Installation

1. Clone the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:

   **Option A: Frontend only (localStorage only)**
   ```bash
   npm run dev
   ```

   **Option B: Full stack with server persistence**
   ```bash
   npm run dev:full
   ```

4. Build for production:
   ```bash
   npm run build:prod
   ```

## 🚀 Deployment

### Environment Configuration

#### Development (`.env`)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_API_PORT=3001
```

#### Production Options

**Option 1: API on same server (recommended)**
```bash
# .env.production
VITE_API_URL=/api
```
Configure your web server (nginx, apache) to proxy `/api` to your Node.js server.

**Option 2: Separate API server**
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com/api
```

**Option 3: Subdomain**
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com/api
```

### Deployment Scenarios

#### 1. Single Server Deployment
- Frontend and API on same server
- Use nginx to serve static files and proxy API calls
- Set `VITE_API_URL=/api`

#### 2. Separate Servers
- Frontend on CDN/static hosting
- API on separate server
- Set full API URL in `VITE_API_URL`

#### 3. Docker Deployment
```dockerfile
# Use environment variables in Docker
ENV VITE_API_URL=http://api-container:3001/api
```

### Commands

```bash
# Development with server
npm run dev:full

# Production build
npm run build:prod

# Production preview
npm run preview:prod

# Deploy (build + preview)
npm run deploy
```

### Server Configuration Example (nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Serve static frontend files
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API calls to Node.js server
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎯 Usage

### Server Persistence
- **Auto-sync** : Data automatically syncs to server when available
- **Offline mode** : Graceful fallback to localStorage when server unavailable
- **Manual sync** : Force sync using the sync button in header
- **Backup** : Create server-side backups on demand
- **Status indicator** : Real-time server connection status

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
│   ├── useLocalStorage.js    # Enhanced localStorage with server sync
│   └── useTimerManager.js    # Timer synchronization
├── services/
│   └── apiService.js         # API communication service
├── utils/
│   └── dataUtils.js         # Data utilities and calculations
└── App.jsx                  # Main application
```

### Backend Structure
```
server.js                    # Express.js API server
data/
└── timehogger-data.json    # JSON data storage
```

### Key Hooks
- **useLocalStorage** : Enhanced localStorage with automatic server synchronization
- **useTimerManager** : Real-time timer management
- **useNotifications** : Toast notification system

### API Service
- **Dynamic URLs** : Environment-based API configuration
- **Error handling** : Graceful fallback to offline mode
- **Health checks** : Automatic server availability detection
- **Backup system** : Server-side data backup functionality

### Utilities
- **formatTime** : Time formatting in dd HH:MM:SS
- **calculateTotalTime** : Total time calculation per person
- **exportToCSV** : CSV export with multiple formats
- **generateColors** : Dynamic color generation for charts

## 📱 Responsive Design

- **Mobile** : Optimized touch interface
- **Tablet** : Adaptive grid layout
- **Desktop** : Full feature set with hover effects

## 🔒 Privacy & Data

- **No tracking** : No analytics or external services
- **Local-first** : Data stored locally with optional server sync
- **Server storage** : JSON files on your own server (no external databases)
- **Backup control** : Manual backup creation and management
- **Offline capable** : Full functionality without server connection


## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**TimeHogger** - Making time tracking simple and visual. ⏰✨
