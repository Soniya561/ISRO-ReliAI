## Frontend Integration Guide for ISRO-ReliAI Backend

This guide explains how to integrate the ISRO-ReliAI backend with MongoDB database support into your frontend.

### Backend Overview

The backend now provides:
- **ML Prediction APIs** - Anomaly detection and drift prediction using trained models
- **Database Persistence** - All analyses stored in MongoDB for historical tracking
- **Mock Model Fallback** - Realistic predictions even when real models fail to load
- **REST API Endpoints** - Complete CRUD operations for components and analyses

### Installation & Setup

1. **Clone and Install**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure Environment** (create `.env` file):
```env
# Server Configuration
HOST=0.0.0.0
PORT=5000
DEBUG=False

# Frontend URL (for CORS)
FRONTEND_URL=https://isro-reliai.netlify.app

# MongoDB Configuration (required for persistence)
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=isro_reliai

# Model Configuration
USE_MOCK_MODELS=False
```

3. **Start Server**
```bash
python app.py
```

### API Endpoints

#### 1. **Core Prediction Endpoints**

**POST /api/analyze** - Combined Analysis (RECOMMENDED)
```javascript
fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    component_id: "COMP-001",           // Unique component identifier
    features: [1.0, 2.0, ..., 16.0],   // 16 numeric features (Module A)
    time_series: [                      // 4x4 matrix (Module B)
      [1.0, 2.0, 3.0, 4.0],
      [2.0, 3.0, 4.0, 5.0],
      [3.0, 4.0, 5.0, 6.0],
      [4.0, 5.0, 6.0, 7.0]
    ]
  })
})
.then(res => res.json())
.then(data => {
  console.log('Analysis ID:', data.analysis_id);           // For tracking
  console.log('Risk Level:', data.final_risk.level);       // NORMAL/WARNING/HIGH_RISK
  console.log('Confidence:', data.final_risk.confidence);  // 0.0-1.0
});
```

**Response Example:**
```json
{
  "component_id": "COMP-001",
  "analysis_id": "507f1f77bcf86cd799439011",    // MongoDB ObjectId as string
  "module_a": {
    "status": "NORMAL",
    "anomaly_score": -0.123
  },
  "module_b": {
    "prediction": "NORMAL",
    "confidence": 0.91
  },
  "final_risk": {
    "level": "WARNING",
    "confidence": 0.85,
    "explanation": "Anomaly detected with moderate confidence",
    "recommendation": "Monitor component closely"
  },
  "_full_report": { /* detailed breakdown */ }
}
```

#### 2. **Component Management Endpoints**

**GET /api/components** - List all components
```javascript
fetch('http://localhost:5000/api/components')
  .then(res => res.json())
  .then(data => console.log(`Total components: ${data.count}`));
```

**GET /api/components/{component_id}** - Get component details
```javascript
fetch('http://localhost:5000/api/components/COMP-001')
  .then(res => res.json())
  .then(component => {
    console.log('Last Analysis:', component.last_analysis_id);
    console.log('Last Risk Level:', component.last_risk_level);
  });
```

#### 3. **Analysis History Endpoints**

**GET /api/analyses** - Get recent analyses (across all components)
```javascript
fetch('http://localhost:5000/api/analyses')
  .then(res => res.json())
  .then(data => {
    console.log(`Recent analyses: ${data.count}`);
    data.analyses.forEach(analysis => {
      console.log(`${analysis.component_id}: ${analysis.final_risk.level}`);
    });
  });
```

**GET /api/components/{component_id}/analyses** - Get component history
```javascript
// Get all analyses for a specific component
fetch('http://localhost:5000/api/components/COMP-001/analyses')
  .then(res => res.json())
  .then(data => {
    console.log(`Analyses for COMP-001: ${data.count}`);
    // Data available for trending/charting
  });
```

**GET /api/analyses/{analysis_id}** - Get specific analysis
```javascript
fetch('http://localhost:5000/api/analyses/507f1f77bcf86cd799439011')
  .then(res => res.json())
  .then(analysis => {
    console.log('Full analysis details:', analysis);
  });
```

#### 4. **System Status Endpoints**

**GET /health** - Server health check
```javascript
fetch('http://localhost:5000/health')
  .then(res => res.json())
  .then(data => console.log('Models status:', data));
```

**GET /api/db-status** - Database connection status
```javascript
fetch('http://localhost:5000/api/db-status')
  .then(res => res.json())
  .then(data => {
    if (data.status === 'connected') {
      console.log('Database is ready');
    } else {
      console.log('Database error:', data.error);
    }
  });
```

