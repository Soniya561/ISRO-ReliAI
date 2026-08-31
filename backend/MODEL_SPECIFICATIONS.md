# Model Specifications

## LSTM Reliability Prediction Model

### ✅ Status: Successfully Loaded

**File**: `models/lstm_reliability_model.keras`

**Architecture**:
```
InputLayer (None, 4, 4)
    ↓
LSTM (64 units, tanh activation)
    ↓
Dropout (rate=0.3)
    ↓
Dense (32 units, relu activation)
    ↓
Dropout (rate=0.2)
    ↓
Dense (3 units, softmax activation)  ← OUTPUT
```

**Input Specification**:
- Shape: (batch_size, 4, 4)
- Meaning: 4 time steps, 4 features per time step
- Data Type: float32
- Range: Normalized to mean=0, std=1 (or 0-1 depending on training)

**Output Specification**:
- Shape: (batch_size, 3)
- Classes: 3 (indices 0, 1, 2)
- Values: Probabilities (sum to 1.0)
- Activation: Softmax

**Class Mapping** (Inferred):
- Index 0: NORMAL (baseline healthy operation)
- Index 1: WARNING (elevated drift risk)
- Index 2: HIGH_RISK (critical degradation predicted)

**Usage Example**:
```python
import tensorflow as tf
import numpy as np

model = tf.keras.models.load_model('models/lstm_reliability_model.keras')

# Prepare input: 4 time steps, 4 features each
time_series = np.array([
    [1.0, 2.0, 3.0, 4.0],  # Time step 1
    [1.1, 2.1, 3.1, 4.1],  # Time step 2
    [1.2, 2.2, 3.2, 4.2],  # Time step 3
    [1.3, 2.3, 3.3, 4.3]   # Time step 4
]).reshape(1, 4, 4)

# Make prediction
probabilities = model.predict(time_series)
# Output: [[0.91, 0.07, 0.02]]
# Interpretation: 91% NORMAL, 7% WARNING, 2% HIGH_RISK
```

---

## Isolation Forest Anomaly Detection Model

### ⚠️ Status: Loading Issue

**File**: `models/isolation_forest_model.pkl`

**Error**: Pickle format incompatibility
- Saved with: scikit-learn 1.6.1
- Current version: scikit-learn 1.9.0

**Expected Specification** (from configuration):
- Input Features: 16
- Contamination: ~0.1
- Output: Binary (-1 for anomaly, 1 for normal)
- Anomaly Score: Negative values indicate anomalies

**Feature Order** (UNKNOWN - model not loaded):
- Unable to extract from file
- Documentation recommended: Ask training team for feature list

**Usage Pattern** (Expected):
```python
import pickle

with open('models/isolation_forest_model.pkl', 'rb') as f:
    if_model = pickle.load(f)

# Input: 16 features
features = np.array([[f1, f2, ..., f16]])

# Predict: -1 (anomaly) or 1 (normal)
prediction = if_model.predict(features)  # Returns: [[-1]]

# Get anomaly score (more negative = more anomalous)
score = if_model.score_samples(features)  # Returns: [[-0.45]]
```

**Resolution**:
1. Re-export from training code using joblib:
   ```python
   import joblib
   joblib.dump(isolation_forest_model, 'models/isolation_forest_model.pkl')
   ```

2. Or downgrade scikit-learn:
   ```bash
   pip install scikit-learn==1.6.1
   ```

---

## Scaler Model

### ⚠️ Status: Loading Issue

**File**: `models/scaler.pkl`

**Error**: Pickle format incompatibility

**Expected Type**: StandardScaler (scikit-learn)

**Expected Specification**:
- Input Features: Unknown (likely 16, matching Isolation Forest)
- Mean: Learned from training data
- Scale (Std Dev): Learned from training data

**Usage Pattern** (Expected):
```python
import pickle

with open('models/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# Scale features before passing to Isolation Forest
features_scaled = scaler.transform(features)
prediction = if_model.predict(features_scaled)
```

**Note on Backend Integration**:
Currently, the backend attempts to run Isolation Forest without explicit scaling due to loading issues. When the model is fixed, ensure:
1. Features are scaled using the scaler before passing to Isolation Forest
2. Scaler input dimensions match Isolation Forest expected dimensions
3. Test predictions with known good values from training

---

## Data Preparation Guidelines

### For Module A (Anomaly Detection)

**Input Format**:
```json
{
  "features": [
    f1, f2, f3, f4, f5, f6, f7, f8,
    f9, f10, f11, f12, f13, f14, f15, f16
  ]
}
```

