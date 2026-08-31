"""
Routes package
"""
from . import health_routes
from . import prediction_routes
from . import database_routes

__all__ = ['health_routes', 'prediction_routes', 'database_routes']
