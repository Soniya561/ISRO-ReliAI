"""
Prediction API routes
"""
from flask import Blueprint, request, jsonify
from services import ModelService, RiskEngine, DatabaseService
from utils import InputValidator, ValidationError

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/anomaly', methods=['POST'])
def anomaly():
    """
    Module A: Anomaly Detection Endpoint
    
    Detect abnormal component behaviour using Isolation Forest
    
    Request body:
    {
        "features": [f1, f2, ..., f16]  # List of 16 numeric features
    }
    
    Response:
    {
        "module": "Module A",
        "status": "NORMAL" | "ANOMALY",
        "anomaly": false | true,
        "anomaly_score": -0.123,
        "explanation": "..."
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "error": "Invalid input",
                "message": "Request body must be valid JSON"
            }), 400
        
        # Validate input
        if 'features' not in data:
            return jsonify({
                "error": "Invalid input",
                "message": "Missing required field: 'features'",
                "expected_format": {
                    "features": f"[{', '.join(['numeric_value'] * 16)}]"
                }
            }), 400
        
        try:
            features = InputValidator.validate_anomaly_input(data['features'])
        except ValidationError as e:
            return jsonify({
                "error": "Invalid input",
                "message": str(e)
            }), 400
        
        # Run prediction
        model_service = ModelService()
        result = model_service.predict_anomaly(features)
        
        if 'error' in result:
            return jsonify({
                "module": "Module A",
                "error": result['error'],
                "status": "ERROR"
            }), 503
        
        return jsonify({
            "module": "Module A",
            "status": result['status'],
            "anomaly": result['anomaly'],
            "anomaly_score": result['score'],
            "explanation": (
                "Component behaviour differs significantly from the learned normal pattern."
                if result['anomaly']
                else "Component behaviour is within the learned normal pattern."
            )
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": "Server error",
            "message": str(e)
        }), 500

@bp.route('/drift-prediction', methods=['POST'])
def drift_prediction():
    """
    Module B: Drift Prediction Endpoint
    
    Predict component reliability/drift using LSTM
    
    Request body:
    {
        "time_series": [
            [v1, v2, v3, v4],  # Time step 1: 4 features
            [v1, v2, v3, v4],  # Time step 2
            [v1, v2, v3, v4],  # Time step 3
            [v1, v2, v3, v4]   # Time step 4
        ]
    }
    
    Response:
    {
        "module": "Module B",
        "prediction": "NORMAL" | "WARNING" | "HIGH_RISK",
        "confidence": 0.91,
        "probabilities": {
            "NORMAL": 0.91,
            "WARNING": 0.07,
            "HIGH_RISK": 0.02
        }
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "error": "Invalid input",
                "message": "Request body must be valid JSON"
            }), 400
        
        # Validate input
        if 'time_series' not in data:
            return jsonify({
                "error": "Invalid input",
                "message": "Missing required field: 'time_series'",
                "expected_format": {
                    "time_series": "[[f1, f2, f3, f4], [f1, f2, f3, f4], [f1, f2, f3, f4], [f1, f2, f3, f4]]"
                }
            }), 400
        
        try:
            time_series = InputValidator.validate_drift_input(data['time_series'])
        except ValidationError as e:
            return jsonify({
                "error": "Invalid input",
                "message": str(e)
            }), 400
        
        # Run prediction
        model_service = ModelService()
        result = model_service.predict_drift(time_series)
        
        if 'error' in result and result['error']:
            return jsonify({
                "module": "Module B",
                "error": result['error'],
                "prediction": "ERROR"
            }), 503
        
        # Map class index to label
        class_labels = model_service.get_lstm_output_classes()
        class_label = class_labels[result['class_index']] if result['class_index'] is not None else 'UNKNOWN'
        
        return jsonify({
            "module": "Module B",
            "prediction": class_label,
            "confidence": result['confidence'],
            "probabilities": {
                label: result['probabilities'][i]
                for i, label in enumerate(class_labels)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": "Server error",
            "message": str(e)
        }), 500

@bp.route('/analyze', methods=['POST'])
def analyze():
    """
    Main Analysis Endpoint
    
    Combined endpoint: receives component data, runs both Module A and Module B,
    combines results through risk engine, and returns final decision
    
    Request body:
    {
        "component_id": "COMP-001",
        "features": [f1, f2, ..., f16],  # For Module A (Anomaly Detection)
        "time_series": [                 # For Module B (Drift Prediction)
            [v1, v2, v3, v4],
            [v1, v2, v3, v4],
            [v1, v2, v3, v4],
            [v1, v2, v3, v4]
        ]
    }
    
    Response:
    {
        "component_id": "COMP-001",
        "module_a": {
            "status": "NORMAL" | "ANOMALY",
            "anomaly_score": -0.123
        },
        "module_b": {
            "prediction": "NORMAL" | "WARNING" | "HIGH_RISK",
            "confidence": 0.91
        },
        "final_risk": {
            "level": "NORMAL" | "WARNING" | "HIGH_RISK",
            "confidence": 0.85,
            "explanation": "...",
            "recommendation": "..."
        }
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "error": "Invalid input",
                "message": "Request body must be valid JSON"
            }), 400
        
        # Validate component ID
        try:
            component_id = InputValidator.validate_component_id(
                data.get('component_id', 'UNKNOWN')
            )
        except ValidationError as e:
            return jsonify({
                "error": "Invalid component_id",
                "message": str(e)
            }), 400
        
        # Validate features for Module A
        if 'features' not in data:
            return jsonify({
                "error": "Invalid input",
                "message": "Missing required field: 'features'"
            }), 400
        
        try:
            features = InputValidator.validate_anomaly_input(data['features'])
        except ValidationError as e:
            return jsonify({
                "error": "Invalid features",
                "message": str(e)
            }), 400
        
        # Validate time_series for Module B
        if 'time_series' not in data:
            return jsonify({
                "error": "Invalid input",
                "message": "Missing required field: 'time_series'"
            }), 400
        
        try:
            time_series = InputValidator.validate_drift_input(data['time_series'])
        except ValidationError as e:
            return jsonify({
                "error": "Invalid time_series",
                "message": str(e)
            }), 400
        
        # Run both modules
        model_service = ModelService()
        
        # Module A: Anomaly Detection
        module_a_result = model_service.predict_anomaly(features)
        
        # Module B: Drift Prediction
        module_b_result = model_service.predict_drift(time_series)
        
        # Combine results through Risk Engine
        risk_classification = RiskEngine.classify_risk(module_a_result, module_b_result)
        
        # Generate full report
        report = RiskEngine.generate_report(
            component_id,
            module_a_result,
            module_b_result,
            risk_classification
        )
        
        # Save to database
        db_service = DatabaseService()
        analysis_data = {
            'module_a': report['module_a'],
            'module_b': report['module_b'],
            'final_risk': report['final_risk'],
            'input_features': [float(f) for f in features],
            'input_time_series': [[float(v) for v in row] for row in time_series]
        }
        analysis_id = db_service.save_analysis(component_id, analysis_data)
        
        # Also save/update component record
        db_service.create_component(component_id, {
            'last_analysis_id': analysis_id,
            'last_risk_level': risk_classification.get('risk_level')
        })
        
        # Prepare final response (simplified format)
        response = {
            "component_id": component_id,
            "analysis_id": analysis_id,
            
            "module_a": {
                "status": module_a_result.get('status', 'ERROR'),
                "anomaly_score": module_a_result.get('score')
            },
            
            "module_b": {
                "prediction": model_service.get_lstm_output_classes()[module_b_result.get('class_index', 0)]
                    if module_b_result.get('class_index') is not None else 'ERROR',
                "confidence": module_b_result.get('confidence')
            },
            
            "final_risk": {
                "level": risk_classification.get('risk_level'),
                "confidence": risk_classification.get('confidence'),
                "explanation": risk_classification.get('explanation'),
                "recommendation": risk_classification.get('recommendation')
            }
        }
        
        # Include full report in response for debugging/transparency
        response["_full_report"] = report
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({
            "error": "Server error",
            "message": str(e)
        }), 500

@bp.errorhandler(400)
def bad_request(error):
    """Handle bad request errors"""
    return jsonify({
        "error": "Bad request",
        "message": str(error)
    }), 400

@bp.errorhandler(404)
def not_found(error):
    """Handle not found errors"""
    return jsonify({
        "error": "Endpoint not found",
        "message": str(error)
    }), 404

@bp.errorhandler(500)
def server_error(error):
    """Handle server errors"""
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500
