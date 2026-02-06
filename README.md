# AI Agent Benchmarking Dashboard


## Project Structure

```text
AI-Agent-Benchmarking-Dashboard/
├─ Backend/        # FastAPI backend
├─ Frontend/       # Vite + React frontend
├─ .gitignore
└─ README.md
```

---

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- Uvicorn
- PostgreSQL (via `psycopg2-binary`)

### Frontend
- Node.js 18+
- Vite
- React

---

## Getting Started (Local Development)

Please **start the backend first**, then start the frontend.

---

## 🔧 Backend Setup (FastAPI)

### 1️⃣ Navigate to the backend directory

```bash
cd Backend
```

---

### 2️⃣ Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal after activation.

---

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Environment variables (if applicable)

If the backend uses environment variables (e.g. database connection):

```bash
cp .env.example .env
```

Edit `.env` according to your local setup.

> Note: `.env` is **not committed** to Git.

---

### 5️⃣ Run the backend server

```bash
uvicorn main:app --reload
```

Backend will be available at:
- http://127.0.0.1:8000
- API docs: http://127.0.0.1:8000/docs

---

## 🎨 Frontend Setup (Vite + React)

### 1️⃣ Navigate to the frontend directory

```bash
cd Frontend
```

---

### 2️⃣ Install dependencies

```bash
npm ci
```

> `npm ci` ensures consistent dependency versions across the team.

---

### 3️⃣ Configure environment variables

```bash
cp .env.example .env
```

Example `Frontend/.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

⚠️ Notes:
- `.env` is not committed to Git
- Restart the dev server after modifying `.env`

---

### 4️⃣ Start the frontend

```bash
npm run dev
```

Frontend will be available at:
- http://localhost:5173

---

## Team Environment Sync

This project does **not** share local environments. Instead, it synchronises via:

- Backend: `requirements.txt`
- Frontend: `package.json` + `package-lock.json`
- Environment variable templates: `.env.example`

### New team member setup

```bash
# Backend
cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd ../Frontend
cp .env.example .env
npm ci
npm run dev
```

---

## Common Issues

### CORS errors in the browser
Ensure `CORSMiddleware` is configured in FastAPI and allows:

```
http://localhost:5173
```

---

### Environment variables not applied
Restart the frontend dev server after updating `.env`.

---

