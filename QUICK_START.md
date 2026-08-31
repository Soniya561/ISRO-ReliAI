# ISRO-ReliAI - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Backend Setup (2 min)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Start backend
python app.py
```

**Expected Output:**
```
✓ MongoDB connected: mongodb+srv://...
✓ LSTM model loaded successfully
✓ Isolation Forest model loaded successfully
✓ Scaler loaded successfully
Running on http://0.0.0.0:5000
```

**Verify Backend:**
```bash
curl http://localhost:5000/health
```

### Step 2: Frontend Setup (2 min)

```bash
cd frontend

# Install dependencies
pnpm install  # or npm install

# Configure (optional - defaults to localhost:5000)
cp .env.example .env

# Start dev server
pnpm dev  # or npm run dev
```

**Expected Output:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

### Step 3: Access Application (1 min)

1. Open browser: `http://localhost:5173`
2. You should see the ISRO-ReliAI login page

## 📋 Minimal Testing Checklist

After setup, verify these work:

```bash
# 1. Check backend health
curl http://localhost:5000/health
# Should return: {"status": "healthy", ...}

# 2. Upload test CSV
curl -X POST http://localhost:5000/api/datasets/upload \
  -F "file=@backend/test_data.csv"
# Should return: {"success": true, "dataset_id": "..."}

# 3. Get components
curl http://localhost:5000/api/components
# Should return list of components

# 4. Run analysis
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"component_id": "L01-C01"}'
# Should return analysis results
```

## 🎯 Key Files Modified/Created

### Backend:
- **routes/dataset_routes.py** - NEW: CSV upload & analysis endpoints
- **services/database_service.py** - EXTENDED: MongoDB operations for datasets
- **app.py** - UPDATED: Registered new blueprint
- **config.py** - UPDATED: MongoDB URI handling, new collections

### Frontend:
- **src/services/api.ts** - NEW: API client service
- **src/types.ts** - EXTENDED: API response types
- **.env.example** - NEW: Frontend environment template

## 📊 Data Flow

```
CSV File Upload
    ↓
Frontend POST /api/datasets/upload
    ↓
Backend: Validate CSV → Parse → Store in MongoDB
    ↓
Frontend GET /api/components
    ↓
Backend: Return paginated components
    ↓
Frontend: Display components
    ↓
User: Click "Analyze"
    ↓
Frontend POST /api/analyze
    ↓
Backend: Run Module A + Module B → Risk Engine
    ↓
Backend: Store result in analysis_results collection
    ↓
Frontend: Display results
```

## 🔍 Debugging

### Backend Issues?
1. Check `GET /health` returns models are loaded
2. Look at terminal output for error messages
3. Verify MongoDB MONGODB_URI in .env
4. Check MongoDB connection: `mongo "mongodb://..."`

### Frontend Issues?
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API requests
4. Verify VITE_API_BASE_URL environment variable

### CSV Upload Not Working?
1. Ensure all required columns present
2. Check CSV is UTF-8 encoded
3. Verify numeric values are valid
4. Try test_data.csv from backend folder

## 📦 Project Structure

```
ISRO-ReliAI/
├── backend/
│   ├── models/                 ← ML models (pre-trained)
│   ├── routes/
│   │   └── dataset_routes.py   ← CSV & analysis routes
│   ├── services/
│   │   ├── model_service.py    ← ML predictions
│   │   ├── database_service.py ← MongoDB ops
│   │   └── risk_engine.py      ← Risk classification
│   ├── app.py                  ← Flask app
│   ├── config.py               ← Configuration
│   ├── requirements.txt        ← Python dependencies
│   ├── .env.example            ← Environment template
│   └── README_INTEGRATION.md   ← Full documentation
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts          ← API client
│   │   ├── pages/              ← React pages
│   │   ├── types.ts            ← TypeScript types
│   │   └── data.ts             ← Demo data
│   ├── .env.example            ← Environment template
│   ├── package.json
│   └── vite.config.ts
│
└── INTEGRATION_COMPLETE.md     ← Integration status
```

## 🎨 Demo Data

Frontend has built-in demo data that shows even if no CSV is uploaded:
- 600 components (15 lots × 40 components)
- 2400 records at 4 timepoints (0h, 24h, 96h, 168h)
- Realistic anomaly patterns

## 🔐 Security Notes

- ❌ MongoDB URI is backend-only (never exposed to frontend)
- ❌ No hardcoded credentials in code
- ✅ All secrets in .env (add to .gitignore)
- ✅ CORS configured for frontend URLs only
- ✅ CSV validation on backend

## 📚 Documentation

- **backend/README_INTEGRATION.md** - Comprehensive backend guide
- **INTEGRATION_COMPLETE.md** - Overall integration summary
- This file - Quick start guide

## ✅ What Works

- [x] CSV upload and validation
- [x] Component records storage in MongoDB
- [x] Module A (Isolation Forest) analysis
- [x] Module B (LSTM) time-series prediction
- [x] Risk engine combining results
- [x] Analysis result storage
- [x] Frontend API service
- [x] Environment configuration

## ⚠️ Next Steps

To complete full frontend integration:

1. **ScreeningDataset.tsx** - Add CSV upload UI
2. **ComponentGrid.tsx** - Load components from API
3. **AIAnalysis.tsx** - Display analysis results
4. **DriftPrediction.tsx** - Show LSTM predictions
5. **RiskExplainability.tsx** - Show combined results

See INTEGRATION_COMPLETE.md for detailed integration checklist.

## 🆘 Still Having Issues?

1. Check backend terminal for errors
2. Run `curl http://localhost:5000/health`
3. Check browser console (F12)
4. Check MongoDB connection
5. Verify .env files are set correctly
6. Try clearing frontend cache: `Ctrl+Shift+Delete`

---

**Happy analyzing! 🚀**
