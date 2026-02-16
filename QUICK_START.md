# Quick Start Guide

## Copy-Paste Commands

### 1. Backend Setup

```powershell
# Navigate to backend
cd Backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (use the template below)
# Then start the server:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**.env Template:**
```
POSTGRES_HOST=your-project.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

### 2. Frontend Setup

```powershell
# Navigate to frontend
cd Frontend

# Install dependencies (Recharts already included)
npm install

# Start dev server
npm run dev
```

### 3. Access Application

- **Dashboard**: `http://localhost:5173/dashboard`
- **API Endpoint**: `http://localhost:8000/api/results/detected-errors?limit=50`
- **API Docs**: `http://localhost:8000/docs`

---

## File Locations Created/Modified

### Created Files:
```
✅ Frontend/src/components/DetectedErrorsBarChart.jsx
✅ Frontend/src/pages/Dashboard.jsx
✅ Frontend/src/pages/Dashboard.css
✅ SETUP_INSTRUCTIONS.md
✅ INTEGRATION_GUIDE.md
✅ IMPLEMENTATION_SUMMARY.md
✅ QUICK_START.md (this file)
```

### Modified Files:
```
✅ Backend/main.py (added GET /api/results/detected-errors endpoint)
```

### To Create (Optional):
```
📝 Backend/.env (configuration file)
📝 Frontend/src/App.jsx (add Dashboard route)
📝 Frontend/src/NavBar.jsx (add Dashboard link)
```

---

## What Each File Does

### Backend

**`Backend/main.py`** - FastAPI application
- ✅ NEW: `/api/results/detected-errors` endpoint
- ✅ Queries PostgreSQL `results` table
- ✅ Returns JSON with detected error counts
- ✅ CORS enabled for frontend
- ✅ Handles NULL and invalid values

### Frontend

**`DetectedErrorsBarChart.jsx`** - Recharts component
- ✅ Fetches data from backend
- ✅ Displays responsive bar chart
- ✅ Shows loading/error states
- ✅ Tooltip on hover
- Responsive width, 400px height

**`Dashboard.jsx`** - Page component
- ✅ Integrates DetectedErrorsBarChart
- ✅ Professional layout
- ✅ Page header and description
- ✅ Responsive design

**`Dashboard.css`** - Page styling
- ✅ Professional color scheme
- ✅ Mobile responsive
- ✅ Proper spacing and layout

---

## Example API Response

```json
[
  {"x": 1, "detected_errors": 10},
  {"x": 2, "detected_errors": 5},
  {"x": 3, "detected_errors": 15},
  {"x": 4, "detected_errors": 8},
  {"x": 5, "detected_errors": 12}
]
```

---

## Database Table Structure

Your `results` table needs at minimum:
- `result_id` (PRIMARY KEY, SERIAL)
- `detected_errors` (INTEGER or NUMERIC)

Test data:
```sql
INSERT INTO results (detected_errors) VALUES
(10), (5), (15), (8), (12), (3), (20), (7), (11), (9);
```

---

## Customization Quick Reference

### Chart Height
Edit `DetectedErrorsBarChart.jsx`, line 73:
```jsx
<ResponsiveContainer width="100%" height={500}>  {/* Change 400 */}
```

### Chart Color
Edit `DetectedErrorsBarChart.jsx`, line 113:
```jsx
<Bar dataKey="detected_errors" fill="#ef4444" name="Detected Errors" />
{/* Blue: #3b82f6, Red: #ef4444, Green: #10b981 */}
```

### Default Limit
Edit `Dashboard.jsx`, line 29:
```jsx
<DetectedErrorsBarChart limit={100} />  {/* Change 50 */}
```

### Backend URL (Production)
Edit `DetectedErrorsBarChart.jsx`, line 33:
```jsx
const response = await fetch(
  `http://your-api-domain.com/api/results/detected-errors?limit=${limit}`
);
```

---

## Terminal 1: Backend

```powershell
[1] cd Backend
[2] pip install -r requirements.txt
[3] Create .env file with database credentials
[4] uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Should show:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# Press Ctrl+C to stop
```

## Terminal 2: Frontend

```powershell
[1] cd Frontend
[2] npm install
[3] npm run dev

# Should show:
# ➜  Local:   http://localhost:5173/
# Press Ctrl+C to stop
```

## Browser Windows

1. `http://localhost:5173/dashboard` - Your new dashboard with chart
2. `http://localhost:8000/docs` - Swagger API documentation

---

## Verification Checklist

- [ ] Backend starts without errors (no module errors)
- [ ] Frontend starts without errors
- [ ] Can access `http://localhost:5173/dashboard`
- [ ] Chart displays (or shows "No data available" if DB is empty)
- [ ] Backend endpoint works: `http://localhost:8000/api/results/detected-errors?limit=10`
- [ ] Test data appears in chart after insertion

---

## If Something Goes Wrong

### "Connection refused" (backend)
- Check PostgreSQL is running
- Check .env file variables
- Check database credentials

### "Module not found" (frontend)
- Run `npm install` again
- Delete `node_modules/` folder
- Run `npm install` once more

### "CORS error" (browser console)
- Make sure backend is running
- Check frontend URL is `http://localhost:5173`
- Check backend CORS allows localhost:5173

### "Fetch error" (chart shows error)
- Check backend logs for SQL errors
- Verify `results` table exists: `SELECT COUNT(*) FROM results;`
- Test endpoint directly: `http://localhost:8000/api/results/detected-errors`

### "No data available" (chart empty)
- Insert test data into `results` table
- Verify data: `SELECT * FROM results LIMIT 5;`
- Refresh browser

---

## Production Deployment

### Before Going Live:
1. Update .env with production credentials
2. Update frontend API URL to production domain
3. Update CORS origins in main.py
4. Set `uvicorn` to run with: `--host 0.0.0.0 --port 8000`
5. Use production Process Manager (Gunicorn, PM2, Docker, etc.)
6. Configure HTTPS/SSL
7. Set up monitoring and logging

---

## NPM & Pip Commands Reference

```powershell
# Frontend (npm)
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Create production build
npm run lint             # Check code quality

# Backend (pip)
pip install -r requirements.txt  # Install dependencies
pip freeze > requirements.txt    # Update requirements file
```

---

## Key Technologies Used

| Tech | Version | Purpose |
|------|---------|---------|
| React | 19.2.0 | UI Library |
| Vite | 7.2.4 | Build tool & dev server |
| Recharts | 3.7.0 | Bar chart visualization |
| FastAPI | 0.128.2 | Backend API framework |
| Uvicorn | 0.40.0 | ASGI server |
| psycopg2 | 2.9.11 | PostgreSQL adapter |
| Python | 3.8+ | Backend language |
| Node.js | 18+ | Frontend runtime |
| PostgreSQL | Latest | Database |

---

## Support

For issues or questions:
1. Check the error logs (browser console, backend terminal)
2. Verify database connection
3. Review SETUP_INSTRUCTIONS.md for detailed steps
4. Check INTEGRATION_GUIDE.md for routing setup

---

## Success Indicators

✅ Backend running:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

✅ Frontend running:
```
VITE v7.x.x  ready in 250ms
➜  Local:   http://localhost:5173/
```

✅ API responds with data:
```json
[{"x": 1, "detected_errors": 10}, ...]
```

✅ Chart displays in browser at `http://localhost:5173/dashboard`

That's it! Your full-stack bar chart is ready! 🎉
