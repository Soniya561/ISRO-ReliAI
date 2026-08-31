"""
ISRO-ReliAI Backend
AI-Driven Anomaly Detection in Component Burn-In & Screening

Main Flask application
"""
from flask import Flask
from flask_cors import CORS
from config import Config
from routes import health_routes, prediction_routes, database_routes

def create_app(config_class=Config):
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['ALLOWED_ORIGINS'],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": False
        }
    })
    
    # Register blueprints
    app.register_blueprint(health_routes.bp)
    app.register_blueprint(prediction_routes.bp)
    app.register_blueprint(database_routes.bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