**Preparation Steps**:
1. Collect 16 component parameters (exact meaning depends on training)
2. Ensure numeric values (no strings, nulls, or NaN)
3. Apply same preprocessing as training:
   - Scale using scaler.pkl if available
   - Or use same normalization method as training
4. Send to backend

**Validation**:
- Must have exactly 16 values
- All values must be numeric
- No NaN or infinite values

### For Module B (Drift Prediction)

**Input Format**:
```json
{
  "time_series": [
    [f1_t1, f2_t1, f3_t1, f4_t1],
    [f1_t2, f2_t2, f3_t2, f4_t2],
    [f1_t3, f2_t3, f3_t3, f4_t3],
    [f1_t4, f2_t4, f3_t4, f4_t4]
  ]
}
```

**Preparation Steps**:
1. Collect 4 consecutive time measurements
2. Each measurement should have 4 features (same 4 features each time)
3. Ensure measurements are at regular time intervals
4. Normalize/scale using same method as training
5. No NaN, infinite, or missing values

**Example - Voltage measurements over time**:
```json
{
  "time_series": [
    [4.95, 3.02, 2.98, 1.04],  // Time t=0
    [4.96, 3.01, 2.97, 1.03],  // Time t=1
    [4.97, 3.03, 2.99, 1.05],  // Time t=2
    [4.98, 3.02, 3.00, 1.04]   // Time t=3
  ]
}
```

---

## Troubleshooting Model Loading

### LSTM Model Issues

**If LSTM fails to load**:
1. Verify file exists: `models/lstm_reliability_model.keras`
2. Check permissions: File should be readable
3. Verify TensorFlow is installed: `pip install tensorflow`
4. Try redownloading the model file

**Common Error**: "Permission denied"
- Check file ownership and permissions
- Run backend with appropriate user privileges

### Isolation Forest & Scaler Issues

**Pickle Compatibility Error**:
```
Error: invalid load key, '\x0a'
```

**Solution Priority**:
1. **Option A** (Recommended): Re-export from training code
   - Get access to original training script
   - Load model in Python with matching scikit-learn version
   - Re-save using joblib: `joblib.dump(model, 'path')`

2. **Option B**: Downgrade scikit-learn
   ```bash
   pip uninstall scikit-learn
   pip install scikit-learn==1.6.1
   ```

3. **Option C**: Retrain locally
   - Obtain training data
   - Retrain models with current environment
   - Save with current versions

---

## Model Performance Considerations

### Factors Affecting Prediction Quality

1. **Training Data Quality**
   - Quantity: More data generally improves robustness
   - Distribution: Should cover component operational range
   - Balance: Anomaly class proportion affects decision thresholds

2. **Feature Relevance**
   - Features must be properly selected for the task
   - Missing physical parameters reduces accuracy
   - Irrelevant features add noise

3. **Data Preprocessing**
   - LSTM: Features must be normalized consistently
   - Isolation Forest: Feature scaling affects performance
   - Scaler: Must match training preprocessing exactly

4. **Deployment Conditions**
   - Component variants: Different designs may behave differently
   - Environmental factors: Temperature, humidity, etc.
   - Manufacturing variations: Tolerances affect electrical characteristics

### Validation Before Production

1. Test with known good components
2. Test with known defective components
3. Compare results with historical QA decisions
4. Establish confidence thresholds for your process
5. Plan regular model retraining with new data

---

## Feature Documentation

### LSTM Time-Series Features

**Assumed names** (actual names unknown due to model loading issues):
- feature_1: Parameter A (over time)
- feature_2: Parameter B (over time)
- feature_3: Parameter C (over time)
- feature_4: Parameter D (over time)

**Action Required**: Contact training team for actual feature names and meanings

### Isolation Forest Features

**Assumed names**:
- feature_1 through feature_16

**Action Required**:
1. Determine what each feature represents
2. Understand measurement units and ranges
3. Document preprocessing/normalization applied
4. Verify feature ordering with training team

---

## Model Retraining

If model performance degrades or needs improvement:

1. **Collect new data**: Accumulate component measurements with known outcomes
2. **Retrain models**:
   ```python
   # LSTM retraining
   from tensorflow.keras.models import Sequential
   # ... build and train model
   model.save('models/lstm_reliability_model.keras')
   
   # Isolation Forest retraining
   from sklearn.ensemble import IsolationForest
   new_model = IsolationForest(contamination=0.1)
   new_model.fit(training_data)
   joblib.dump(new_model, 'models/isolation_forest_model.pkl')
   ```

3. **Validate on test set**: Before deployment
4. **Update backend**: Replace model files and restart

---

**Last Updated**: 2024-08-31
**Version**: 1.0.0
