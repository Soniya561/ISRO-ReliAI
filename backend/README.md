
### Database Endpoints (NEW)

#### `GET /api/db-status`
Check MongoDB database connection status

**Response (Connected):**
```json
{
  "database": "MongoDB",
  "status": "connected",
  "url": "mongodb+srv://...",
  "database_name": "isro_reliai",
  "error": null
}
```

#### `GET /api/components`
Get all components stored in database

**Response:**
```json
{
  "count": 5,
  "components": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "component_id": "COMP-001",
      "last_analysis_id": "507f1f77bcf86cd799439012",
      "last_risk_level": "WARNING",
      "created_at": "2025-01-25T10:30:00",
      "updated_at": "2025-01-25T11:45:00"
    }
  ]
}
```

#### `GET /api/components/{component_id}`
Get specific component details

#### `GET /api/components/{component_id}/analyses`
Get all analyses for a component (history)

**Response:**
```json
{
  "component_id": "COMP-001",
  "count": 3,
  "analyses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "component_id": "COMP-001",
      "module_a": { "status": "NORMAL", "anomaly_score": 0.12 },
      "module_b": { "prediction": "WARNING", "confidence": 0.84 },
      "final_risk": { "level": "WARNING", "confidence": 0.84, "explanation": "..." },
      "created_at": "2025-01-25T11:45:00"
    }
  ]
}
```

#### `GET /api/analyses`
Get recent analyses across all components

#### `GET /api/analyses/{analysis_id}`
Get specific analysis details

#### `GET /api/statistics`
Get database statistics (total components, risk distribution, etc.)

**Response:**
```json
{
  "statistics": {
    "total_components": 42,
    "total_analyses": 156,
    "risk_distribution": {
      "NORMAL": 28,
      "WARNING": 12,
      "HIGH_RISK": 2
    }
  }
}
```
# ISRO-ReliAI Backend

AI-Driven Anomaly Detection in Component Burn-In & Screening

## Project Overview

ISRO-ReliAI is a Flask-based backend system designed to detect anomalies and predict component reliability during burn-in testing. The system uses two trained machine learning models:

- **Module A (Anomaly Detection)**: Isolation Forest to detect abnormal component behavior
- **Module B (Drift Prediction)**: LSTM to predict component reliability and future risk

Both modules work together through a risk engine to provide comprehensive component analysis and recommendations.

## Architecture

```
backend/
├── app.py                      # Flask application factory
├── config.py                   # Configuration and environment variables
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── models/
│   ├── isolation_forest_model.pkl
│   ├── scaler.pkl
│   └── lstm_reliability_model.keras/
│
├── services/
│   ├── __init__.py
│   ├── model_service.py        # Model loading and prediction
│   └── risk_engine.py          # Risk classification logic
│
├── routes/
│   ├── __init__.py
│   ├── health_routes.py        # Health check endpoints
│   └── prediction_routes.py    # Prediction API endpoints
│
└── utils/
    ├── __init__.py
    └── validation.py           # Input validation
```


├── services/
│   ├── database_service.py     # MongoDB integration (new)
│   ├── model_service.py        # Model loading and prediction (with mock fallback)
│   └── risk_engine.py          # Risk classification logic
│
├── routes/
│   ├── health_routes.py        # Health check endpoints
│   ├── prediction_routes.py    # Prediction API endpoints
│   └── database_routes.py      # Database endpoints (new)
│
├── .env.example                # Environment configuration template
├── FRONTEND_INTEGRATION.md     # Detailed frontend integration guide (new)
└── test_api_with_db.py         # API test suite with database operations (new)
```

## Prerequisites
- Python 3.11 or higher
- pip or conda package manager

## Installation

### 1. Create Virtual Environment

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask 3.0.0
- Flask-CORS 4.0.0
- TensorFlow 2.15.0
- scikit-learn 1.9.0
- numpy and pandas

## Configuration

Create a `.env` file in the backend directory:

```env
# Server
HOST=0.0.0.0
PORT=5000
DEBUG=False

# Frontend URL (for CORS)
FRONTEND_URL=https://isro-reliai.netlify.app

# MongoDB Configuration (Required for data persistence)
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=isro_reliai

# Model Configuration
USE_MOCK_MODELS=False
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | 0.0.0.0 | Server host address |
| `PORT` | 5000 | Server port |
| `DEBUG` | False | Debug mode |
| `FRONTEND_URL` | https://isro-reliai.netlify.app | Frontend URL for CORS |
| `MONGODB_URL` | - | MongoDB connection string (required for persistence) |
| `MONGODB_DB` | isro_reliai | MongoDB database name |
| `USE_MOCK_MODELS` | False | Use mock models when real models fail (for testing) |

## Running the Backend

### Development Server

```bash
python app.py
```

The server will start at:
- **Local**: http://localhost:5000
- **Network**: http://0.0.0.0:5000

### Production Server (with Gunicorn)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

## API Endpoints

### Health Check

#### `GET /`
Root endpoint - returns project information

