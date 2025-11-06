#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Ascend App
Tests all backend endpoints, authentication, and data integrity
"""

import requests
import json
import os
from datetime import datetime
import sys

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"❌ Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("❌ CRITICAL: Could not get REACT_APP_BACKEND_URL from /app/frontend/.env")
    sys.exit(1)

API_BASE = f"{BACKEND_URL}/api"

print(f"🔵 Testing Backend at: {API_BASE}")
print("=" * 80)

class BackendTester:
    def __init__(self):
        self.results = {
            "service_health": {},
            "authentication": {},
            "user_management": {},
            "promo_system": {},
            "error_handling": {},
            "data_integrity": {}
        }
        self.total_tests = 0
        self.passed_tests = 0
        
    def test_result(self, category, test_name, passed, message, details=None):
        """Record test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"    Details: {details}")
            
        self.results[category][test_name] = {
            "passed": passed,
            "message": message,
            "details": details
        }

    def test_service_health(self):
        """Phase 1: Service Health & Environment"""
        print("\n🔵 PHASE 1: SERVICE HEALTH & ENVIRONMENT")
        print("-" * 50)
        
        # Test 1: Backend server accessibility
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.test_result("service_health", "backend_accessible", True, 
                               f"Backend server responding (v{data.get('version', 'unknown')})")
            else:
                self.test_result("service_health", "backend_accessible", False, 
                               f"Backend returned status {response.status_code}")
        except Exception as e:
            self.test_result("service_health", "backend_accessible", False, 
                           f"Cannot reach backend: {str(e)}")
            return  # Can't continue if backend is down
        
        # Test 2: API endpoints structure
        try:
            response = requests.get(f"{API_BASE}/")
            data = response.json()
            endpoints = data.get('endpoints', {})
            expected_endpoints = ['auth', 'user', 'update', 'promo']
            
            missing = [ep for ep in expected_endpoints if ep not in endpoints]
            if not missing:
                self.test_result("service_health", "api_endpoints", True, 
                               "All expected API endpoints documented")
            else:
                self.test_result("service_health", "api_endpoints", False, 
                               f"Missing endpoints: {missing}")
        except Exception as e:
            self.test_result("service_health", "api_endpoints", False, 
                           f"Error checking endpoints: {str(e)}")

    def test_authentication_flow(self):
        """Phase 2: Authentication Flow (Without Real Google Token)"""
        print("\n🔵 PHASE 2: AUTHENTICATION FLOW")
        print("-" * 50)
        
        # Test 1: Google auth endpoint exists
        try:
            response = requests.post(f"{API_BASE}/auth/google", 
                                   json={"token": "invalid_token"}, 
                                   timeout=10)
            
            # Should return 401 for invalid token, not 404
            if response.status_code in [401, 422]:
                self.test_result("authentication", "google_auth_endpoint", True, 
                               "Google auth endpoint exists and validates tokens")
            elif response.status_code == 404:
                self.test_result("authentication", "google_auth_endpoint", False, 
                               "Google auth endpoint not found (404)")
            else:
                self.test_result("authentication", "google_auth_endpoint", False, 
                               f"Unexpected status code: {response.status_code}")
        except Exception as e:
            self.test_result("authentication", "google_auth_endpoint", False, 
                           f"Error testing auth endpoint: {str(e)}")
        
        # Test 2: Auth response structure validation
        try:
            response = requests.post(f"{API_BASE}/auth/google", 
                                   json={"token": "test_invalid_token"})
            
            if response.status_code == 401:
                error_data = response.json()
                if 'detail' in error_data:
                    self.test_result("authentication", "auth_error_structure", True, 
                                   "Auth endpoint returns proper error structure")
                else:
                    self.test_result("authentication", "auth_error_structure", False, 
                                   "Auth error missing 'detail' field")
            else:
                self.test_result("authentication", "auth_error_structure", False, 
                               f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.test_result("authentication", "auth_error_structure", False, 
                           f"Error testing auth structure: {str(e)}")

    def test_user_management(self):
        """Phase 3: User Data Management (Mock JWT)"""
        print("\n🔵 PHASE 3: USER DATA MANAGEMENT")
        print("-" * 50)
        
        # Test 1: User GET endpoint requires authentication
        try:
            response = requests.get(f"{API_BASE}/user/test_user_id", timeout=10)
            
            if response.status_code in [401, 403]:
                self.test_result("user_management", "user_get_auth_required", True, 
                               "User GET endpoint properly requires authentication")
            elif response.status_code == 422:
                self.test_result("user_management", "user_get_auth_required", True, 
                               "User GET endpoint validates request format")
            else:
                self.test_result("user_management", "user_get_auth_required", False, 
                               f"User GET should require auth, got {response.status_code}")
        except Exception as e:
            self.test_result("user_management", "user_get_auth_required", False, 
                           f"Error testing user GET: {str(e)}")
        
        # Test 2: User UPDATE endpoint requires authentication
        try:
            response = requests.post(f"{API_BASE}/user/update", 
                                   json={"xp": 100}, timeout=10)
            
            if response.status_code in [401, 403]:
                self.test_result("user_management", "user_update_auth_required", True, 
                               "User UPDATE endpoint properly requires authentication")
            elif response.status_code == 422:
                self.test_result("user_management", "user_update_auth_required", True, 
                               "User UPDATE endpoint validates request format")
            else:
                self.test_result("user_management", "user_update_auth_required", False, 
                               f"User UPDATE should require auth, got {response.status_code}")
        except Exception as e:
            self.test_result("user_management", "user_update_auth_required", False, 
                           f"Error testing user UPDATE: {str(e)}")

    def test_promo_system(self):
        """Phase 4: Promo Code System"""
        print("\n🔵 PHASE 4: PROMO CODE SYSTEM")
        print("-" * 50)
        
        # Test 1: Promo redeem endpoint requires authentication
        try:
            response = requests.post(f"{API_BASE}/promo/redeem", 
                                   json={"code": "TEST123"}, timeout=10)
            
            if response.status_code in [401, 403]:
                self.test_result("promo_system", "promo_auth_required", True, 
                               "Promo redeem endpoint properly requires authentication")
            elif response.status_code == 422:
                self.test_result("promo_system", "promo_auth_required", True, 
                               "Promo redeem endpoint validates request format")
            else:
                self.test_result("promo_system", "promo_auth_required", False, 
                               f"Promo redeem should require auth, got {response.status_code}")
        except Exception as e:
            self.test_result("promo_system", "promo_auth_required", False, 
                           f"Error testing promo redeem: {str(e)}")

    def test_error_handling(self):
        """Phase 6: Error Handling"""
        print("\n🔵 PHASE 6: ERROR HANDLING")
        print("-" * 50)
        
        # Test 1: Invalid endpoints return 404
        try:
            response = requests.get(f"{API_BASE}/nonexistent", timeout=10)
            
            if response.status_code == 404:
                self.test_result("error_handling", "invalid_endpoint_404", True, 
                               "Invalid endpoints return 404")
            else:
                self.test_result("error_handling", "invalid_endpoint_404", False, 
                               f"Expected 404 for invalid endpoint, got {response.status_code}")
        except Exception as e:
            self.test_result("error_handling", "invalid_endpoint_404", False, 
                           f"Error testing invalid endpoint: {str(e)}")
        
        # Test 2: Malformed JSON returns 422
        try:
            response = requests.post(f"{API_BASE}/auth/google", 
                                   data="invalid json", 
                                   headers={'Content-Type': 'application/json'},
                                   timeout=10)
            
            if response.status_code == 422:
                self.test_result("error_handling", "malformed_json_422", True, 
                               "Malformed JSON returns 422")
            else:
                self.test_result("error_handling", "malformed_json_422", False, 
                               f"Expected 422 for malformed JSON, got {response.status_code}")
        except Exception as e:
            self.test_result("error_handling", "malformed_json_422", False, 
                           f"Error testing malformed JSON: {str(e)}")

    def check_database_connection(self):
        """Check if MongoDB is accessible and has seeded data"""
        print("\n🔵 DATABASE CONNECTION & SEEDING CHECK")
        print("-" * 50)
        
        try:
            # Try to run the seed script to check DB connection
            import subprocess
            result = subprocess.run([
                'python3', '/app/backend/seed_promos.py'
            ], capture_output=True, text=True, cwd='/app/backend', timeout=30)
            
            if result.returncode == 0:
                self.test_result("data_integrity", "database_connection", True, 
                               "MongoDB connection successful and promo codes seeded")
                print(f"    Seed output: {result.stdout.strip()}")
            else:
                self.test_result("data_integrity", "database_connection", False, 
                               f"Database seeding failed: {result.stderr}")
        except Exception as e:
            self.test_result("data_integrity", "database_connection", False, 
                           f"Error checking database: {str(e)}")

    def run_all_tests(self):
        """Run all test phases"""
        print(f"🚀 STARTING COMPREHENSIVE BACKEND TESTING")
        print(f"📍 Backend URL: {BACKEND_URL}")
        print(f"📍 API Base: {API_BASE}")
        print("=" * 80)
        
        # Run test phases
        self.test_service_health()
        self.test_authentication_flow()
        self.test_user_management()
        self.test_promo_system()
        self.test_error_handling()
        self.check_database_connection()
        
        # Print summary
        print("\n" + "=" * 80)
        print("🏁 BACKEND TESTING SUMMARY")
        print("=" * 80)
        
        print(f"📊 Tests Passed: {self.passed_tests}/{self.total_tests}")
        print(f"📊 Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        
        # Print detailed results by category
        for category, tests in self.results.items():
            if tests:  # Only show categories with tests
                print(f"\n📋 {category.upper().replace('_', ' ')}:")
                for test_name, result in tests.items():
                    status = "✅" if result['passed'] else "❌"
                    print(f"  {status} {test_name}: {result['message']}")
        
        return self.results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()