# ISRO-ReliAI Backend

AI-Driven Anomaly Detection in Component Burn-In & Screening

## Project Overview

ISRO-ReliAI is a machine learning system for detecting anomalies and predicting drift in electronic component burn-in testing. It combines two AI modules:

- **Module A (Isolation Forest)**: Dynamic outlier detection based on initial measurements
- **Module B (LSTM)**: Time-series drift prediction using burn-in test data

Results are combined through a risk engine to provide actionable insights for component screening.

## Architecture

```
React Frontend (Vite)
        ↓
  Flask Backend (Python)
        ↓
   ┌────┴────┐
   ↓        ↓
MongoDB   ML Models
          (Keras/scikit-learn)
```

### Backend Structure

```
backend/
├── app.py                 # Flask app entry point
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (local only)
├── .env.example           # Template for .env
├── .gitignore             # Git ignore rules
│
├── models/
│   ├── isolation_forest_model.pkl
│   ├── scaler.pkl
│   └── lstm_reliability_model.keras/  # Keras directory format
│       ├── config.json
│       ├── metadata.json
│       └── model.weights.h5
│
├── routes/
│   ├── __init__.py
│   ├── health_routes.py        # Health check endpoints
│   ├── database_routes.py       # Legacy database endpoints
│   ├── prediction_routes.py     # Legacy prediction endpoints
│   └── dataset_routes.py        # CSV upload & analysis endpoints
│
├── services/
│   ├── __init__.py
│   ├── database_service.py      # MongoDB operations
│   ├── model_service.py         # ML model loading & prediction
│   └── risk_engine.py           # Risk classification logic
│
└── utils/
    ├── __init__.py
    └── validation.py            # Input validation
```

## Installation

### Prerequisites

- Python 3.8+
- pip or conda
- MongoDB (cloud or local)

### Setup Steps

1. **Clone/Navigate to project:**
```bash
cd backend
```

2. **Create virtual environment (optional but recommended):**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**

Copy `.env.example` to `.env` and edit:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection details
```

Required variables in `.env`:
```ini
# Server
HOST=0.0.0.0
PORT=5000
DEBUG=False

# Frontend URL (for CORS)
FRONTEND_URL=https://isro-reliai.netlify.app

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=isro_reliai

# Model Configuration
USE_MOCK_MODELS=False
```

5. **Run the backend:**
```bash
python app.py
```

Backend will start on: `http://localhost:5000`

## API Endpoints

### Health Check

**GET `/health`**

Returns status of backend, MongoDB, and ML models.

Response:
```json
{
  "status": "healthy",
  "models": {
    "isolation_forest": true,
    "scaler": true,
    "lstm": true
  }
}
```

### CSV Upload

**POST `/api/datasets/upload`**

Upload a CSV file with component test data.

Request:
- Content-Type: `multipart/form-data`
- Field: `file` (CSV file)

Expected CSV columns:
- Component_ID
- Lot_ID
- Time_Hours
- Burn_In_Temperature_C
- Iddq_uA
- Leakage_Current_uA
- Propagation_Delay_ns
- Component_Status

Response:
```json
{
  "success": true,
  "dataset_id": "dataset-abc123de",
  "filename": "screening_dataset.csv",
  "total_records": 2400,
  "total_components": 600,
  "total_lots": 15
}
```

### Get Components

**GET `/api/components`**

Retrieve component records with pagination.

Query parameters:
- `page` (default: 1)
- `limit` (default: 50, max: 500)
- `search` (optional, searches component_id and lot_id)

Response:
```json
{
  "success": true,
  "page": 1,
  "limit": 50,
  "count": 50,
  "components": [
    {
      "_id": "...",
      "component_id": "L01-C04",
      "lot_id": "LOT-01",
      "time_hours": 168,
      "burn_in_temperature_c": 85,
      "iddq_ua": 10.57,
      "leakage_current_ua": 53.29,
      "propagation_delay_ns": 9.17,
      "component_status": "Latent Defect",
      "dataset_id": "dataset-abc123de",
      "created_at": "2026-08-31T..."
    }
  ]
}
```

### Get Single Component

**GET `/api/components/<component_id>`**

Get all time-series records for a component.

Response:
```json
{
  "success": true,
  "component_id": "L01-C04",
  "total_records": 4,
  "records": [
    {
      "time_hours": 0,
      "iddq_ua": 10.57,
      "leakage_current_ua": 53.29,
      ...
    },
    {
      "time_hours": 24,
      "iddq_ua": 11.20,
      ...
    },
    ...
  ]
}
```

### Run Analysis

**POST `/api/analyze`**

Perform complete AI analysis on a component.

Request:
```json
{
  "component_id": "L01-C04"
}
```

Response:
```json
{
  "success": true,
  "component_id": "L01-C04",
  "lot_id": "LOT-01",
  "analysis_id": "...",
  
  "module_a": {
    "status": "NORMAL",
    "anomaly": false,
    "anomaly_score": 0.12
  },
  
  "module_b": {
    "prediction": "WARNING",
    "confidence": 0.84,
    "probabilities": {
      "NORMAL": 0.10,
      "WARNING": 0.84,
      "HIGH_RISK": 0.06
    }
  },
  
  "final_risk": "WARNING",
  "explanation": "Component behaviour requires monitoring...",
  "recommendation": "Continue monitoring the component closely...",
  "confidence": 0.84
}
```

### Get Analysis Results

**GET `/api/analysis`**

Get all analysis results (paginated).

Query parameters:
- `limit` (default: 50)

**GET `/api/analysis/<component_id>`**

Get analysis results for a specific component.

