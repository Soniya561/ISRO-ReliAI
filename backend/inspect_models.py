#!/usr/bin/env python3
"""
Inspect trained ML models to determine specifications
"""
import pickle
import numpy as np

print('=== ISOLATION FOREST MODEL ===')
try:
    with open('models/isolation_forest_model.pkl', 'rb') as f:
        if_model = pickle.load(f)
    print(f'Model type: {type(if_model).__name__}')
    if hasattr(if_model, 'n_features_in_'):
        print(f'Expected features: {if_model.n_features_in_}')
    if hasattr(if_model, 'contamination'):
        print(f'Contamination: {if_model.contamination}')
    if hasattr(if_model, 'feature_names_in_'):
        print(f'Feature names: {list(if_model.feature_names_in_)}')
    print('✓ Isolation Forest loaded successfully')
except Exception as e:
    print(f'✗ Error loading Isolation Forest: {e}')

print('\n=== SCALER MODEL ===')
try:
    with open('models/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    print(f'Model type: {type(scaler).__name__}')
    if hasattr(scaler, 'n_features_in_'):
        print(f'Expected features: {scaler.n_features_in_}')
    if hasattr(scaler, 'feature_names_in_'):
        print(f'Feature names: {list(scaler.feature_names_in_)}')
    if hasattr(scaler, 'mean_'):
        print(f'Mean shape: {scaler.mean_.shape}')
        print(f'Mean values: {scaler.mean_}')
    if hasattr(scaler, 'scale_'):
        print(f'Scale shape: {scaler.scale_.shape}')
        print(f'Scale values: {scaler.scale_}')
    print('✓ Scaler loaded successfully')
except Exception as e:
    print(f'✗ Error loading Scaler: {e}')

print('\n=== LSTM MODEL ===')
try:
    import tensorflow as tf
    lstm = tf.keras.models.load_model('models/lstm_reliability_model.keras')
    print(f'Model type: {type(lstm).__name__}')
    print(f'Input shape: {lstm.input_shape}')
    print(f'Output shape: {lstm.output_shape}')
    
    config = lstm.get_config()
    print(f'Layers: {len(config["layers"])}')
    print(f'Output activation: {config["layers"][-1]["config"].get("activation", "N/A")}')
    
    dummy = np.random.randn(1, 4, 4).astype(np.float32)
    pred = lstm.predict(dummy, verbose=0)
    print(f'Sample prediction shape: {pred.shape}')
    print(f'Sample prediction: {pred[0]}')
    print('✓ LSTM loaded successfully')
except Exception as e:
    print(f'✗ Error loading LSTM: {e}')
