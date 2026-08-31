"""
Configuration for ISRO-ReliAI Backend
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    
    # Flask
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Server
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # CORS - Allowed origins
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://isro-reliai.netlify.app')
    ALLOWED_ORIGINS = [
        FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8443',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8443',
    ]
    
    # MongoDB configuration
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    MONGODB_URL = MONGODB_URI  # Keep for backwards compatibility
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'isro_reliai')
    MONGODB_DB = DATABASE_NAME  # Use DATABASE_NAME as primary
    
    # Collections
    MONGODB_COLLECTIONS = {
        'datasets': 'datasets',
        'component_records': 'component_records',
        'analysis_results': 'analysis_results',
        'components': 'components',
        'analyses': 'analyses',
        'predictions': 'predictions'
    }
    
    # Model paths
    MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
    ISOLATION_FOREST_PATH = os.path.join(MODELS_DIR, 'isolation_forest_model.pkl')
    SCALER_PATH = os.path.join(MODELS_DIR, 'scaler.pkl')
    LSTM_PATH = os.path.join(MODELS_DIR, 'lstm_reliability_model.keras')
    
    # Model configuration
    LSTM_INPUT_SHAPE = (4, 4)  # 4 time steps, 4 features
    LSTM_OUTPUT_CLASSES = 3     # NORMAL, WARNING, HIGH_RISK
    
    # Isolation Forest configuration (inferred from training)
    # Note: Could not load pickle file, using reasonable defaults
    IF_N_FEATURES = 16  # Expected number of input features
    IF_CONTAMINATION = 0.1  # Expected contamination parameter
    
    # Anomaly score thresholds for decision making
    ANOMALY_THRESHOLD = -0.5  # If anomaly score < this, consider as anomaly
    
    # Use mock models if real models fail to load
    USE_MOCK_MODELS = os.getenv('USE_MOCK_MODELS', 'True').lower() == 'true'
