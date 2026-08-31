"""
Database API routes
Endpoints for retrieving and managing stored analyses and component data
"""
from flask import Blueprint, jsonify
from services import DatabaseService

bp = Blueprint('database', __name__, url_prefix='/api')

@bp.route('/db-status', methods=['GET'])
def db_status():
    """Check database connection status"""
    db_service = DatabaseService()
    status = db_service.health_status()
    
    http_status = 200 if status['connected'] else 503
    return jsonify({
        "database": "MongoDB",
        "status": "connected" if status['connected'] else "disconnected",
        "url": status['url'],
        "database_name": status['database'],
        "error": status['error']
    }), http_status

@bp.route('/components', methods=['GET'])
def get_components():
    """Get all components"""
    db_service = DatabaseService()
    
    if not db_service.is_connected:
        return jsonify({
            "error": "Database not connected",
            "message": db_service.connection_error
        }), 503
    
    components = db_service.get_all_components()
    
    # Convert ObjectId to string for JSON serialization
    for comp in components:
        if '_id' in comp:
            comp['_id'] = str(comp['_id'])
        if 'created_at' in comp:
            comp['created_at'] = comp['created_at'].isoformat()
        if 'updated_at' in comp:
            comp['updated_at'] = comp['updated_at'].isoformat()
    
    return jsonify({
        "count": len(components),
        "components": components
    }), 200

@bp.route('/components/<component_id>', methods=['GET'])
def get_component(component_id):
    """Get a specific component"""
    db_service = DatabaseService()
    
    if not db_service.is_connected:
        return jsonify({
            "error": "Database not connected"
        }), 503
    
    component = db_service.get_component(component_id)
    
    if not component:
        return jsonify({
            "error": "Component not found",
            "component_id": component_id
        }), 404
    
    if '_id' in component:
        component['_id'] = str(component['_id'])
    if 'created_at' in component:
        component['created_at'] = component['created_at'].isoformat()
    if 'updated_at' in component:
        component['updated_at'] = component['updated_at'].isoformat()
    
    return jsonify(component), 200

@bp.route('/analyses', methods=['GET'])
def get_recent_analyses():
    """Get recent analyses"""
    db_service = DatabaseService()
    
    if not db_service.is_connected:
        return jsonify({
            "error": "Database not connected"
        }), 503
    
    analyses = db_service.get_recent_analyses()
    
    # Convert datetime to ISO format
    for analysis in analyses:
        if 'created_at' in analysis:
            analysis['created_at'] = analysis['created_at'].isoformat()
    
    return jsonify({
        "count": len(analyses),
        "analyses": analyses
    }), 200

@bp.route('/components/<component_id>/analyses', methods=['GET'])
def get_component_analyses(component_id):
    """Get all analyses for a component"""
    db_service = DatabaseService()
    
    if not db_service.is_connected:
        return jsonify({
            "error": "Database not connected"
        }), 503
    
    analyses = db_service.get_component_analyses(component_id)
    
    # Convert datetime to ISO format
    for analysis in analyses:
        if 'created_at' in analysis:
            analysis['created_at'] = analysis['created_at'].isoformat()
    
    return jsonify({
        "component_id": component_id,
        "count": len(analyses),
        "analyses": analyses
    }), 200

@bp.route('/analyses/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """Get a specific analysis"""
    db_service = DatabaseService()
    
    if not db_service.is_connected:
        return jsonify({
            "error": "Database not connected"
        }), 503
    
    analysis = db_service.get_analysis(analysis_id)
    
    if not analysis:
        return jsonify({
            "error": "Analysis not found",
            "analysis_id": analysis_id
        }), 404
    
    if 'created_at' in analysis:
        analysis['created_at'] = analysis['created_at'].isoformat()
    
    return jsonify(analysis), 200

@bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Get database statistics"""
    db_service = DatabaseService()
    
    if not db_service.is_connected:
        return jsonify({
            "error": "Database not connected"
        }), 503
    
    stats = db_service.get_statistics()
    
    return jsonify({
        "statistics": stats
    }), 200
