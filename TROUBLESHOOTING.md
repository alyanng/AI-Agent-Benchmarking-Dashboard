# Troubleshooting Guide

## Common Issues and Solutions

### ❌ Error: "duplicate key value violates unique constraint"

**Full Error Message:**
```
duplicate key value violates unique constraint "results_pkey"
DETAIL: Key (results_id)=(11) already exists.
```

**What This Means:**
The database's auto-increment sequence is out of sync with the actual data. This usually happens when:
- Data was manually inserted with specific IDs
- Database was restored from a backup
- Previous errors interrupted the sequence

**Solution 1: Run the Fix Script (Recommended)**

```bash
cd Backend
python fix_sequence.py
```

This script automatically resets all sequences to the correct values.

**Solution 2: Manual SQL Fix**

Connect to your PostgreSQL database and run:

```sql
-- Fix results table
SELECT setval('results_results_id_seq', (SELECT MAX(results_id) FROM results));

-- Fix configuration table
SELECT setval('configuration_configuration_id_seq', (SELECT MAX(configuration_id) FROM configuration));

-- Fix projects table
SELECT setval('projects_project_id_seq', (SELECT MAX(project_id) FROM projects));

-- Fix error_records table
SELECT setval('error_records_id_seq', (SELECT MAX(id) FROM error_records));
```

**Solution 3: Reset Everything (Test/Dev Only)**

⚠️ **WARNING: This deletes all data!**

```sql
TRUNCATE TABLE results RESTART IDENTITY CASCADE;
TRUNCATE TABLE configuration RESTART IDENTITY CASCADE;
TRUNCATE TABLE projects RESTART IDENTITY CASCADE;
TRUNCATE TABLE error_records RESTART IDENTITY CASCADE;
```

---

### ❌ Error: 422 Unprocessable Content

**What This Means:**
The JSON data doesn't match the expected format.

**Common Causes:**

1. **Missing Required Fields**
   - `project_name`
   - `project_github_url`
   - `number_of_fixes`
   - `total_time_spent_minutes`
   - `number_of_errors_from_raygun`
   - `errors` array (must have at least 1 error)

2. **Wrong Data Types**
   - Numbers should be numbers, not strings
   - `was_fixed` must be boolean (true/false), not string

3. **Invalid Error Objects**
   - Each error must have: `error_id`, `error_type`, `was_fixed`

**Solution:**

Check the browser console (F12) for detailed validation errors. The frontend logs will show:
- Which field is missing
- Which field has the wrong type
- Where validation failed

**Valid JSON Example:**
```json
{
  "project_name": "MyProject",
  "project_github_url": "https://github.com/user/repo",
  "number_of_fixes": 5,
  "total_time_spent_minutes": 30,
  "number_of_errors_from_raygun": 3,
  "errors": [
    {
      "error_id": "123",
      "error_type": "NullPointerException",
      "was_fixed": true
    }
  ]
}
```

---

### ❌ Save Button Not Appearing

**Checklist:**

1. **Is the code up to date?**
   ```bash
   git checkout feature/auto-save-json-reports
   git pull origin feature/auto-save-json-reports
   ```

2. **Did you restart the frontend?**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Does the AI response contain JSON?**
   - Open browser console (F12)
   - Look for "Extracted JSON string:"
   - If not found, the AI didn't return JSON in the expected format

4. **Is the JSON valid?**
   - Check for "Parsed JSON data:" in console
   - If parsing failed, the JSON syntax is invalid

5. **Did validation pass?**
   - Look for "✅ Valid debug report detected" in console
   - If not, check what validation failed

---

### ❌ CORS Error

**Error Message:**
```
Access to fetch at 'http://localhost:8000/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**

Check `Backend/main.py` has correct CORS settings:

```python
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Restart the backend after changes.

---

### ❌ Database Connection Error

**Error Message:**
```
could not connect to server: Connection refused
```

**Checklist:**

1. **Is PostgreSQL running?**
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   ```

2. **Are credentials correct in `.env`?**
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=your_database_name
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   ```

3. **Can you connect manually?**
   ```bash
   psql -h localhost -U your_username -d your_database_name
   ```

---

### 🔍 Debugging Tips

**Enable Detailed Logging:**

1. **Frontend Console (Browser F12)**
   - Shows JSON extraction, validation, and save attempts
   - Look for red error messages

2. **Backend Terminal**
   - Shows received data and database operations
   - Check for Python exceptions and stack traces

3. **Network Tab (Browser F12)**
   - Click "Network" tab
   - Send a request
   - Click on the failed request
   - Check "Preview" or "Response" to see exact error

**Test with Sample Data:**

Use the provided `test-report-sample.json`:

1. Copy the JSON content
2. Send it in a message wrapped in markdown:
   ````
   ```json
   {
     "project_name": "TestProject",
     ...
   }
   ```
   ````
3. Save button should appear

---

## Need More Help?

1. **Check Console Logs:** Browser F12 → Console tab
2. **Check Backend Logs:** Terminal running `uvicorn`
3. **Check Database:** Connect with `psql` and verify data
4. **Create an Issue:** Include error messages and logs

---

## Quick Reference

### Start the Application
```bash
# Backend
cd Backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload

# Frontend (new terminal)
cd Frontend
npm run dev
```

### Fix Database Sequences
```bash
cd Backend
python fix_sequence.py
```

### View Logs
- Frontend: Browser Console (F12)
- Backend: Terminal running uvicorn
- Database: Check PostgreSQL logs
