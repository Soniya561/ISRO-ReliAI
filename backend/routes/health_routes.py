"""
Health check routes
"""
from flask import Blueprint, jsonify
from services import ModelService

bp = Blueprint('health', __name__)

@bp.route('/', methods=['GET'])
def index():
    """Root endpoint - project info"""
    return jsonify({
        "project": "ISRO-ReliAI",
        "message": "AI-Driven Component Burn-In & Screening Backend",
        "status": "running",
        "version": "1.0.0"
    }), 200

@bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    model_service = ModelService()
    health_status = model_service.get_health_status()
    
    all_loaded = all(health_status.values())
    
    return jsonify({
        "status": "healthy" if all_loaded else "degraded",
        "models": {
            "isolation_forest": health_status['isolation_forest'],
            "scaler": health_status['scaler'],
            "lstm": health_status['lstm']
        },
        "errors": health_status.get('errors', {}),
        "note": "IMPORTANT: If isolation_forest or scaler fail to load, see README for details on model file compatibility issues."
    }), 200
