"""
Input validation utilities
"""
import numbers
import numpy as np
from config import Config

class ValidationError(Exception):
    """Custom validation exception"""
    pass

class InputValidator:
    """Validate API request inputs"""
    
    @staticmethod
    def validate_anomaly_input(data):
        """
        Validate anomaly detection (Module A) input
        
        Expected format: list/array of numeric features
        Expected number of features: Config.IF_N_FEATURES
        
        Args:
            data: list or array of features
        
        Returns:
            numpy array of validated features
        
        Raises:
            ValidationError on invalid input
        """
        if not isinstance(data, (list, tuple, np.ndarray)):
            raise ValidationError(f"Expected list, tuple, or array. Got {type(data)}")
        
        if len(data) == 0:
            raise ValidationError("Features list cannot be empty")
        
        # Convert to numpy array
        try:
            features = np.array(data, dtype=np.float64)
        except (ValueError, TypeError):
            raise ValidationError("All features must be numeric values")
        
        # Check for NaN or inf
        if np.any(np.isnan(features)) or np.any(np.isinf(features)):
            raise ValidationError("Features cannot contain NaN or infinite values")
        
        # Validate number of features
        expected_features = Config.IF_N_FEATURES
        if features.shape[0] != expected_features:
            raise ValidationError(
                f"Expected {expected_features} features, got {features.shape[0]}. "
                f"Please provide: {InputValidator.get_anomaly_feature_names()}"
            )
        
        return features
    
    @staticmethod
    def validate_drift_input(data):
        """
        Validate drift prediction (Module B) input
        
        Expected format: 2D array of shape (time_steps, n_features)
        Expected shape: (4, 4) - 4 time steps, 4 features each
        
        Args:
            data: 2D list/array representing time-series
        
        Returns:
            numpy array of validated time-series
        
        Raises:
            ValidationError on invalid input
        """
        if not isinstance(data, (list, tuple, np.ndarray)):
            raise ValidationError(f"Expected list, tuple, or array. Got {type(data)}")
        
        # Convert to numpy array
        try:
            time_series = np.array(data, dtype=np.float64)
        except (ValueError, TypeError):
            raise ValidationError("All values must be numeric")
        
        # Ensure 2D
        if time_series.ndim != 2:
            raise ValidationError(f"Expected 2D array (time_steps, features). Got shape {time_series.shape}")
        
        # Check for NaN or inf
        if np.any(np.isnan(time_series)) or np.any(np.isinf(time_series)):
            raise ValidationError("Time-series data cannot contain NaN or infinite values")
        
        # Validate shape
        expected_shape = Config.LSTM_INPUT_SHAPE
        if time_series.shape != expected_shape:
            raise ValidationError(
                f"Expected shape {expected_shape} (4 time steps × 4 features), "
                f"got shape {time_series.shape}"
            )
        
        return time_series
    
    @staticmethod
    def validate_component_id(component_id):
        """
        Validate component identifier
        
        Args:
            component_id: string identifier
        
        Returns:
            validated component_id string
        
        Raises:
            ValidationError on invalid input
        """
        if not isinstance(component_id, str):
            raise ValidationError(f"Component ID must be a string, got {type(component_id)}")
        
        if len(component_id.strip()) == 0:
            raise ValidationError("Component ID cannot be empty")
        
        if len(component_id) > 50:
            raise ValidationError("Component ID too long (max 50 characters)")
        
        return component_id.strip()
    
    @staticmethod
    def get_anomaly_feature_names():
        """
        Get expected feature names for anomaly detection
        
        Note: Since models couldn't be loaded, using generic names
        """
        return [f"feature_{i+1}" for i in range(Config.IF_N_FEATURES)]
    
    @staticmethod
    def get_drift_feature_names():
        """
        Get expected feature names for drift prediction
        """
        return [f"feature_{i+1}" for i in range(Config.LSTM_INPUT_SHAPE[1])]