Response:
```json
{
  "success": true,
  "component_id": "L01-C04",
  "count": 1,
  "analyses": [
    {
      "_id": "...",
      "component_id": "L01-C04",
      "lot_id": "LOT-01",
      "module_a": { ... },
      "module_b": { ... },
      "final_risk": "WARNING",
      "explanation": "...",
      "recommendation": "...",
      "created_at": "2026-08-31T..."
    }
  ]
}
```

## ML Models

### Module A: Isolation Forest

- **Purpose**: Detect anomalous components based on static measurements
- **Input**: 16 features (sensor readings, temperatures, etc.)
- **Output**: Anomaly score (-1 to 1, negative = anomalous)
- **Threshold**: Automatically determined by model

### Module B: LSTM

- **Purpose**: Predict component reliability using time-series data
- **Input**: (4 timesteps, 4 features each)
  - Features: Iddq, Leakage Current, Propagation Delay, Temperature
  - Timesteps: 0h, 24h, 96h, 168h
- **Output**: Probabilities for 3 classes
  - 0: NORMAL
  - 1: WARNING
  - 2: HIGH_RISK

### Risk Engine

Combines both module results:

| Module A | Module B | Risk |
|----------|----------|------|
| Normal | Normal | NORMAL |
| Anomaly | Normal | WARNING |
| Normal | Warning/High | WARNING |
| Anomaly | Warning/High | HIGH_RISK |

## MongoDB Database

### Database Name: `isro_reliai`

### Collections:

**1. datasets** - Dataset upload metadata
```json
{
  "dataset_id": "dataset-abc123de",
  "filename": "screening_dataset.csv",
  "total_records": 2400,
  "total_components": 600,
  "total_lots": 15,
  "uploaded_at": "2026-08-31T...",
  "source": "user_upload"
}
```

**2. component_records** - Individual component measurements
```json
{
  "component_id": "L01-C04",
  "lot_id": "LOT-01",
  "time_hours": 168,
  "burn_in_temperature_c": 85,
  "iddq_ua": 10.57,
  "leakage_current_ua": 53.29,
  "propagation_delay_ns": 9.17,
  "component_status": "Latent Defect",
  "dataset_id": "dataset-abc123de",
  "created_at": "2026-08-31T..."
}
```

**3. analysis_results** - AI analysis results
```json
{
  "component_id": "L01-C04",
  "lot_id": "LOT-01",
  "module_a": {
    "status": "NORMAL",
    "anomaly": false,
    "anomaly_score": 0.12
  },
  "module_b": {
    "prediction": "WARNING",
    "confidence": 0.84,
    "probabilities": {
      "NORMAL": 0.10,
      "WARNING": 0.84,
      "HIGH_RISK": 0.06
    }
  },
  "final_risk": "WARNING",
  "explanation": "...",
  "recommendation": "...",
  "created_at": "2026-08-31T..."
}
```

### Indexes

Automatic indexes are created on:
- component_records: component_id, lot_id, dataset_id, created_at
- analysis_results: component_id, lot_id, created_at
- datasets: dataset_id (unique), uploaded_at

## Testing

### Test Backend Health

```bash
curl http://localhost:5000/health
```

### Upload Test CSV

Create `test_data.csv`:
```csv
Component_ID,Lot_ID,Time_Hours,Burn_In_Temperature_C,Iddq_uA,Leakage_Current_uA,Propagation_Delay_ns,Component_Status
L01-C01,LOT-01,0,85,10.1,10.5,2.3,Normal
L01-C01,LOT-01,24,85,10.2,10.6,2.4,Normal
L01-C01,LOT-01,96,85,10.3,10.7,2.5,Normal
L01-C01,LOT-01,168,85,10.4,10.8,2.6,Normal
```

```bash
curl -X POST http://localhost:5000/api/datasets/upload \
  -F "file=@test_data.csv"
```

### Run Analysis

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"component_id": "L01-C01"}'
```

### Check MongoDB

```bash
mongo "mongodb://localhost:27017/isro_reliai"
db.component_records.findOne()
db.analysis_results.findOne()
```

## Deployment

### Production Considerations

1. **Environment Variables**: Never commit `.env` to git
2. **CORS**: Update ALLOWED_ORIGINS in config.py for production URLs
3. **MongoDB**: Use MongoDB Atlas or enterprise cluster
4. **Models**: Ensure models are in git LFS or downloaded at startup
5. **Logging**: Configure proper logging for production
6. **Error Handling**: Validate all inputs before processing

### Docker Deployment

If using Docker:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
ENV FLASK_APP=app.py
CMD ["python", "app.py"]
```

### Gunicorn (Production Server)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### Models Fail to Load

The backend gracefully handles model loading errors:
- If Isolation Forest or Scaler fail, it uses mock models (see `USE_MOCK_MODELS`)
- LSTM loading is attempted from multiple paths

Check `GET /health` for model status.

### MongoDB Connection Issues

- Verify MONGODB_URI in `.env`
- Ensure network access is allowed (MongoDB Atlas firewall)
- Check DATABASE_NAME is correct
- Test with: `mongo "mongodb://your-connection-string/isro_reliai"`

### CORS Errors

Frontend can't reach backend:
- Verify frontend URL in ALLOWED_ORIGINS
- Check VITE_API_BASE_URL in frontend/.env
- Ensure backend is running on correct host/port

### CSV Upload Fails

- CSV must have exact column names (case-sensitive)
- All numeric columns must contain valid numbers
- Component_ID and Lot_ID cannot be empty
- File must be valid UTF-8 encoded

## Support

For issues or questions, check:
1. Backend logs (terminal output)
2. `GET /health` endpoint status
3. MongoDB connection status
4. Model loading errors in config
5. Frontend console for API errors

## License

ISRO-ReliAI Backend
Part of ISRO Component Reliability Intelligence System
