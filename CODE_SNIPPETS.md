# Code Snippets for Integration

Use these exact code snippets to integrate the Dashboard into your existing React app.

---

## 1. Update App.jsx

Add the Dashboard route to your main application router.

### Before (Current structure):
```jsx
// Frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './Home';
import Projects from './Projects';
import configurations from './configurations';
import Errors from './Errors';
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### After (With Dashboard route):
```jsx
// Frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './Home';
import Projects from './Projects';
import configurations from './configurations';
import Errors from './Errors';
import Dashboard from './pages/Dashboard';  // ADD THIS IMPORT
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
        <Route path="/dashboard" element={<Dashboard />} />  {/* ADD THIS ROUTE */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Changes:**
- Line 6: Add import for Dashboard
- Line 18: Add new route for dashboard

---

## 2. Update NavBar.jsx

Add a navigation link to the Dashboard page.

### Before (Current structure):
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
      </ul>
    </nav>
  );
}

export default NavBar;
```

### After (With Dashboard link):
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

**Changes:**
- Line 19: Add new Link to Dashboard

---

## 3. Create Backend .env File

Create this file in your Backend directory.

**File: `Backend/.env`**

```env
# PostgreSQL Connection Configuration
# Replace with your actual database credentials

# For Supabase:
POSTGRES_HOST=your-project-ref.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password_here

# For Local PostgreSQL:
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DB=benchmarking_db
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=your_password
```

**Instructions:**
1. Create a new file named `.env` in the `Backend/` folder
2. Copy the content above
3. Replace `your-project-ref` and `your_actual_password_here` with your actual credentials
4. Save the file

---

## 4. Using the Components

### Basic Usage

```jsx
// Simple usage with default settings
import DetectedErrorsBarChart from './components/DetectedErrorsBarChart';

function MyPage() {
  return (
    <DetectedErrorsBarChart />
  );
}
```

### Advanced Usage with Custom Props

```jsx
// With custom limit
import DetectedErrorsBarChart from './components/DetectedErrorsBarChart';

function Analytics() {
  return (
    <div>
      <h1>Last 100 Results</h1>
      <DetectedErrorsBarChart limit={100} />
    </div>
  );
}
```

### With Error Handling

```jsx
import { useState, useEffect } from 'react';
import DetectedErrorsBarChart from './components/DetectedErrorsBarChart';

function Dashboard() {
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    setDataReady(true);
  }, []);

  return (
    <div>
      {dataReady ? (
        <DetectedErrorsBarChart limit={50} />
      ) : (
        <p>Initializing chart...</p>
      )}
    </div>
  );
}
```

---

## 5. Backend Endpoint Response

### Usage in Frontend

```jsx
// Fetch data directly from the endpoint
async function getDetectedErrors() {
  try {
    const response = await fetch(
      'http://localhost:8000/api/results/detected-errors?limit=50'
    );
    const data = await response.json();
    console.log(data);
    // Output: [{"x": 1, "detected_errors": 10}, {"x": 2, "detected_errors": 5}, ...]
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example Response

**Request:**
```
GET http://localhost:8000/api/results/detected-errors?limit=5
```

**Response:**
```json
[
  {
    "x": 1,
    "detected_errors": 10
  },
  {
    "x": 2,
    "detected_errors": 5
  },
  {
    "x": 3,
    "detected_errors": 15
  },
  {
    "x": 4,
    "detected_errors": 8
  },
  {
    "x": 5,
    "detected_errors": 12
  }
]
```

---

## 6. Testing the Endpoint

### Using PowerShell

```powershell
# Test the endpoint with curl or Invoke-WebRequest
Invoke-WebRequest -Uri "http://localhost:8000/api/results/detected-errors?limit=10" `
  -Headers @{"Content-Type"="application/json"} | ConvertTo-Json

# Or simpler:
curl "http://localhost:8000/api/results/detected-errors?limit=10"
```

### Using Browser DevTools Console

```javascript
// Open browser console (F12 > Console tab) and run:
fetch('http://localhost:8000/api/results/detected-errors?limit=10')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e));

