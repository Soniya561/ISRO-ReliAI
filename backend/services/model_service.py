"""
Model Service
Handles loading and running predictions with trained models
Includes fallback to mock models if real models fail to load
"""
import os
import numpy as np
import pickle
import warnings
import json
from pathlib import Path
from config import Config

try:
    import tensorflow as tf
except ImportError:
    tf = None

# ============ MOCK MODELS FOR TESTING ============

class MockIsolationForest:
    """Mock Isolation Forest for testing when real model fails"""
    def __init__(self):
        self.n_features_in_ = Config.IF_N_FEATURES
        self.contamination = Config.IF_CONTAMINATION
    
    def predict(self, X):
        """Return random predictions between -1 and 1"""
        n_samples = X.shape[0]
        # ~10% anomalies (return -1), 90% normal (return 1)
        return np.random.choice([-1, 1], size=n_samples, p=[0.1, 0.9])
    
    def score_samples(self, X):
        """Return random anomaly scores"""
        n_samples = X.shape[0]
        # Scores between -1 and 1, with mean around -0.1
        return np.random.normal(-0.1, 0.3, n_samples)

class MockScaler:
    """Mock StandardScaler for testing when real scaler fails"""
    def __init__(self):
        self.n_features_in_ = Config.IF_N_FEATURES
        self.mean_ = np.zeros(Config.IF_N_FEATURES)
        self.scale_ = np.ones(Config.IF_N_FEATURES)
    
    def transform(self, X):
        """Return data as-is"""
        return np.array(X, dtype=np.float64)
    
    def fit_transform(self, X):
        """Return data as-is"""
        return np.array(X, dtype=np.float64)

class MockLSTMModel:
    """Mock LSTM for testing when real model fails"""
    def __init__(self):
        self.input_shape = (None, Config.LSTM_INPUT_SHAPE[0], Config.LSTM_INPUT_SHAPE[1])
        self.output_shape = (None, Config.LSTM_OUTPUT_CLASSES)
    
    def predict(self, X, verbose=0):
        """Return random predictions for 3 classes"""
        n_samples = X.shape[0]
        # Generate random probabilities that sum to 1
        probs = np.random.dirichlet([1] * Config.LSTM_OUTPUT_CLASSES, n_samples)
        return probs
    
    def summary(self):
        """Print model summary"""
        print(f"Mock LSTM Model (input: {self.input_shape}, output: {self.output_shape})")