**Response:**
```json
{
  "project": "ISRO-ReliAI",
  "message": "AI-Driven Component Burn-In & Screening Backend",
  "status": "running",
  "version": "1.0.0"
}
```

#### `GET /health`
Health check - verifies all models are loaded

**Response:**
```json
{
  "status": "healthy",
  "models": {
    "isolation_forest": true,
    "scaler": true,
    "lstm": true
  },
  "errors": {}
}
```

### Module A: Anomaly Detection

#### `POST /api/anomaly`
Detect abnormal component behavior using Isolation Forest

**Request:**
```json
{
  "features": [
    f1, f2, f3, f4, f5, f6, f7, f8,
    f9, f10, f11, f12, f13, f14, f15, f16
  ]
}
```

**Parameters:**
- `features`: List of 16 numeric features representing component parameters

**Response (Normal):**
```json
{
  "module": "Module A",
  "status": "NORMAL",
  "anomaly": false,
  "anomaly_score": 0.12,
  "explanation": "Component behaviour is within the learned normal pattern."
}
```

**Response (Anomaly):**
```json
{
  "module": "Module A",
  "status": "ANOMALY",
  "anomaly": true,
  "anomaly_score": -0.45,
  "explanation": "Component behaviour differs significantly from the learned normal pattern."
}
```

### Module B: Drift Prediction

#### `POST /api/drift-prediction`
Predict component reliability and drift risk using LSTM

**Request:**
```json
{
  "time_series": [
    [v1_1, v1_2, v1_3, v1_4],
    [v2_1, v2_2, v2_3, v2_4],
    [v3_1, v3_2, v3_3, v3_4],
    [v4_1, v4_2, v4_3, v4_4]
  ]
}
```

**Parameters:**
- `time_series`: 2D array of 4 time steps × 4 features each

**Response:**
```json
{
  "module": "Module B",
  "prediction": "NORMAL",
  "confidence": 0.91,
  "probabilities": {
    "NORMAL": 0.91,
    "WARNING": 0.07,
    "HIGH_RISK": 0.02
  }
}
```

### Combined Analysis

#### `POST /api/analyze`
Run both modules and provide combined risk assessment

**Request:**
```json
{
  "component_id": "COMP-001",
  "features": [f1, f2, ..., f16],
  "time_series": [
    [v1, v2, v3, v4],
    [v1, v2, v3, v4],
    [v1, v2, v3, v4],
    [v1, v2, v3, v4]
  ]
}
```

**Response:**
```json
{
  "component_id": "COMP-001",
  "module_a": {
    "status": "NORMAL",
    "anomaly_score": 0.12
  },
  "module_b": {
    "prediction": "WARNING",
    "confidence": 0.84
  },
  "final_risk": {
    "level": "WARNING",
    "confidence": 0.84,
    "explanation": "Component behaviour requires monitoring because increasing warning risk was predicted. Continued observation and targeted screening is recommended.",
    "recommendation": "Continue monitoring the component closely. Extended burn-in testing and periodic re-screening are advised."
  }
}
```

## Risk Classification

The risk engine combines results from both modules:

### Decision Logic

| Module A | Module B | Final Risk | Action |
|----------|----------|-----------|--------|
| Normal | Normal | NORMAL | Routine monitoring |
| Normal | Warning | WARNING | Continue monitoring |
| Normal | High Risk | WARNING | Continue monitoring |
| Anomaly | Normal | WARNING | Continue monitoring |
| Anomaly | Warning | WARNING | Continue monitoring |
| Anomaly | High Risk | **HIGH_RISK** | Requires inspection |

### Risk Levels

- **NORMAL**: No issues detected. Component may proceed with standard procedures.
- **WARNING**: Monitor closely. Component shows elevated risk indicators. Extended testing recommended.
- **HIGH_RISK**: Immediate attention required. Component shows strong abnormal behavior and predicted risk. Further inspection needed.

## Frontend Integration

### API Configuration

The frontend should be configured to call the backend at:

```
http://localhost:5000  (development)
https://your-backend-url.com  (production)
```

Or using environment variables in the frontend.

### Expected Data Flow

1. **User Input**: Frontend collects component burn-in parameters
2. **POST /api/analyze**: Send all data to backend
3. **Processing**: Backend runs both ML modules
4. **Risk Classification**: Risk engine combines results
5. **Response**: Returns final risk level, explanation, and recommendation
6. **Display**: Frontend shows results to QA inspector

### Frontend Integration Example

```typescript
// Example TypeScript call
async function analyzeComponent(componentId: string, features: number[], timeSeries: number[][]) {
  const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      component_id: componentId,
      features: features,
      time_series: timeSeries
    })
  });
  
  const result = await response.json();
  console.log(`Final Risk: ${result.final_risk.level}`);
  console.log(`Recommendation: ${result.final_risk.recommendation}`);
}
```

## Testing

### Test Health Check

```bash
curl http://localhost:5000/health
```

### Test Module A (Anomaly Detection)

```bash
curl -X POST http://localhost:5000/api/anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "features": [1.2, 2.3, 3.4, 4.5, 5.6, 6.7, 7.8, 8.9, 9.1, 10.2, 11.3, 12.4, 13.5, 14.6, 15.7, 16.8]
  }'
```

