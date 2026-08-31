"""
Dataset and Analysis API routes
Endpoints for CSV upload, dataset retrieval, and component analysis
"""
import uuid
import pandas as pd
from io import StringIO
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from config import Config
from services import DatabaseService, ModelService, RiskEngine
from utils import InputValidator, ValidationError

bp = Blueprint('datasets', __name__, url_prefix='/api')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============ CSV VALIDATION ============

REQUIRED_CSV_COLUMNS = [
    'Component_ID',
    'Lot_ID',
    'Time_Hours',
    'Burn_In_Temperature_C',
    'Iddq_uA',
    'Leakage_Current_uA',
    'Propagation_Delay_ns',
    'Component_Status'
]

def validate_csv_columns(df):
    """Validate that CSV has all required columns"""
    missing_columns = [col for col in REQUIRED_CSV_COLUMNS if col not in df.columns]
    if missing_columns:
        return False, f"Missing required columns: {', '.join(missing_columns)}"
    return True, "OK"

def validate_csv_data(df):
    """Validate CSV data types and values"""
    errors = []
    
    # Check numeric columns
    numeric_columns = [
        'Time_Hours',
        'Burn_In_Temperature_C',
        'Iddq_uA',
        'Leakage_Current_uA',
        'Propagation_Delay_ns'
    ]
    
    for col in numeric_columns:
        try:
            pd.to_numeric(df[col], errors='raise')
        except:
            errors.append(f"Column '{col}' contains non-numeric values")
    
    # Check for empty rows
    if df.isnull().any().any():
        errors.append("CSV contains empty cells")
    
    # Check Component_ID and Lot_ID are not empty
    if df['Component_ID'].isnull().any() or df['Component_ID'].astype(str).str.strip().eq('').any():
        errors.append("Component_ID cannot be empty")
    
    if df['Lot_ID'].isnull().any() or df['Lot_ID'].astype(str).str.strip().eq('').any():
        errors.append("Lot_ID cannot be empty")
    
    return errors

# ============ CSV UPLOAD ENDPOINT ============

