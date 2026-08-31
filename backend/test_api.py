#!/usr/bin/env python3
"""
Test script for ISRO-ReliAI Backend API
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_root():
    """Test root endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Root Endpoint (GET /)")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Health Check (GET /health)")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_anomaly_valid():
    """Test anomaly detection with valid input"""
    print("\n" + "="*60)
    print("TEST 3: Module A - Anomaly Detection (Valid Input)")
    print("="*60)
    try:
        payload = {
            "features": [1.2, 2.3, 3.4, 4.5, 5.6, 6.7, 7.8, 8.9, 9.1, 10.2, 11.3, 12.4, 13.5, 14.6, 15.7, 16.8]
        }
        response = requests.post(f"{BASE_URL}/api/anomaly", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 200 or response.status_code == 503
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_anomaly_invalid():
    """Test anomaly detection with invalid input"""
    print("\n" + "="*60)
    print("TEST 4: Module A - Anomaly Detection (Invalid Input - wrong count)")
    print("="*60)
    try:
        payload = {
            "features": [1.2, 2.3, 3.4]  # Only 3 features, need 16
        }
        response = requests.post(f"{BASE_URL}/api/anomaly", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_drift_valid():
    """Test drift prediction with valid input"""
    print("\n" + "="*60)
    print("TEST 5: Module B - Drift Prediction (Valid Input)")
    print("="*60)
    try:
        payload = {
            "time_series": [
                [1.0, 2.0, 3.0, 4.0],
                [1.1, 2.1, 3.1, 4.1],
                [1.2, 2.2, 3.2, 4.2],
                [1.3, 2.3, 3.3, 4.3]
            ]
        }
        response = requests.post(f"{BASE_URL}/api/drift-prediction", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_drift_invalid():
    """Test drift prediction with invalid input"""
    print("\n" + "="*60)
    print("TEST 6: Module B - Drift Prediction (Invalid Shape)")
    print("="*60)
    try:
        payload = {
            "time_series": [
                [1.0, 2.0, 3.0],  # Only 3 features, need 4
                [1.1, 2.1, 3.1]
            ]
        }
        response = requests.post(f"{BASE_URL}/api/drift-prediction", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_analyze():
    """Test combined analysis endpoint"""
    print("\n" + "="*60)
    print("TEST 7: Combined Analysis (POST /api/analyze)")
    print("="*60)
    try:
        payload = {
            "component_id": "COMP-001",
            "features": [1.2, 2.3, 3.4, 4.5, 5.6, 6.7, 7.8, 8.9, 9.1, 10.2, 11.3, 12.4, 13.5, 14.6, 15.7, 16.8],
            "time_series": [
                [1.0, 2.0, 3.0, 4.0],
                [1.1, 2.1, 3.1, 4.1],
                [1.2, 2.2, 3.2, 4.2],
                [1.3, 2.3, 3.3, 4.3]
            ]
        }
        response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        # Show simplified output
        if 'final_risk' in data:
            print(f"Component ID: {data.get('component_id')}")
            print(f"Final Risk Level: {data['final_risk'].get('level')}")
            print(f"Recommendation: {data['final_risk'].get('recommendation')}")
        print(f"\nFull Response:\n{json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == '__main__':
    print("\n" + "="*60)
    print("ISRO-ReliAI Backend API Test Suite")
    print("="*60)
    
    results = []
    
    try:
        results.append(("Root Endpoint", test_root()))
        results.append(("Health Check", test_health()))
        results.append(("Anomaly (Valid)", test_anomaly_valid()))
        results.append(("Anomaly (Invalid)", test_anomaly_invalid()))
        results.append(("Drift Prediction (Valid)", test_drift_valid()))
        results.append(("Drift Prediction (Invalid)", test_drift_invalid()))
        results.append(("Combined Analysis", test_analyze()))
    except Exception as e:
        print(f"\nFatal error during testing: {e}")
        import traceback
        traceback.print_exc()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    passed_count = sum(1 for _, p in results if p)
    total_count = len(results)
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
