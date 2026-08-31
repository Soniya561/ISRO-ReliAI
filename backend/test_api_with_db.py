"""
Test suite for API endpoints with MongoDB integration
"""
import requests
import json
import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv()

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Test health endpoint"""
    print("\n✓ Testing GET /health...")
    response = requests.get(f"{BASE_URL}/../health")
    print(f"  Status: {response.status_code}")
    print(f"  Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_db_status():
    """Test database status endpoint"""
    print("\n✓ Testing GET /db-status...")
    response = requests.get(f"{BASE_URL}/db-status")
    print(f"  Status: {response.status_code}")
    print(f"  Response: {json.dumps(response.json(), indent=2)}")

def test_anomaly_detection():
    """Test anomaly detection endpoint"""
    print("\n✓ Testing POST /anomaly...")
    payload = {
        "features": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0]
    }
    response = requests.post(f"{BASE_URL}/anomaly", json=payload)
    print(f"  Status: {response.status_code}")
    print(f"  Response: {json.dumps(response.json(), indent=2)[:500]}...")

def test_drift_prediction():
    """Test drift prediction endpoint"""
    print("\n✓ Testing POST /drift-prediction...")
    payload = {
        "time_series": [
            [1.0, 2.0, 3.0, 4.0],
            [2.0, 3.0, 4.0, 5.0],
            [3.0, 4.0, 5.0, 6.0],
            [4.0, 5.0, 6.0, 7.0]
        ]
    }
    response = requests.post(f"{BASE_URL}/drift-prediction", json=payload)
    print(f"  Status: {response.status_code}")
    print(f"  Response: {json.dumps(response.json(), indent=2)[:500]}...")

def test_combined_analysis():
    """Test combined analysis endpoint"""
    print("\n✓ Testing POST /analyze (Combined)...")
    payload = {
        "component_id": "TEST-COMP-001",
        "features": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0],
        "time_series": [
            [1.0, 2.0, 3.0, 4.0],
            [2.0, 3.0, 4.0, 5.0],
            [3.0, 4.0, 5.0, 6.0],
            [4.0, 5.0, 6.0, 7.0]
        ]
    }
    response = requests.post(f"{BASE_URL}/analyze", json=payload)
    print(f"  Status: {response.status_code}")
    data = response.json()
    print(f"  Component ID: {data.get('component_id')}")
    print(f"  Analysis ID: {data.get('analysis_id')}")
    print(f"  Risk Level: {data.get('final_risk', {}).get('level')}")
    
    return response.status_code == 200, data.get('analysis_id')

def test_get_components():
    """Test get components endpoint"""
    print("\n✓ Testing GET /components...")
    response = requests.get(f"{BASE_URL}/components")
    print(f"  Status: {response.status_code}")
    data = response.json()
    print(f"  Count: {data.get('count')}")
    if data.get('components'):
        print(f"  First component: {data['components'][0].get('component_id')}")

def test_get_recent_analyses():
    """Test get recent analyses endpoint"""
    print("\n✓ Testing GET /analyses...")
    response = requests.get(f"{BASE_URL}/analyses")
    print(f"  Status: {response.status_code}")
    data = response.json()
    print(f"  Count: {data.get('count')}")
    
    return response.status_code in [200, 503]

def test_statistics():
    """Test statistics endpoint"""
    print("\n✓ Testing GET /statistics...")
    response = requests.get(f"{BASE_URL}/statistics")
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        print(f"  Response: {json.dumps(response.json(), indent=2)[:300]}...")

if __name__ == "__main__":
    print("=" * 60)
    print("API Test Suite with MongoDB Integration")
    print("=" * 60)
    
    print("\n[1/8] Testing Health Endpoint...")
    test_health()
    
    print("\n[2/8] Testing Database Status...")
    test_db_status()
    
    print("\n[3/8] Testing Anomaly Detection...")
    test_anomaly_detection()
    
    print("\n[4/8] Testing Drift Prediction...")
    test_drift_prediction()
    
    print("\n[5/8] Testing Combined Analysis...")
    success, analysis_id = test_combined_analysis()
    
    print("\n[6/8] Testing Get Components...")
    test_get_components()
    
    print("\n[7/8] Testing Get Recent Analyses...")
    test_get_recent_analyses()
    
    print("\n[8/8] Testing Statistics...")
    test_statistics()
    
    print("\n" + "=" * 60)
    print("✓ Test Suite Complete")
    print("=" * 60)