@bp.route('/datasets/upload', methods=['POST'])
def upload_dataset():
    """
    Upload and parse a CSV file
    
    Expected: multipart/form-data with 'file' field
    
    Returns:
    {
        "success": true,
        "dataset_id": "dataset-001",
        "filename": "screening_dataset.csv",
        "total_records": 2400,
        "total_components": 600,
        "total_lots": 15,
        "message": "Dataset uploaded and validated successfully"
    }
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "error": "No file provided",
                "message": "Please upload a CSV file"
            }), 400
        
        file = request.files['file']
        
        # Check if file has a name
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "Empty filename",
                "message": "Please select a file to upload"
            }), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": "Invalid file type",
                "message": "Only .csv files are allowed"
            }), 400
        
        # Read CSV file
        try:
            stream = StringIO(file.stream.read().decode('UTF-8'), newline=None)
            df = pd.read_csv(stream)
        except Exception as e:
            return jsonify({
                "success": False,
                "error": "CSV parsing error",
                "message": f"Failed to parse CSV: {str(e)}"
            }), 400
        
        # Check if CSV is empty
        if df.empty:
            return jsonify({
                "success": False,
                "error": "Empty CSV",
                "message": "CSV file contains no data rows"
            }), 400
        
        # Validate columns
        is_valid, message = validate_csv_columns(df)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": "Missing columns",
                "message": message
            }), 400
        
        # Validate data
        data_errors = validate_csv_data(df)
        if data_errors:
            return jsonify({
                "success": False,
                "error": "Invalid data",
                "message": "; ".join(data_errors)
            }), 400
        
        # Generate dataset ID
        dataset_id = f"dataset-{uuid.uuid4().hex[:8]}"
        
        # Calculate statistics
        total_records = len(df)
        total_components = df['Component_ID'].nunique()
        total_lots = df['Lot_ID'].nunique()
        
        # Convert DataFrame rows to MongoDB documents
        records = []
        for _, row in df.iterrows():
            record = {
                'component_id': str(row['Component_ID']).strip(),
                'lot_id': str(row['Lot_ID']).strip(),
                'time_hours': float(row['Time_Hours']),
                'burn_in_temperature_c': float(row['Burn_In_Temperature_C']),
                'iddq_ua': float(row['Iddq_uA']),
                'leakage_current_ua': float(row['Leakage_Current_uA']),
                'propagation_delay_ns': float(row['Propagation_Delay_ns']),
                'component_status': str(row['Component_Status']).strip(),
                'dataset_id': dataset_id
            }
            records.append(record)
        
        # Save to database
        db_service = DatabaseService()
        
        # Save dataset metadata
        dataset_id_result = db_service.save_dataset_metadata(
            dataset_id,
            secure_filename(file.filename),
            total_records,
            total_components,
            total_lots
        )
        
        if not dataset_id_result:
            return jsonify({
                "success": False,
                "error": "Database error",
                "message": "Failed to save dataset metadata"
            }), 503
        
        # Save component records
        inserted_count = db_service.save_component_records(records)
        
        if inserted_count != total_records:
            return jsonify({
                "success": False,
                "error": "Database error",
                "message": f"Only {inserted_count}/{total_records} records were saved"
            }), 503
        
        return jsonify({
            "success": True,
            "dataset_id": dataset_id,
            "filename": secure_filename(file.filename),
            "total_records": total_records,
            "total_components": total_components,
            "total_lots": total_lots,
            "message": "Dataset uploaded and validated successfully"
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Server error",
            "message": str(e)
        }), 500

# ============ GET DATASETS ============

@bp.route('/datasets', methods=['GET'])
def get_datasets():
    """Get list of uploaded datasets"""
    try:
        db_service = DatabaseService()
        
        if not db_service.is_connected:
            return jsonify({
                "error": "Database not connected",
                "datasets": []
            }), 503
        
        # For now, return empty list (datasets collection is just metadata)
        # TODO: Implement dataset listing from database
        
        return jsonify({
            "success": True,
            "datasets": []
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "datasets": []
        }), 500

# ============ GET COMPONENTS ============

@bp.route('/components', methods=['GET'])
def get_components():
    """
    Get component records with pagination and search
    
    Query parameters:
    - page: page number (default: 1)
    - limit: records per page (default: 50)
    - search: search term for component_id or lot_id
    """
    try:
        db_service = DatabaseService()
        
        if not db_service.is_connected:
            return jsonify({
                "error": "Database not connected",
                "components": []
            }), 503
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        search_term = request.args.get('search', '', type=str)
        
        # Validate pagination
        if page < 1:
            page = 1
        if limit < 1 or limit > 500:
            limit = 50
        
        skip = (page - 1) * limit
        
        components = db_service.get_component_records(limit=limit, skip=skip, search_term=search_term if search_term else None)
        
        # Convert ObjectId to string
        for comp in components:
            if '_id' in comp:
                comp['_id'] = str(comp['_id'])
            if 'created_at' in comp:
                comp['created_at'] = comp['created_at'].isoformat()
        
        return jsonify({
            "success": True,
            "page": page,
            "limit": limit,
            "count": len(components),
            "components": components
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "components": []
        }), 500

# ============ GET SINGLE COMPONENT ============

@bp.route('/components/<component_id>', methods=['GET'])
def get_component(component_id):
    """
    Get all records for a specific component (for time-series analysis)
    
    Returns:
    {
        "component_id": "L01-C04",
        "records": [
            { "time_hours": 0, ... },
            { "time_hours": 24, ... },
            ...
        ]
    }
    """
    try:
        db_service = DatabaseService()
        
        if not db_service.is_connected:
            return jsonify({
                "error": "Database not connected"
            }), 503
        
        records = db_service.get_component_by_id(component_id)
        
        if not records:
            return jsonify({
                "error": "Component not found",
                "component_id": component_id
            }), 404
        
        # Convert ObjectId and dates
        for record in records:
            if '_id' in record:
                record['_id'] = str(record['_id'])
            if 'created_at' in record:
                record['created_at'] = record['created_at'].isoformat()
        
        return jsonify({
            "success": True,
            "component_id": component_id,
            "total_records": len(records),
            "records": records
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

# ============ ANALYZE COMPONENT ============

@bp.route('/analyze', methods=['POST'])
def analyze_component():
    """
    Perform combined AI analysis on a component
    
    Request body:
    {
        "component_id": "L01-C04"
    }
    
    Response includes Module A & B results and final risk assessment
    """
    try:
        data = request.get_json()
        if not data or 'component_id' not in data:
            return jsonify({
                "success": False,
                "error": "Missing component_id"
            }), 400
        
        component_id = data.get('component_id', '').strip()
        
        if not component_id:
            return jsonify({
                "success": False,
                "error": "component_id cannot be empty"
            }), 400
        
        db_service = DatabaseService()
        
        if not db_service.is_connected:
            return jsonify({
                "success": False,
                "error": "Database not connected"
            }), 503
        
        # Get component records for time-series data
        records = db_service.get_component_by_id(component_id)
        
        if not records:
            return jsonify({
                "success": False,
                "error": f"Component '{component_id}' not found in database"
            }), 404
        
        # Sort by time_hours
        records = sorted(records, key=lambda x: x['time_hours'])
        
        model_service = ModelService()
        
        # ===== MODULE A: Anomaly Detection =====
        # Use the first record (0h measurement) for anomaly detection
        first_record = records[0] if records else {}
        
        # Prepare features for Module A (Isolation Forest)
        # Using the visible features from CSV
        features = [
            first_record.get('time_hours', 0),
            first_record.get('burn_in_temperature_c', 0),
            first_record.get('iddq_ua', 0),
            first_record.get('leakage_current_ua', 0),
            first_record.get('propagation_delay_ns', 0)
        ]
        
        # Pad with zeros to reach expected feature count (16 features)
        while len(features) < Config.IF_N_FEATURES:
            features.append(0.0)
        
        module_a_result = model_service.predict_anomaly(features[:Config.IF_N_FEATURES])
        
        # ===== MODULE B: LSTM Drift Prediction =====
        # Prepare time-series data (4 timesteps, 4 features)
        # Use: iddq, leakage_current, propagation_delay, temperature
        time_series = []
        
        # Select evenly-spaced time points (0h, 24h, 96h, 168h if available)
        target_times = [0, 24, 96, 168]
        
        for target_time in target_times:
            # Find closest record to target time
            closest_record = min(records, key=lambda x: abs(x['time_hours'] - target_time))
            
            features_for_lstm = [
                closest_record.get('iddq_ua', 0),
                closest_record.get('leakage_current_ua', 0),
                closest_record.get('propagation_delay_ns', 0),
                closest_record.get('burn_in_temperature_c', 0)
            ]
            time_series.append(features_for_lstm)
        
        module_b_result = model_service.predict_drift(time_series)
        
        # ===== RISK ENGINE =====
        risk_result = RiskEngine.classify_risk(module_a_result, module_b_result)
        
        # Get LSTM class labels
        lstm_classes = model_service.get_lstm_output_classes()
        lstm_class_name = lstm_classes[module_b_result.get('class_index', 0)] if not module_b_result.get('error') else 'ERROR'
        
        # ===== SAVE ANALYSIS TO DATABASE =====
        lot_id = first_record.get('lot_id', '')
        
        module_a_data = {
            'status': module_a_result.get('status', 'ERROR'),
            'anomaly': module_a_result.get('anomaly', False),
            'anomaly_score': module_a_result.get('score', 0.0)
        }
        
        module_b_data = {
            'prediction': lstm_class_name,
            'confidence': module_b_result.get('confidence', 0.0),
            'probabilities': {
                lstm_classes[i]: module_b_result.get('probabilities', [0, 0, 0])[i]
                for i in range(len(lstm_classes))
            }
        }
        
        analysis_id = db_service.save_analysis_result(
            component_id=component_id,
            module_a=module_a_data,
            module_b=module_b_data,
            final_risk=risk_result.get('risk_level', 'ERROR'),
            explanation=risk_result.get('explanation', ''),
            recommendation=risk_result.get('recommendation', '')
        )
        
        # ===== RETURN RESPONSE =====
        return jsonify({
            "success": True,
            "component_id": component_id,
            "lot_id": lot_id,
            "analysis_id": analysis_id,
            
            "module_a": module_a_data,
            
            "module_b": module_b_data,
            
            "final_risk": risk_result.get('risk_level', 'ERROR'),
            
            "explanation": risk_result.get('explanation', ''),
            
            "recommendation": risk_result.get('recommendation', ''),
            
            "confidence": risk_result.get('confidence', 0.0)
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============ GET ANALYSIS ============

@bp.route('/analysis', methods=['GET'])
def get_all_analysis():
    """Get all analysis results"""
    try:
        db_service = DatabaseService()
        
        if not db_service.is_connected:
            return jsonify({
                "error": "Database not connected",
                "analyses": []
            }), 503
        
        limit = request.args.get('limit', 50, type=int)
        analyses = db_service.get_all_analysis_results(limit=limit)
        
        return jsonify({
            "success": True,
            "count": len(analyses),
            "analyses": analyses
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "analyses": []
        }), 500

@bp.route('/analysis/<component_id>', methods=['GET'])
def get_component_analysis(component_id):
    """Get analysis results for a specific component"""
    try:
        db_service = DatabaseService()
        
        if not db_service.is_connected:
            return jsonify({
                "error": "Database not connected",
                "analyses": []
            }), 503
        
        limit = request.args.get('limit', 50, type=int)
        analyses = db_service.get_component_analysis_results(component_id, limit=limit)
        
        return jsonify({
            "success": True,
            "component_id": component_id,
            "count": len(analyses),
            "analyses": analyses
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "analyses": []
        }), 500
