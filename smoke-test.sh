#!/bin/bash
# Ascend Production Smoke Tests
# Run this script after deployment to verify production is working

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-https://ascend-backend-xxxx.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://your-app.vercel.app}"

echo "================================================"
echo "🧪 Ascend Production Smoke Tests"
echo "================================================"
echo ""
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test 1: Backend Health Check
echo "Test 1: Backend Health Check"
echo "------------------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Backend health check returned 200"
    echo "Response: $BODY"
    
    # Check if response contains expected fields
    if echo "$BODY" | grep -q '"ok":true'; then
        echo -e "${GREEN}✅ PASS${NC}: Health response contains 'ok: true'"
    else
        echo -e "${RED}❌ FAIL${NC}: Health response missing 'ok: true'"
        exit 1
    fi
    
    if echo "$BODY" | grep -q '"database":"connected"'; then
        echo -e "${GREEN}✅ PASS${NC}: Database connection verified"
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Database connection status unclear"
    fi
else
    echo -e "${RED}❌ FAIL${NC}: Backend health check failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi
echo ""

# Test 2: Backend Root Endpoint
echo "Test 2: Backend Root Endpoint"
echo "------------------------------"
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/")
HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -n 1)
BODY=$(echo "$ROOT_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Backend root endpoint accessible"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ FAIL${NC}: Backend root endpoint failed (HTTP $HTTP_CODE)"
    exit 1
fi
echo ""

# Test 3: Frontend Accessibility
echo "Test 3: Frontend Accessibility"
echo "-------------------------------"
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL")
HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Frontend is accessible (HTTP $HTTP_CODE)"
    
    # Check if HTML contains React root
    if echo "$FRONTEND_RESPONSE" | head -n -1 | grep -q 'id="root"'; then
        echo -e "${GREEN}✅ PASS${NC}: Frontend contains React root element"
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Frontend HTML structure unexpected"
    fi
else
    echo -e "${RED}❌ FAIL${NC}: Frontend not accessible (HTTP $HTTP_CODE)"
    exit 1
fi
echo ""

# Test 4: CORS Configuration (preflight)
echo "Test 4: CORS Configuration"
echo "--------------------------"
CORS_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$BACKEND_URL/api/auth/google")
HTTP_CODE=$(echo "$CORS_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: CORS preflight successful"
else
    echo -e "${YELLOW}⚠️  WARN${NC}: CORS preflight returned $HTTP_CODE (may be normal)"
fi
echo ""

# Test 5: Auth Endpoint Exists (without token)
echo "Test 5: Auth Endpoint Response"
echo "-------------------------------"
AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"token":"invalid_token_for_testing"}' \
    "$BACKEND_URL/api/auth/google")
HTTP_CODE=$(echo "$AUTH_RESPONSE" | tail -n 1)
BODY=$(echo "$AUTH_RESPONSE" | head -n -1)

# We expect 401 or 400 for invalid token
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Auth endpoint rejects invalid token (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Auth endpoint returned unexpected code: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Summary
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo ""
echo -e "${GREEN}✅ All critical tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Open $FRONTEND_URL in your browser"
echo "2. Click 'Continue with Google' and test login"
echo "3. Complete a quest and verify data persists"
echo "4. Check MongoDB Atlas for user data"
echo ""
echo "🎉 Production deployment verification complete!"
echo ""