### Test Module B (Drift Prediction)

```bash
curl -X POST http://localhost:5000/api/drift-prediction \
  -H "Content-Type: application/json" \
  -d '{
    "time_series": [
      [1.0, 2.0, 3.0, 4.0],
      [1.1, 2.1, 3.1, 4.1],
      [1.2, 2.2, 3.2, 4.2],
      [1.3, 2.3, 3.3, 4.3]
    ]
  }'
```

### Test Combined Analysis

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "component_id": "COMP-001",
    "features": [1.2, 2.3, 3.4, 4.5, 5.6, 6.7, 7.8, 8.9, 9.1, 10.2, 11.3, 12.4, 13.5, 14.6, 15.7, 16.8],
    "time_series": [
      [1.0, 2.0, 3.0, 4.0],
      [1.1, 2.1, 3.1, 4.1],
      [1.2, 2.2, 3.2, 4.2],
      [1.3, 2.3, 3.3, 4.3]
    ]
  }'
```

## Model Information

### LSTM Model (lstm_reliability_model.keras)

✅ **Successfully Loaded**

- **Input Shape**: (4, 4) - 4 time steps, 4 features per step
- **Architecture**:
  - InputLayer: [None, 4, 4]
  - LSTM: 64 units
  - Dropout: 0.3
  - Dense: 32 units (ReLU)
  - Dropout: 0.2
  - Dense: 3 units (Softmax) - Output classes
- **Output**: 3 classes with probabilities
- **Activation**: Softmax (probability distribution)

### Isolation Forest Model (isolation_forest_model.pkl)

⚠️ **Loading Issue**

The Isolation Forest model file could not be loaded due to pickle compatibility issues:
- Error: `invalid load key, '\x0a'`
- The model was saved with scikit-learn 1.6.1 but current environment uses 1.9.0
- Expected input: 16 features

**Resolution Options:**

1. **Re-export the model**: Run your training script and re-save the model:
   ```python
   import joblib
   joblib.dump(isolation_forest_model, 'models/isolation_forest_model.pkl')
   ```

2. **Use compatibility version**: Install compatible scikit-learn:
   ```bash
   pip install scikit-learn==1.6.1
   ```

3. **Retrain the model**: If training code is available, retrain and save with current versions.

### Scaler Model (scaler.pkl)

⚠️ **Loading Issue**

Similar pickle compatibility issue as Isolation Forest:
- Error: `invalid load key, '\x07'`

**Resolution**: Use same options as Isolation Forest above.

## Troubleshooting

### Models Not Loading

Check the `/health` endpoint:
```bash
curl http://localhost:5000/health
```

If models show `false`, check the errors in the response. Common issues:

1. **File not found**: Ensure models/ directory exists with model files
2. **Permission denied**: Check file permissions
3. **Version mismatch**: Install compatible library versions
4. **Corrupted files**: Re-export or re-train models

### CORS Issues

If frontend cannot reach backend:

1. Ensure frontend URL is in `ALLOWED_ORIGINS` in `config.py`
2. Verify `FRONTEND_URL` environment variable is set correctly
3. Check that backend server is running
4. Verify CORS header in Flask app initialization

### Input Validation Errors

- **"Expected 16 features"**: Anomaly detection requires exactly 16 features
- **"Expected shape (4, 4)"**: LSTM requires 4 time steps × 4 features
- **"NaN or infinite values"**: Check input data for missing values

## Deployment

### Deploy to Heroku

1. Create `Procfile`:
   ```
   web: gunicorn -w 4 -b 0.0.0.0:$PORT 'app:create_app()'
   ```

2. Create `runtime.txt`:
   ```
   python-3.11.7
   ```

3. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set FRONTEND_URL=https://your-frontend.netlify.app
   git push heroku main
   ```

### Deploy to AWS/Google Cloud

Use containerization with Docker:

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

## Important Notes

### Prototype Disclaimer

This is a prototype system designed for ISRO hackathon purposes:

- Results are **AI-based screening indications** - not guaranteed physical failure detection
- System is meant to **assist QA inspectors**, not replace engineering qualification procedures
- All predictions require **human verification and inspection**
- Use terminology like "requires inspection" and "predicted risk"

### Model Performance

The accuracy and reliability of predictions depend on:

1. Training data quality and representativeness
2. Component parameter measurement accuracy
3. Alignment between deployment and training conditions
4. Regular model retraining with new component data

### Feature Specifications

For optimal results, provide:

**Module A (Anomaly Detection)**:
- 16 numeric features representing component parameters
- Features normalized to same scale as training data
- No missing or infinite values

**Module B (Drift Prediction)**:
- Time-series data: 4 consecutive measurements
- Each measurement: 4 features
- Features normalized to same scale as training data
- Regular sampling intervals

## Support & Maintenance

For issues or improvements:

1. Check this README
2. Verify model files are properly configured
3. Check backend logs for detailed error messages
4. Ensure all dependencies are correctly installed

## License

ISRO-ReliAI Backend - 2024
