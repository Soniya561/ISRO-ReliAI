"""
Routes package
"""
from . import health_routes
from . import prediction_routes
from . import database_routes
from . import dataset_routes

__all__ = ['health_routes', 'prediction_routes', 'database_routes', 'dataset_routes']