// Output will appear in console
```

---

## 7. Database Test Data

### Insert Sample Data

```sql
-- Connect to your PostgreSQL database
-- Then run this query to insert sample data

INSERT INTO results (detected_errors) VALUES
(10), (5), (15), (8), (12), (3), (20), (7), (11), (9),
(14), (6), (18), (4), (13), (2), (19), (1), (16), (17),
(21), (9), (11), (15), (7);

-- Verify data was inserted
SELECT COUNT(*) as total_records FROM results;
SELECT * FROM results ORDER BY result_id DESC LIMIT 5;
```

---

## 8. Frontend .env Configuration (if needed)

If you want to use environment variables in your React app:

**File: `Frontend/.env.local` (optional)**

```env
VITE_API_URL=http://localhost:8000
VITE_API_LIMIT=50
```

**Then update DetectedErrorsBarChart.jsx:**

```jsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEFAULT_LIMIT = import.meta.env.VITE_API_LIMIT || 50;

// In fetch call:
const response = await fetch(
  `${API_URL}/api/results/detected-errors?limit=${limit}`
);
```

---

## 9. Customization Examples

### Change Chart Color

Edit this line in `DetectedErrorsBarChart.jsx`:

```jsx
// Current (Blue):
<Bar dataKey="detected_errors" fill="#3b82f6" name="Detected Errors" />

// Red:
<Bar dataKey="detected_errors" fill="#ef4444" name="Detected Errors" />

// Green:
<Bar dataKey="detected_errors" fill="#10b981" name="Detected Errors" />

// Purple:
<Bar dataKey="detected_errors" fill="#8b5cf6" name="Detected Errors" />

// Orange:
<Bar dataKey="detected_errors" fill="#f97316" name="Detected Errors" />
```

### Change Chart Height

Edit this line in `DetectedErrorsBarChart.jsx`:

```jsx
// Current (400px):
<ResponsiveContainer width="100%" height={400}>

// Taller (600px):
<ResponsiveContainer width="100%" height={600}>

// Shorter (300px):
<ResponsiveContainer width="100%" height={300}>
```

### Add Multiple Charts

```jsx
// Dashboard.jsx
function Dashboard() {
  return (
    <div>
      <div className="chart-row">
        <div className="chart-column">
          <h3>Last 50 Results</h3>
          <DetectedErrorsBarChart limit={50} />
        </div>
      </div>
      
      <div className="chart-row">
        <div className="chart-column">
          <h3>Last 100 Results</h3>
          <DetectedErrorsBarChart limit={100} />
        </div>
      </div>
    </div>
  );
}
```

---

## 10. Full Integration Workflow

### Step 1: File Creation
- ✅ Created: `Frontend/src/components/DetectedErrorsBarChart.jsx`
- ✅ Created: `Frontend/src/pages/Dashboard.jsx`
- ✅ Created: `Frontend/src/pages/Dashboard.css`
- ✅ Modified: `Backend/main.py` (added endpoint)

### Step 2: Configuration
- ✅ Create: `Backend/.env` (use template above)

### Step 3: Update Routing
- [ ] Update: `Frontend/src/App.jsx` (use code above)
- [ ] Update: `Frontend/src/NavBar.jsx` (use code above)

### Step 4: Install Dependencies
```powershell
cd Frontend
npm install

cd ../Backend
pip install -r requirements.txt
```

### Step 5: Run Servers
```powershell
# Terminal 1
cd Backend
uvicorn main:app --reload

# Terminal 2
cd Frontend
npm run dev
```

### Step 6: Test
- Visit: `http://localhost:5173/dashboard`
- Should see bar chart with data (if results table has data)

---

## Deployment Modification

For production, update the API URL:

### Option 1: Update Code
```jsx
// DetectedErrorsBarChart.jsx
const API_URL = 'https://your-api-domain.com';  // Change this line

const response = await fetch(
  `${API_URL}/api/results/detected-errors?limit=${limit}`
);
```

### Option 2: Use Environment Variables
```env
# Frontend/.env.production
VITE_API_URL=https://your-api-domain.com
```

---

That's it! You now have all the code you need to integrate the chart. Just copy and paste these snippets into your files!
