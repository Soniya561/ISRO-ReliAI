"""
MongoDB Database Service
Handles all database operations for ISRO-ReliAI backend
"""
import os
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import Config
from bson.objectid import ObjectId

class DatabaseService:
    """Service for MongoDB database operations"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.client = None
        self.db = None
        self.is_connected = False
        self.connection_error = None
        
        self._connect()
        self._initialized = True
    
    def _connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(
                Config.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            # Test connection
            self.client.admin.command('ismaster')
            self.db = self.client[Config.MONGODB_DB]
            self.is_connected = True
            print(f"✓ MongoDB connected: {Config.MONGODB_URL}")
            self._create_indexes()
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            self.is_connected = False
            self.connection_error = f"MongoDB connection failed: {str(e)}"
            print(f"✗ {self.connection_error}")
        except Exception as e:
            self.is_connected = False
            self.connection_error = f"Database error: {str(e)}"
            print(f"✗ {self.connection_error}")
    
    def _create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Components collection indexes
            self.db[Config.MONGODB_COLLECTIONS['components']].create_index('component_id', unique=True)
            self.db[Config.MONGODB_COLLECTIONS['components']].create_index('created_at')
            
            # Analyses collection indexes
            self.db[Config.MONGODB_COLLECTIONS['analyses']].create_index('component_id')
            self.db[Config.MONGODB_COLLECTIONS['analyses']].create_index('created_at')
            self.db[Config.MONGODB_COLLECTIONS['analyses']].create_index([('created_at', -1)])
            
            # Predictions collection indexes
            self.db[Config.MONGODB_COLLECTIONS['predictions']].create_index('component_id')
            self.db[Config.MONGODB_COLLECTIONS['predictions']].create_index('analysis_id')
            self.db[Config.MONGODB_COLLECTIONS['predictions']].create_index('created_at')
            
            print("✓ Database indexes created")
        except Exception as e:
            print(f"⚠ Index creation warning: {e}")
    
    def health_status(self):
        """Get database health status"""
        return {
            'connected': self.is_connected,
            'url': Config.MONGODB_URL,
            'database': Config.MONGODB_DB,
            'error': self.connection_error
        }
    
    # ============ COMPONENT OPERATIONS ============
    
    def create_component(self, component_id, component_data):
        """Create or update a component record"""
        if not self.is_connected:
            return None
        
        try:
            collection = self.db[Config.MONGODB_COLLECTIONS['components']]
            
            document = {
                'component_id': component_id,
                'data': component_data,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'active'
            }
            
            result = collection.update_one(
                {'component_id': component_id},
                {'$set': document},
                upsert=True
            )
            
            return str(result.upserted_id or component_id)
        except Exception as e:
            print(f"Error creating component: {e}")
            return None
    
    def get_component(self, component_id):
        """Retrieve a component record"""
        if not self.is_connected:
            return None
        
        try:
            collection = self.db[Config.MONGODB_COLLECTIONS['components']]
            doc = collection.find_one({'component_id': component_id})
            return doc
        except Exception as e:
            print(f"Error retrieving component: {e}")
            return None
    
    def get_all_components(self, limit=100, skip=0):
        """Get all components with pagination"""
        if not self.is_connected:
            return []
        
        try:
            collection = self.db[Config.MONGODB_COLLECTIONS['components']]
            components = collection.find().skip(skip).limit(limit).sort('created_at', -1)
            return list(components)
        except Exception as e:
            print(f"Error retrieving components: {e}")
            return []
    
    # ============ ANALYSIS OPERATIONS ============
    
    def save_analysis(self, component_id, analysis_data):
        """Save analysis result to database"""
        if not self.is_connected:
            return None
        
        try:
            collection = self.db[Config.MONGODB_COLLECTIONS['analyses']]
            
            document = {
                'component_id': component_id,
                'module_a': analysis_data.get('module_a'),
                'module_b': analysis_data.get('module_b'),
                'final_risk': analysis_data.get('final_risk'),
                'created_at': datetime.utcnow(),
                'input_features': analysis_data.get('input_features'),
                'input_time_series': analysis_data.get('input_time_series')
            }
            
            result = collection.insert_one(document)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error saving analysis: {e}")
            return None
    
    def get_analysis(self, analysis_id):
        """Retrieve a specific analysis"""
        if not self.is_connected:
            return None
        
        try:
            collection = self.db[Config.MONGODB_COLLECTIONS['analyses']]
            doc = collection.find_one({'_id': ObjectId(analysis_id)})
            if doc:
                doc['_id'] = str(doc['_id'])
            return doc
        except Exception as e:
            print(f"Error retrieving analysis: {e}")
            return None
    
    def get_component_analyses(self, component_id, limit=50):
        """Get all analyses for a component"""
        if not self.is_connected:
            return []
        
        try:
            collection = self.db[Config.MONGODB_COLLECTIONS['analyses']]
            analyses = collection.find({'component_id': component_id}).limit(limit).sort('created_at', -1)
            
            result = []
            for doc in analyses:
                doc['_id'] = str(doc['_id'])
                result.append(doc)
            return result
        except Exception as e:
            print(f"Error retrieving component analyses: {e}")
            return []
    
    def get_recent_analyses(self, limit=50):
        """Get recent analyses across all components"""
        if not self.is_connected:
            return []
        
        try:
            collection = self.db[Config.MONGODB_COLLECTIONS['analyses']]
            analyses = collection.find().limit(limit).sort('created_at', -1)
            
            result = []
            for doc in analyses:
                doc['_id'] = str(doc['_id'])
                result.append(doc)
            return result
        except Exception as e:
            print(f"Error retrieving recent analyses: {e}")
            return []
    
    # ============ STATISTICS OPERATIONS ============
    
    def get_statistics(self):
        """Get database statistics"""
        if not self.is_connected:
            return {}
        
        try:
            components = self.db[Config.MONGODB_COLLECTIONS['components']]
            analyses = self.db[Config.MONGODB_COLLECTIONS['analyses']]
            
            total_components = components.count_documents({})
            total_analyses = analyses.count_documents({})
            
            # Risk distribution
            risk_distribution = analyses.aggregate([
                {'$group': {
                    '_id': '$final_risk.level',
                    'count': {'$sum': 1}
                }}
            ])
            
            risk_dist = {}
            for item in risk_distribution:
                risk_dist[item['_id']] = item['count']
            
            return {
                'total_components': total_components,
                'total_analyses': total_analyses,
                'risk_distribution': risk_dist
            }
        except Exception as e:
            print(f"Error retrieving statistics: {e}")
            return {}
    
    # ============ CLEANUP OPERATIONS ============
    
    def delete_component(self, component_id):
        """Delete a component and related data"""
        if not self.is_connected:
            return False
        
        try:
            # Delete component
            components = self.db[Config.MONGODB_COLLECTIONS['components']]
            components.delete_one({'component_id': component_id})
            
            # Delete related analyses
            analyses = self.db[Config.MONGODB_COLLECTIONS['analyses']]
            analyses.delete_many({'component_id': component_id})
            
            return True
        except Exception as e:
            print(f"Error deleting component: {e}")
            return False
    
    def clear_old_data(self, days=30):
        """Clear analyses older than specified days"""
        if not self.is_connected:
            return 0
        
        try:
            from datetime import timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            analyses = self.db[Config.MONGODB_COLLECTIONS['analyses']]
            result = analyses.delete_many({'created_at': {'$lt': cutoff_date}})
            
            return result.deleted_count
        except Exception as e:
            print(f"Error clearing old data: {e}")
            return 0
