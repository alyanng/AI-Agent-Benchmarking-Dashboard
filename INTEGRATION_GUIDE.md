# Integration Guide - Adding Dashboard to Existing App

This guide shows how to integrate the new Dashboard and DetectedErrorsBarChart into your existing React application.

## Step 1: Update Your App.jsx

Add the Dashboard route to your application's main routing structure:

```jsx
// Frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './Home';
import Projects from './Projects';
import configurations from './configurations';
import Errors from './Errors';
import Dashboard from './pages/Dashboard';  // ADD THIS
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/configurations" element={<configurations />} />
        <Route path="/errors" element={<Errors />} />
        <Route path="/dashboard" element={<Dashboard />} />  {/* ADD THIS LINE */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Step 2: Update Your NavBar.jsx

Add a navigation link to the Dashboard:

```jsx
// Frontend/src/NavBar.jsx
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>AI Agent Benchmarking Dashboard</h1>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/configurations">Configurations</Link></li>
        <li><Link to="/errors">Errors</Link></li>
        <li><Link to="/dashboard">Results Dashboard</Link></li>  {/* ADD THIS LINE */}
      </ul>
    </nav>
  );
}

export default NavBar;
```

## Step 3: Verify Backend Endpoint

Ensure your backend is running and the endpoint works:

```powershell
# In your browser or PowerShell (after starting backend):
curl http://localhost:8000/api/results/detected-errors?limit=10
```

Expected response:
```json
[
  {"x": 1, "detected_errors": 10},
  {"x": 2, "detected_errors": 5}
]
```

## Step 4: Test the Dashboard

1. Start backend: `cd Backend; uvicorn main:app --reload`
2. Start frontend: `cd Frontend; npm run dev`
3. Navigate to: `http://localhost:5173/dashboard`
4. Click "Results Dashboard" in the navbar

## Files Modified/Created

### Created Files:
- ✅ `Frontend/src/components/DetectedErrorsBarChart.jsx` - Bar chart component
- ✅ `Frontend/src/pages/Dashboard.jsx` - Dashboard page
- ✅ `Frontend/src/pages/Dashboard.css` - Dashboard styling

### Modified Files:
- ✅ `Backend/main.py` - Added `/api/results/detected-errors` endpoint

### Optional - Modify:
- `Frontend/src/App.jsx` - Add Dashboard route
- `Frontend/src/NavBar.jsx` - Add Dashboard link

## What the Dashboard Does

The new Dashboard includes:

1. **Page Header** - Title and description
2. **Bar Chart Section** - Visual representation of detected errors
3. **Responsive Design** - Works on desktop, tablet, and mobile
4. **Auto-Loading** - Fetches data from backend on mount
5. **Error Handling** - Shows user-friendly error messages
6. **Data Formatting** - Converts timestamps to human-readable format

## Customization Options

### Change Chart Height

Edit `DetectedErrorsBarChart.jsx`, line with `ResponsiveContainer`:

```jsx
<ResponsiveContainer width="100%" height={500}>  {/* Change 400 to preferred height */}
```

### Change Number of Results

Edit `Dashboard.jsx`, line with `DetectedErrorsBarChart`:

```jsx
<DetectedErrorsBarChart limit={100} />  {/* Change 50 to preferred limit */}
```

### Change Chart Color

Edit `DetectedErrorsBarChart.jsx`, line with `Bar`:

```jsx
<Bar dataKey="detected_errors" fill="#ef4444" name="Detected Errors" />
{/* Change #3b82f6 (blue) to any hex color: #ef4444 (red), #10b981 (green), etc. */}
```

### Change Backend URL

Edit `DetectedErrorsBarChart.jsx`, fetch URL:

```jsx
const response = await fetch(
  `http://your-production-url.com/api/results/detected-errors?limit=${limit}`
);
```

## API Response Format

The backend endpoint returns an array of objects:

```typescript
[
  {
    x: number,              // 1-based index for X-axis
    detected_errors: number // Error count (0 if NULL)
  },
  ...
]
```

### Features:
- ✅ Handles NULL values (converts to 0)
- ✅ Handles type conversion
- ✅ Respects limit parameter
- ✅ Ordered chronologically (oldest first)
- ✅ CORS enabled

## Database Table Structure

Assumes your `results` table has these columns:

```sql
CREATE TABLE results (
  result_id SERIAL PRIMARY KEY,
  detected_errors INTEGER,
  created_at TIMESTAMP,
  -- ... other columns
);
```

### Tested Column Types:
- ✅ INTEGER
- ✅ NUMERIC / DECIMAL
- ✅ BIGINT
- ✅ NULL / missing values

## Next Steps

1. ✅ Install dependencies: `npm install` and `pip install -r requirements.txt`
2. ✅ Configure .env file with database credentials
3. ✅ Update App.jsx with dashboard route
4. ✅ Start backend and frontend servers
5. ✅ Navigate to /dashboard and verify chart displays
6. ✅ Customize styling/colors as needed

## Troubleshooting

### Chart shows "Loading chart data..." forever
- Check backend is running: `http://localhost:8000/docs`
- Check browser console (F12) for fetch errors
- Verify database has results: `SELECT COUNT(*) FROM results;`

### Chart shows "No data available"
- Query backend directly: `http://localhost:8000/api/results/detected-errors`
- If empty, insert test data into results table

### Chart shows "Error loading data: ..."
- Check backend error logs
- Verify CORS is enabled
- Check database connection in .env

## Quick Start

```bash
# Terminal 1: Backend
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Frontend (in new terminal)
cd Frontend
npm install
npm run dev

# Then navigate to http://localhost:5173/dashboard
```
