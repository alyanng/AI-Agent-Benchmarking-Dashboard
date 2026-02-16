# AI Agent Benchmarking Dashboard - Setup & Run Instructions

## Project Overview

This full-stack application provides:
- **Backend**: FastAPI with PostgreSQL (Supabase) integration
- **Frontend**: React with Vite and Recharts visualization
- **Database**: PostgreSQL table `results` with `detected_errors` column

---

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- Git
- PostgreSQL database (Supabase or local)

---

## Backend Setup

### 1. Install Python Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

**Key Package:**
- `psycopg2-binary==2.9.11` - PostgreSQL adapter
- `fastapi==0.128.2` - Web framework
- `uvicorn==0.40.0` - ASGI server
- `python-dotenv==1.2.1` - Environment variables

### 2. Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# PostgreSQL Connection (Supabase)
POSTGRES_HOST=your-project-ref.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Or for local PostgreSQL:
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DB=your_database
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=postgres
```

### 3. Database Setup

Make sure your PostgreSQL database has the `results` table:

```sql
-- Query to verify the table exists and see its structure:
SELECT * FROM results LIMIT 1;

-- The table should have at least these columns:
-- - result_id (PRIMARY KEY, SERIAL)
-- - detected_errors (INTEGER or NUMERIC)
-- - Any other relevant columns
```

If the table doesn't exist, create it:

```sql
CREATE TABLE results (
  result_id SERIAL PRIMARY KEY,
  detected_errors INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Run Backend Server

```bash
cd Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Output should show:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Verify the endpoint works:**
- Visit: `http://localhost:8000/api/results/detected-errors?limit=50`
- You should receive JSON: `[{"x": 1, "detected_errors": 10}, ...]`

---

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd Frontend
npm install
```

**Key Packages:**
- `recharts@^3.7.0` - Charting library (already in package.json)
- `react@^19.2.0` - UI library
- `react-router-dom@^7.13.0` - Routing
- `vite@^7.2.4` - Build tool

### 2. Update App.jsx to Include Dashboard Route

Open `Frontend/src/App.jsx` and add the Dashboard route:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
// Import other pages as needed

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Other routes... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 3. Update NavBar.jsx to Add Link to Dashboard

Add a link in your NavBar component:

```jsx
import { Link } from 'react-router-dom';

// Inside your NavBar component:
<Link to="/dashboard">Dashboard</Link>
```

### 4. Run Frontend Development Server

```bash
cd Frontend
npm run dev
```

**Output should show:**
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## Full Stack Run Instructions

### Terminal 1: Backend (PowerShell)

```powershell
cd Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: Frontend (PowerShell)

```powershell
cd Frontend
npm run dev
```

### Access the Application

- **Dashboard**: `http://localhost:5173/dashboard`
- **Backend API**: `http://localhost:8000/api/results/detected-errors`
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)

---

## File Structure

```
Frontend/
├── src/
│   ├── components/
│   │   └── DetectedErrorsBarChart.jsx  (NEW)
│   ├── pages/
│   │   ├── Dashboard.jsx               (NEW)
│   │   └── Dashboard.css               (NEW)
│   ├── App.jsx                         (MODIFIED - add route)
│   ├── NavBar.jsx                      (OPTIONAL - add link)
│   └── ...

Backend/
├── main.py                              (MODIFIED - added endpoint)
├── database.py
├── requirements.txt
└── .env                                 (CREATE THIS)
```

---

## New Backend Endpoint

### GET `/api/results/detected-errors`

**Description:** Fetch detected errors from results table

**Query Parameters:**
- `limit` (int, optional): Number of results to fetch (default: 50)

**Request:**
```
GET http://localhost:8000/api/results/detected-errors?limit=50
```

**Response:**
```json
[
  {"x": 1, "detected_errors": 10},
  {"x": 2, "detected_errors": 5},
  {"x": 3, "detected_errors": 15}
]
```

**Features:**
- Fetches latest results first (ORDER BY result_id DESC)
- Reverses order to show chronologically (oldest → newest)
- Converts NULL values to 0
- Handles invalid values gracefully
- CORS enabled for localhost:5173

---

## Component Documentation

### DetectedErrorsBarChart.jsx

**Props:**
- `limit` (number, default: 50) - Number of results to display

**Features:**
- Responsive container (100% width)
- Fixed height: 400px
- Auto-fetches data from backend
- Shows loading and error states
- Displays tooltip on hover
- Labeled axes

**Usage:**
```jsx
import DetectedErrorsBarChart from './components/DetectedErrorsBarChart';

<DetectedErrorsBarChart limit={50} />
```

### Dashboard.jsx

**Features:**
- Full page layout
- Integrates DetectedErrorsBarChart
- Responsive design
- Professional styling

---

## Troubleshooting

### Issue: CORS Error
**Solution:** Ensure CORS middleware is enabled in backend/main.py and frontend is running on `http://localhost:5173`

### Issue: Connection Refused (Backend)
**Solution:** Make sure PostgreSQL is running and .env variables are correct

### Issue: No Data in Chart
**Solution:** 
1. Check if `results` table has data: `SELECT COUNT(*) FROM results;`
2. Verify backend endpoint: `http://localhost:8000/api/results/detected-errors`
3. Check browser console for errors (F12)

### Issue: Module Not Found
**Solution:** Run `npm install` in Frontend directory and `pip install -r requirements.txt` in Backend

---

## Example Test Data

If your database is empty, insert test data:

```sql
INSERT INTO results (detected_errors) VALUES
(10), (5), (15), (8), (12), (3), (20), (7), (11), (9);

SELECT * FROM results ORDER BY result_id DESC LIMIT 10;
```

Then refresh the dashboard at `http://localhost:5173/dashboard`

---

## Production Deployment Notes

1. **Environment Variables**: Use production database credentials
2. **CORS Origins**: Update to your production domain
3. **Build Frontend**: Run `npm run build` to create optimized build
4. **API Endpoint**: Update backend URL if needed
5. **Database**: Use Supabase connection pooling for reliability

---

## Support & Documentation

- **Recharts Documentation**: https://recharts.org/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