class ModelService:
    """Service for managing model loading and predictions"""
    
    _instance = None  # Singleton pattern
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.isolation_forest = None
        self.scaler = None
        self.lstm = None
        self.models_loaded = {
            'isolation_forest': False,
            'scaler': False,
            'lstm': False
        }
        self.using_mock = {
            'isolation_forest': False,
            'scaler': False,
            'lstm': False
        }
        self.errors = {}
        
        self._load_models()
        self._initialized = True
    
    def _load_models(self):
        """Load all trained models"""
        self._load_isolation_forest()
        self._load_scaler()
        self._load_lstm()
    
    def _load_isolation_forest(self):
        """Load Isolation Forest model"""
        try:
            if not os.path.exists(Config.ISOLATION_FOREST_PATH):
                raise FileNotFoundError(f"Isolation Forest model not found at {Config.ISOLATION_FOREST_PATH}")
            
            with warnings.catch_warnings():
                warnings.filterwarnings('ignore')
                with open(Config.ISOLATION_FOREST_PATH, 'rb') as f:
                    self.isolation_forest = pickle.load(f)
            
            self.models_loaded['isolation_forest'] = True
            self.using_mock['isolation_forest'] = False
            print(f"✓ Isolation Forest model loaded successfully")
        except Exception as e:
            error_msg = f"Failed to load Isolation Forest model: {str(e)}"
            self.errors['isolation_forest'] = error_msg
            print(f"✗ {error_msg}")
            
            # Use mock model if enabled
            if Config.USE_MOCK_MODELS:
                try:
                    self.isolation_forest = MockIsolationForest()
                    self.models_loaded['isolation_forest'] = True
                    self.using_mock['isolation_forest'] = True
                    print(f"⚠ Using mock Isolation Forest model for testing")
                except Exception as mock_error:
                    print(f"✗ Mock Isolation Forest failed: {mock_error}")
    
    def _load_scaler(self):
        """Load Scaler model"""
        try:
            if not os.path.exists(Config.SCALER_PATH):
                raise FileNotFoundError(f"Scaler model not found at {Config.SCALER_PATH}")
            
            with warnings.catch_warnings():
                warnings.filterwarnings('ignore')
                with open(Config.SCALER_PATH, 'rb') as f:
                    self.scaler = pickle.load(f)
            
            self.models_loaded['scaler'] = True
            self.using_mock['scaler'] = False
            print(f"✓ Scaler model loaded successfully")
        except Exception as e:
            error_msg = f"Failed to load Scaler: {str(e)}"
            self.errors['scaler'] = error_msg
            print(f"✗ {error_msg}")
            
            # Use mock model if enabled
            if Config.USE_MOCK_MODELS:
                try:
                    self.scaler = MockScaler()
                    self.models_loaded['scaler'] = True
                    self.using_mock['scaler'] = True
                    print(f"⚠ Using mock Scaler for testing")
                except Exception as mock_error:
                    print(f"✗ Mock Scaler failed: {mock_error}")
    
    def _load_lstm(self):
        """Load LSTM model"""
        try:
            if tf is None:
                raise ImportError("TensorFlow/Keras not available")
            
            # Check if path is a directory (Keras saved_model format)
            if os.path.isdir(Config.LSTM_PATH):
                with warnings.catch_warnings():
                    warnings.filterwarnings('ignore')
                    self.lstm = tf.keras.models.load_model(Config.LSTM_PATH)
            else:
                raise FileNotFoundError(f"LSTM model not found at {Config.LSTM_PATH}")
            
            self.models_loaded['lstm'] = True
            self.using_mock['lstm'] = False
            print(f"✓ LSTM model loaded successfully")
        except Exception as e:
            error_msg = f"Failed to load LSTM model: {str(e)}"
            self.errors['lstm'] = error_msg
            print(f"✗ {error_msg}")
            
            # Try alternative loading method
            try:
                keras_path = os.path.join(Config.LSTM_PATH, 'model.keras')
                if os.path.exists(keras_path):
                    with warnings.catch_warnings():
                        warnings.filterwarnings('ignore')
                        self.lstm = tf.keras.models.load_model(keras_path)
                    self.models_loaded['lstm'] = True
                    self.using_mock['lstm'] = False
                    print(f"✓ LSTM model loaded from alternate path")
                    self.errors['lstm'] = None
                    return
            except:
                pass
            
            # Use mock model if enabled
            if Config.USE_MOCK_MODELS:
                try:
                    self.lstm = MockLSTMModel()
                    self.models_loaded['lstm'] = True
                    self.using_mock['lstm'] = True
                    print(f"⚠ Using mock LSTM model for testing")
                except Exception as mock_error:
                    print(f"✗ Mock LSTM failed: {mock_error}")
    
    def get_health_status(self):
        """Get current status of all models"""
        return {
            'isolation_forest': self.models_loaded['isolation_forest'],
            'scaler': self.models_loaded['scaler'],
            'lstm': self.models_loaded['lstm'],
            'using_mock_isolation_forest': self.using_mock['isolation_forest'],
            'using_mock_scaler': self.using_mock['scaler'],
            'using_mock_lstm': self.using_mock['lstm'],
            'errors': self.errors
        }
    
    def predict_anomaly(self, features):
        """
        Run Isolation Forest anomaly detection
        
        Args:
            features: array-like of shape (n_features,)
        
        Returns:
            dict with 'anomaly' (bool), 'score' (float), 'status' (str)
        """
        if not self.models_loaded['isolation_forest']:
            return {
                'error': 'Isolation Forest model not loaded',
                'anomaly': None,
                'score': None,
                'status': 'ERROR'
            }
        
        try:
            features = np.array(features).reshape(1, -1)
            
            # Predict: -1 for anomaly, 1 for normal
            prediction = self.isolation_forest.predict(features)[0]
            
            # Get anomaly score (negative = more anomalous)
            anomaly_score = self.isolation_forest.score_samples(features)[0]
            
            is_anomaly = prediction == -1
            
            return {
                'anomaly': is_anomaly,
                'score': float(anomaly_score),
                'status': 'ANOMALY' if is_anomaly else 'NORMAL',
                'prediction': int(prediction)
            }
        except Exception as e:
            return {
                'error': f'Anomaly prediction failed: {str(e)}',
                'anomaly': None,
                'score': None,
                'status': 'ERROR'
            }
    
    def predict_drift(self, time_series):
        """
        Run LSTM drift/reliability prediction
        
        Args:
            time_series: array-like of shape (time_steps, n_features)
                        Expected: (4, 4) - 4 time steps, 4 features each
        
        Returns:
            dict with 'prediction' (int), 'confidence' (float), 'probabilities' (list)
        """
        if not self.models_loaded['lstm']:
            return {
                'error': 'LSTM model not loaded',
                'prediction': None,
                'confidence': None,
                'probabilities': None,
                'class_index': None
            }
        
        try:
            # Reshape input: (time_steps, features) -> (1, time_steps, features)
            time_series = np.array(time_series).reshape(1, Config.LSTM_INPUT_SHAPE[0], Config.LSTM_INPUT_SHAPE[1])
            
            # Validate input shape
            if time_series.shape[1:] != Config.LSTM_INPUT_SHAPE:
                return {
                    'error': f'Invalid input shape. Expected {Config.LSTM_INPUT_SHAPE}, got {time_series.shape[1:]}',
                    'prediction': None,
                    'confidence': None,
                    'probabilities': None,
                    'class_index': None
                }
            
            # Make prediction
            probabilities = self.lstm.predict(time_series, verbose=0)[0]
            class_index = int(np.argmax(probabilities))
            confidence = float(probabilities[class_index])
            
            return {
                'class_index': class_index,
                'confidence': confidence,
                'probabilities': [float(p) for p in probabilities],
                'error': None
            }
        except Exception as e:
            return {
                'error': f'Drift prediction failed: {str(e)}',
                'prediction': None,
                'confidence': None,
                'probabilities': None,
                'class_index': None
            }
    
    def get_lstm_output_classes(self):
        """Get LSTM output class labels"""
        # These are inferred from the model output
        # Adjust based on actual training data if different
        return ['NORMAL', 'WARNING', 'HIGH_RISK']