**GET /api/statistics** - Database statistics
```javascript
fetch('http://localhost:5000/api/statistics')
  .then(res => res.json())
  .then(stats => {
    console.log('Total components:', stats.statistics.total_components);
    console.log('Risk distribution:', stats.statistics.risk_distribution);
  });
```

### Frontend Implementation Examples

#### Example 1: Single Component Analysis Page
```jsx
function ComponentAnalysis({ componentId, features, timeSeries }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component_id: componentId,
          features,
          time_series: timeSeries
        })
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
      
      // Save analysis_id for later reference
      localStorage.setItem(`analysis_${data.analysis_id}`, JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={runAnalysis} disabled={loading}>
        {loading ? 'Analyzing...' : 'Run Analysis'}
      </button>
      
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      {result && (
        <div>
          <h3>Risk: {result.final_risk.level}</h3>
          <p>Confidence: {(result.final_risk.confidence * 100).toFixed(1)}%</p>
          <p>{result.final_risk.recommendation}</p>
        </div>
      )}
    </div>
  );
}
```

#### Example 2: Component History Timeline
```jsx
function ComponentHistory({ componentId }) {
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/components/${componentId}/analyses`)
      .then(res => res.json())
      .then(data => setAnalyses(data.analyses))
      .catch(console.error);
  }, [componentId]);

  return (
    <div>
      <h3>Analysis History</h3>
      <ul>
        {analyses.map(analysis => (
          <li key={analysis._id}>
            {new Date(analysis.created_at).toLocaleString()} - 
            Risk: <strong>{analysis.final_risk.level}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Example 3: Dashboard with Statistics
```jsx
function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/statistics')
      .then(res => res.json())
      .then(data => setStats(data.statistics))
      .catch(console.error);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>System Dashboard</h2>
      <div>Total Components: <strong>{stats.total_components}</strong></div>
      <div>
        Risk Distribution:
        <ul>
          <li>Normal: {stats.risk_distribution.NORMAL || 0}</li>
          <li>Warning: {stats.risk_distribution.WARNING || 0}</li>
          <li>High Risk: {stats.risk_distribution.HIGH_RISK || 0}</li>
        </ul>
      </div>
    </div>
  );
}
```

### Database Schema

The backend automatically manages MongoDB collections:

**components Collection:**
```json
{
  "_id": ObjectId,
  "component_id": "COMP-001",
  "last_analysis_id": ObjectId,
  "last_risk_level": "WARNING",
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**analyses Collection:**
```json
{
  "_id": ObjectId,
  "component_id": "COMP-001",
  "module_a": { "status": "NORMAL", "anomaly_score": -0.123 },
  "module_b": { "prediction": "WARNING", "confidence": 0.87 },
  "final_risk": {
    "level": "WARNING",
    "confidence": 0.85,
    "explanation": "...",
    "recommendation": "..."
  },
  "input_features": [...],
  "input_time_series": [...],
  "created_at": ISODate
}
```

### Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Invalid input",
  "message": "Component ID must be a non-empty string"
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Invalid input (validation error)
- `404` - Resource not found
- `503` - Service unavailable (model/database error)
- `500` - Server error

### Performance Tips

1. **Cache Component Data** - Components don't change often, cache for 5-10 minutes
2. **Batch Analysis Requests** - Group multiple analyses if possible
3. **Use Analysis IDs** - Store analysis_id for retrieving results later
4. **Monitor DB Status** - Check `/api/db-status` before critical operations
5. **Lazy Load History** - Fetch component history only when needed

### Troubleshooting

**Problem: 503 Error on /analyze**
- Check `/health` endpoint - models may have failed to load
- If `using_mock_*` flags are `true`, real models unavailable but predictions still work
- Check backend logs for model load errors

**Problem: Cannot connect to database**
- Verify MongoDB URL in `.env` file
- Check MongoDB connection permissions
- Ensure MongoDB cluster allows connections from your IP
- Try `/api/db-status` for detailed error message

**Problem: Analysis takes too long**
- Check backend server performance
- For large batches, consider queuing analysis requests
- MongoDB indexing may need optimization for large datasets

### Production Deployment

When deploying to production:
1. Set `DEBUG=False` in `.env`
2. Use production MongoDB connection string
3. Set `FRONTEND_URL` to your actual frontend domain
4. Consider using environment-based configuration
5. Enable HTTPS for all API calls
6. Implement rate limiting for analysis requests
7. Monitor database storage and clean old data periodically

### Additional Resources

- [Model Specifications](MODEL_SPECIFICATIONS.md) - Detailed model input/output specs
- [API Testing](test_api_with_db.py) - Python test suite for all endpoints
- [Flask Documentation](https://flask.palletsprojects.com/) - Backend framework
- [MongoDB Documentation](https://docs.mongodb.com/) - Database docs
